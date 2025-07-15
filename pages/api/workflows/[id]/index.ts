import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const result = await sql`
        SELECT * FROM t_workflow WHERE id = ${id as string} AND del_flag = false
      `;

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      const row = result.rows[0];
      const workflow = {
        id: row.id,
        name: row.name,
        nodes: row.flow_json?.nodes || [],
        connections: row.flow_json?.connections || [],
        status: row.flow_json?.status || 'draft',
        createdAt: row.create_at,
        updatedAt: row.update_at,
      };

      res.status(200).json(workflow);
    } else if (req.method === 'PUT') {
      const { name, nodes, connections, status } = req.body;
      
      const flowJson = { nodes, connections, status };
      
      const result = await sql`
        UPDATE t_workflow SET name = ${name}, flow_json = ${JSON.stringify(flowJson)}, update_at = NOW() 
        WHERE id = ${id as string} AND del_flag = false 
        RETURNING *
      `;

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      const workflow = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        nodes,
        connections,
        status,
        createdAt: result.rows[0].create_at,
        updatedAt: result.rows[0].update_at,
      };

      res.status(200).json(workflow);
    } else if (req.method === 'DELETE') {
      await sql`
        UPDATE t_workflow SET del_flag = true WHERE id = ${id as string}
      `;

      res.status(200).json({ message: 'Workflow deleted successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database operation failed', details: error.message });
  }
}