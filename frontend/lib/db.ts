import { Pool } from 'pg';

// 创建PostgreSQL连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// 创建一个类似@vercel/postgres的sql模板函数
export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  const query = strings.reduce((result, string, i) => {
    return result + string + (values[i] ? `$${i + 1}` : '');
  }, '');
  
  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    return result;
  } finally {
    client.release();
  }
};

// Initialize database tables if they don't exist
export async function initializeDatabase() {
  try {
    // Create workflows table
    await sql`
      CREATE TABLE IF NOT EXISTS t_workflow (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        flow_json JSONB NOT NULL,
        create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        del_flag BOOLEAN DEFAULT FALSE
      );
    `;

    // Create workflow runs table
    await sql`
      CREATE TABLE IF NOT EXISTS t_workflow_run (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID NOT NULL,
        params JSONB DEFAULT '{}',
        start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        end_date TIMESTAMP WITH TIME ZONE,
        run_type VARCHAR(50) NOT NULL CHECK (run_type IN ('manual', 'scheduled')),
        state VARCHAR(50) NOT NULL CHECK (state IN ('queued', 'running', 'success', 'failed')),
        profit JSONB DEFAULT '{"amount": 0, "percentage": 0}',
        node_states JSONB DEFAULT '{}'
      );
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_workflow_create_at ON t_workflow(create_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_workflow_del_flag ON t_workflow(del_flag);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_workflow_run_workflow_id ON t_workflow_run(workflow_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_workflow_run_start_date ON t_workflow_run(start_date);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_workflow_run_state ON t_workflow_run(state);`;

    console.debug('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}