export type Side = 'BUY' | 'SELL';

export interface OrderCreate {
  symbol: string;
  qty: number;
  side: Side;
  type: 'market' | 'limit';
  session_id?: string;
}

export interface Order {
  id: string;
  client_order_id: string;
  status: string;
  symbol: string;
  qty: string;
  side: Side;
  filled_avg_price?: string;
  created_at: string;
}
