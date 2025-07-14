import { NextApiRequest, NextApiResponse } from 'next';
import { gumroadService } from '@/services/gumroadService';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.GUMROAD_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-gumroad-signature'] as string;
      const body = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { buyer_email, product_id, sale_id, resource_name, action } = req.body;

    console.log('Gumroad webhook received:', {
      action,
      resource_name,
      buyer_email,
      product_id,
      sale_id
    });

    // Handle different webhook events
    switch (action) {
      case 'sale':
        // Handle successful payment
        console.log(`New sale: ${buyer_email} purchased ${product_id}`);
        // You can add user to database, send welcome email, etc.
        break;

      case 'refund':
        // Handle refund
        console.log(`Refund processed for: ${buyer_email}, product: ${product_id}`);
        // Remove user access, update database, etc.
        break;

      case 'dispute':
        // Handle dispute
        console.log(`Dispute opened for: ${buyer_email}, product: ${product_id}`);
        break;

      case 'cancellation':
        // Handle subscription cancellation
        console.log(`Subscription cancelled for: ${buyer_email}, product: ${product_id}`);
        break;

      default:
        console.log(`Unhandled webhook action: ${action}`);
    }

    // Always respond with 200 to acknowledge receipt
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
