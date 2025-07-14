import axios from 'axios';

const GUMROAD_API_BASE = 'https://api.gumroad.com/v2';

export interface GumroadProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  formatted_price: string;
  short_url: string;
  is_tiered_membership: boolean;
  recurrences?: string[];
}

export interface GumroadSubscriber {
  id: string;
  product_id: string;
  product_name: string;
  user_id: string;
  user_email: string;
  created_at: string;
  recurrence: string;
  status: 'alive' | 'pending_cancellation' | 'pending_failure' | 'failed_payment' | 'cancelled';
  cancelled_at?: string;
  ended_at?: string;
}

export interface GumroadSale {
  id: string;
  email: string;
  product_name: string;
  price: number;
  created_at: string;
  subscription_id?: string;
  cancelled: boolean;
  ended: boolean;
  recurrence?: string;
}

class GumroadService {
  private accessToken: string;

  constructor() {
    this.accessToken = process.env.GUMROAD_ACCESS_TOKEN || '';
    if (!this.accessToken) {
      console.warn('⚠️ GUMROAD_ACCESS_TOKEN not set');
    }
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    try {
      const response = await axios.get(`${GUMROAD_API_BASE}${endpoint}`, {
        params: {
          access_token: this.accessToken,
          ...params
        },
        timeout: 10000
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Gumroad API request failed');
      }

      return response.data;
    } catch (error) {
      console.error(`Gumroad API error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all products
  async getProducts(): Promise<GumroadProduct[]> {
    const data = await this.makeRequest('/products');
    return data.products || [];
  }

  // Get specific product
  async getProduct(productId: string): Promise<GumroadProduct> {
    const data = await this.makeRequest(`/products/${productId}`);
    return data.product;
  }

  // Get subscribers for a product
  async getSubscribers(productId: string, paginated = true): Promise<GumroadSubscriber[]> {
    const data = await this.makeRequest(`/products/${productId}/subscribers`, {
      paginated: paginated.toString()
    });
    return data.subscribers || [];
  }

  // Get subscriber details
  async getSubscriber(subscriberId: string): Promise<GumroadSubscriber> {
    const data = await this.makeRequest(`/subscribers/${subscriberId}`);
    return data.subscriber;
  }

  // Check if user has active subscription
  async hasActiveSubscription(email: string, productId?: string): Promise<boolean> {
    try {
      if (productId) {
        const subscribers = await this.getSubscribers(productId);
        return subscribers.some(sub => 
          sub.user_email === email && 
          sub.status === 'alive'
        );
      } else {
        // Check across all products
        const products = await this.getProducts();
        for (const product of products) {
          if (product.is_tiered_membership) {
            const subscribers = await this.getSubscribers(product.id);
            const hasActive = subscribers.some(sub => 
              sub.user_email === email && 
              sub.status === 'alive'
            );
            if (hasActive) return true;
          }
        }
        return false;
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  // Get sales data
  async getSales(params: {
    after?: string;
    before?: string;
    email?: string;
    product_id?: string;
  } = {}): Promise<GumroadSale[]> {
    const data = await this.makeRequest('/sales', params);
    return data.sales || [];
  }

  // Subscribe to webhooks
  async subscribeToWebhook(resourceName: string, postUrl: string) {
    try {
      const response = await axios.put(`${GUMROAD_API_BASE}/resource_subscriptions`, {
        access_token: this.accessToken,
        resource_name: resourceName,
        post_url: postUrl
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to subscribe to webhook');
      }

      return response.data.resource_subscription;
    } catch (error) {
      console.error('Error subscribing to webhook:', error);
      throw error;
    }
  }

  // Generate payment link for a product
  getPaymentLink(productId: string, customerEmail?: string): string {
    const product = this.getProduct(productId);
    // Note: This would need the actual short_url from the product
    // For now returning a placeholder - you'd get this from getProduct()
    return `https://gumroad.com/l/${productId}${customerEmail ? `?email=${customerEmail}` : ''}`;
  }

  // Verify a purchase/license
  async verifyLicense(productId: string, licenseKey: string): Promise<any> {
    try {
      const response = await axios.post(`${GUMROAD_API_BASE}/licenses/verify`, {
        product_id: productId,
        license_key: licenseKey
      });

      return response.data;
    } catch (error) {
      console.error('Error verifying license:', error);
      throw error;
    }
  }
}

export const gumroadService = new GumroadService();
export default gumroadService;
