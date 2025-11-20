import { pool } from '../db';
import { Order, OrderStatus } from '../types';

export async function insertOrder(order: Order) {
  await pool.query(
    'INSERT INTO orders(id, payload, status, created_at, updated_at) VALUES($1,$2,$3,now(),now())',
    [order.id, order, 'pending']
  );
}

export async function updateOrderStatus(id: string, status: OrderStatus, lastError?: string) {
  await pool.query('UPDATE orders SET status=$1, updated_at=now(), last_error=$2 WHERE id=$3', [status, lastError || null, id]);
}

export async function getOrder(id: string) {
  const res = await pool.query('SELECT * FROM orders WHERE id=$1', [id]);
  return res.rows[0];
}
