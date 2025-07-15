import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await sql`
      SELECT * FROM t_workflow_run WHERE workflow_id = ${id as string} ORDER BY start_date DESC
    `;

    const runs = result.rows.map(row => ({
      id: row.id,
      workflowId: row.workflow_id,
      startDate: row.start_date,
      endDate: row.end_date,
      runType: row.run_type,
      state: row.state,
      profit: JSON.parse(row.profit || '{"amount": 0, "percentage": 0}'),
      params: JSON.parse(row.params || '{}'),
      nodeStates: JSON.parse(row.node_states || '{}')
    }));

    res.status(200).json(runs);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch workflow runs', details: error.message });
  }
}