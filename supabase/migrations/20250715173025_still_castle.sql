-- Create database schema for AI Trading Platform

-- Workflows table
CREATE TABLE IF NOT EXISTS t_workflow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    flow_json JSONB NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    del_flag BOOLEAN DEFAULT FALSE
);

-- Workflow runs table
CREATE TABLE IF NOT EXISTS t_workflow_run (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES t_workflow(id),
    params JSONB DEFAULT '{}',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    run_type VARCHAR(50) NOT NULL CHECK (run_type IN ('manual', 'scheduled')),
    state VARCHAR(50) NOT NULL CHECK (state IN ('queued', 'running', 'success', 'failed')),
    profit JSONB DEFAULT '{"amount": 0, "percentage": 0}',
    node_states JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflow_create_at ON t_workflow(create_at);
CREATE INDEX IF NOT EXISTS idx_workflow_del_flag ON t_workflow(del_flag);
CREATE INDEX IF NOT EXISTS idx_workflow_run_workflow_id ON t_workflow_run(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_run_start_date ON t_workflow_run(start_date);
CREATE INDEX IF NOT EXISTS idx_workflow_run_state ON t_workflow_run(state);

-- Sample data
INSERT INTO t_workflow (name, flow_json) VALUES 
('ETH Arbitrage Strategy', '{
  "nodes": [
    {
      "id": "start-1",
      "type": "start",
      "position": {"x": 100, "y": 200},
      "data": {"name": "Start"},
      "inputs": [],
      "outputs": ["trigger"]
    },
    {
      "id": "listener-1", 
      "type": "listener",
      "position": {"x": 300, "y": 200},
      "data": {
        "name": "Twitter Listener",
        "type": "twitter",
        "accounts": ["elonmusk", "VitalikButerin"],
        "keywords": ["ETH", "Ethereum"]
      },
      "inputs": ["trigger"],
      "outputs": ["data"]
    },
    {
      "id": "end-1",
      "type": "end", 
      "position": {"x": 500, "y": 200},
      "data": {"name": "End"},
      "inputs": ["result"],
      "outputs": []
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "source": "start-1",
      "target": "listener-1", 
      "sourceOutput": "trigger",
      "targetInput": "trigger"
    }
  ],
  "status": "draft"
}')
ON CONFLICT DO NOTHING;