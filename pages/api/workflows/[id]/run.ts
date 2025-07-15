import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

// Simple in-memory queue for demo purposes
const runQueue: any[] = [];
let isProcessing = false;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { params = {} } = req.body;

    // Get workflow
    const workflowResult = await sql`
      SELECT * FROM t_workflow WHERE id = ${id as string} AND del_flag = false
    `;

    if (workflowResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Create workflow run record
    const runId = uuidv4();
    const workflowRun = {
      id: runId,
      workflow_id: id,
      params: JSON.stringify(params),
      start_date: new Date(),
      end_date: null,
      run_type: 'manual',
      state: 'queued',
      profit: JSON.stringify({ amount: 0, percentage: 0 })
    };

    await sql`
      INSERT INTO t_workflow_run (id, workflow_id, params, start_date, run_type, state, profit) 
      VALUES (${runId}, ${id as string}, ${workflowRun.params}, ${workflowRun.start_date}, ${workflowRun.run_type}, ${workflowRun.state}, ${workflowRun.profit})
    `;

    // Add to queue
    runQueue.push({
      runId,
      workflowId: id,
      workflow: workflowResult.rows[0],
      params
    });

    // Start processing if not already running
    if (!isProcessing) {
      processQueue();
    }

    res.status(200).json({
      id: runId,
      workflowId: id,
      state: 'queued',
      startDate: workflowRun.start_date
    });
  } catch (error) {
    console.error('Run workflow error:', error);
    res.status(500).json({ error: 'Failed to start workflow run' });
  }
}

async function processQueue() {
  isProcessing = true;

  while (runQueue.length > 0) {
    const job = runQueue.shift();
    await executeWorkflow(job);
  }

  isProcessing = false;
}

async function executeWorkflow(job: any) {
  const { runId, workflowId, workflow, params } = job;

  try {
    // Update state to running
    await sql`
      UPDATE t_workflow_run SET state = 'running' WHERE id = ${runId}
    `;

    const flowJson = workflow.flow_json;
    const nodes = flowJson?.nodes || [];
    
    // Simulate workflow execution
    let totalProfit = 0;
    const nodeStates: any = {};

    for (const node of nodes) {
      nodeStates[node.id] = {
        status: 'running',
        logs: [`Executing ${node.type} node...`]
      };

      // Simulate node execution based on type
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time

      switch (node.type) {
        case 'start':
          nodeStates[node.id] = {
            status: 'success',
            logs: ['Workflow started successfully']
          };
          break;

        case 'listener':
          // Mock data fetching
          const mockData = await mockDataFetch(node.data?.type);
          nodeStates[node.id] = {
            status: 'success',
            logs: [
              `Fetched data from ${node.data?.type}`,
              `Data points: ${mockData.length}`,
              'Data processing completed'
            ]
          };
          break;

        case 'evaluator':
          // Mock AI evaluation
          const evaluation = await mockAIEvaluation(node.data);
          nodeStates[node.id] = {
            status: 'success',
            logs: [
              'AI analysis started',
              `Confidence: ${evaluation.confidence}`,
              `Recommendation: ${evaluation.action}`,
              'Analysis completed'
            ]
          };
          break;

        case 'executor':
          // Mock trade execution
          const tradeResult = await mockTradeExecution(node.data);
          totalProfit += tradeResult.profit;
          nodeStates[node.id] = {
            status: tradeResult.success ? 'success' : 'failed',
            logs: [
              'Trade execution started',
              `Amount: $${tradeResult.amount}`,
              `Profit: $${tradeResult.profit}`,
              tradeResult.success ? 'Trade completed successfully' : 'Trade failed'
            ]
          };
          break;

        case 'collector':
          // Mock result collection
          nodeStates[node.id] = {
            status: 'success',
            logs: [
              'Collecting trade results',
              `Total profit: $${totalProfit}`,
              'Results collected successfully'
            ]
          };
          break;

        case 'end':
          nodeStates[node.id] = {
            status: 'success',
            logs: ['Workflow completed successfully']
          };
          break;
      }
    }

    // Update final state
    const finalState = Object.values(nodeStates).some((state: any) => state.status === 'failed') ? 'failed' : 'success';
    const profitData = {
      amount: totalProfit,
      percentage: totalProfit > 0 ? (totalProfit / 1000) * 100 : 0 // Mock percentage calculation
    };

    await sql`
      UPDATE t_workflow_run SET state = ${finalState}, end_date = NOW(), profit = ${JSON.stringify(profitData)} 
      WHERE id = ${runId}
    `;

  } catch (error) {
    console.error('Workflow execution error:', error);
    
    await sql`
      UPDATE t_workflow_run SET state = 'failed', end_date = NOW() WHERE id = ${runId}
    `;
  }
}

// Mock functions
async function mockDataFetch(type: string) {
  await new Promise(resolve => setTimeout(resolve, 500));
  return Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, i) => ({
    id: i,
    data: `Mock data from ${type}`
  }));
}

async function mockAIEvaluation(config: any) {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    action: Math.random() > 0.5 ? 'buy' : 'sell',
    confidence: Math.random() * 0.4 + 0.6 // 0.6 to 1.0
  };
}

async function mockTradeExecution(config: any) {
  await new Promise(resolve => setTimeout(resolve, 1200));
  const success = Math.random() > 0.1; // 90% success rate
  return {
    success,
    amount: Math.random() * 1000 + 100,
    profit: success ? Math.random() * 100 + 10 : -(Math.random() * 50 + 5)
  };
}