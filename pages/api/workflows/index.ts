import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import { initializeDatabase } from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Initialize database on first request
    await initializeDatabase();
    
    if (req.method === 'GET') {
      const result = await sql`
        SELECT * FROM t_workflow WHERE del_flag = false ORDER BY create_at DESC
      `;
      
      const workflows = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        nodes: row.flow_json?.nodes || [],
        connections: row.flow_json?.connections || [],
        status: row.flow_json?.status || 'draft',
        createdAt: row.create_at,
        updatedAt: row.update_at,
      }));

      res.status(200).json(workflows);
    } else if (req.method === 'POST') {
      const { name, nodes, connections, status } = req.body;
      
      const flowJson = { nodes, connections, status };
      
      const result = await sql`
        INSERT INTO t_workflow (name, flow_json, create_at, update_at, del_flag) 
        VALUES (${name}, ${JSON.stringify(flowJson)}, NOW(), NOW(), false) 
        RETURNING *
      `;

      const workflow = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        nodes,
        connections,
        status,
        createdAt: result.rows[0].create_at,
        updatedAt: result.rows[0].update_at,
      };

      res.status(201).json(workflow);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database operation failed', details: error.message });
  }
}