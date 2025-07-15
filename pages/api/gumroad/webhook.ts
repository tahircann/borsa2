import { NextApiRequest, NextApiResponse } from 'next';
import { gumroadService } from '@/services/gumroadService';
import crypto from 'crypto';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.GUMROAD_WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret !== 'your_webhook_secret_here') {
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

    const { 
      buyer_email, 
      product_id, 
      product_name,
      sale_id, 
      resource_name, 
      action,
      price,
      recurrence 
    } = req.body;

    console.log('🎣 Gumroad webhook received:', {
      action,
      resource_name,
      buyer_email,
      product_id,
      product_name,
      price,
      recurrence,
      sale_id
    });

    // Handle different webhook events
    switch (action) {
      case 'sale':
        // Handle successful payment - grant premium membership
        console.log(`💰 New sale: ${buyer_email} purchased ${product_name} (${price})`);
        
        // Determine membership type based on product or recurrence
        let membershipType: 'monthly' | 'yearly' = 'monthly';
        if (recurrence && recurrence.includes('year')) {
          membershipType = 'yearly';
        } else if (product_name && product_name.toLowerCase().includes('year')) {
          membershipType = 'yearly';
        }
        
        // Update membership via API
        try {
          const baseUrl = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          await axios.post(`${baseUrl}/api/membership/update`, {
            email: buyer_email,
            membershipType,
            action: 'grant',
            gumroadData: {
              sale_id,
              product_id,
              product_name,
              price,
              recurrence,
              purchaseDate: new Date().toISOString()
            }
          });
          
          console.log(`✅ Premium membership granted to ${buyer_email}`);
        } catch (error) {
          console.error('Failed to update membership:', error);
        }
        break;

      case 'refund':
        // Handle refund - revoke premium membership
        console.log(`🔄 Refund processed for: ${buyer_email}, product: ${product_name}`);
        
        try {
          const baseUrl = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          await axios.post(`${baseUrl}/api/membership/update`, {
            email: buyer_email,
            action: 'revoke'
          });
          
          console.log(`❌ Premium membership revoked for ${buyer_email}`);
        } catch (error) {
          console.error('Failed to revoke membership:', error);
        }
        break;

      case 'dispute':
        // Handle dispute - temporarily revoke access
        console.log(`⚠️ Dispute opened for: ${buyer_email}, product: ${product_name}`);
        
        try {
          const baseUrl = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          await axios.post(`${baseUrl}/api/membership/update`, {
            email: buyer_email,
            action: 'revoke'
          });
          
          console.log(`⚠️ Premium membership suspended for ${buyer_email} due to dispute`);
        } catch (error) {
          console.error('Failed to suspend membership:', error);
        }
        break;

      case 'cancellation':
        // Handle subscription cancellation
        console.log(`🚫 Subscription cancelled for: ${buyer_email}, product: ${product_name}`);
        // Note: Usually you'd let them keep access until expiry, but you can revoke immediately if needed
        break;

      default:
        console.log(`❓ Unhandled webhook action: ${action}`);
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
