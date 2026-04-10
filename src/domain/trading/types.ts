export type Side = 'BUY' | 'SELL';

export interface OrderCreate {
  symbol: string;
  qty: number;
  side: Side;
  type: 'market' | 'limit';
  session_id?: string;
  time_in_force?: 'gtc' | 'day' | 'ioc' | 'fok';
}

export interface TradeOrderResponse {
  status: string;
  order_id?: string;
  error?: string;
}
