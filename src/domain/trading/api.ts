import { CONFIG } from '../../config/constants';
import { Order, OrderCreate } from './types';

const API_BASE = CONFIG.BACKEND_BASE_URL;

export const tradingApi = {
  /**
   * placeOrder
   * 
   * Unified endpoint for Alpaca-integrated order placement. 
   * If session_id is provided, the backend can automatically associate this trade 
   * with the active supervision session for replay auditing.
   */
  placeOrder: async (data: OrderCreate): Promise<Order> => {
    const response = await fetch(`${API_BASE}/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to place order';
      try {
        const err = await response.json();
        errorMessage = err.detail || errorMessage;
      } catch (e) {
        // Fallback if not JSON
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  }
};
