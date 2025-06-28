import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Shopier may perform a GET request to validate the callback URL
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Shopier callback URL is active.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      platform_order_id,
      status,
      payment_id,
      installment,
      random_nr,
      signature
    } = req.body;

    // API secret for signature verification
    const apiSecret = process.env.SHOPIER_API_SECRET || '5ae98d8858ff0eec7ed72b0d3657268a';

    if (!platform_order_id || !status || !random_nr || !signature) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Verify signature
    const dataToVerify = random_nr + platform_order_id;
    const expectedSignature = crypto
      .createHmac('SHA256', apiSecret)
      .update(dataToVerify)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error('Shopier signature verification failed', {
        expected: expectedSignature,
        received: signature,
        data: dataToVerify
      });
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Process payment result
    if (status.toLowerCase() === 'success') {
      // Extract user ID from order ID (format: BORSA2_timestamp_userId)
      const orderParts = platform_order_id.split('_');
      const userId = orderParts[2];
      
      if (!userId) {
        console.error('Could not extract user ID from order:', platform_order_id);
        return res.status(400).json({ message: 'Invalid order ID format' });
      }

      // Determine plan type from order ID or amount
      // You might want to store this information in a database
      // For now, we'll determine from the order timestamp and make an educated guess
      const planType = platform_order_id.includes('monthly') ? 'monthly' : 'yearly';

      try {
        // Here you would update the user's membership in your database
        // For now, we'll use localStorage simulation approach
        
        console.log('Shopier payment successful:', {
          orderId: platform_order_id,
          userId,
          paymentId: payment_id,
          installment,
          planType
        });

        // In a real application, you would:
        // 1. Update user membership in database
        // 2. Send confirmation email
        // 3. Log the transaction
        
        // Success response to Shopier
        return res.status(200).json({
          status: 'OK',
          message: 'Payment processed successfully'
        });

      } catch (error) {
        console.error('Error updating user membership:', error);
        return res.status(500).json({ message: 'Database update failed' });
      }

    } else {
      // Payment failed
      console.log('Shopier payment failed:', {
        orderId: platform_order_id,
        status,
        error: req.body.error_message
      });

      return res.status(200).json({
        status: 'FAILED',
        message: 'Payment failed'
      });
    }

  } catch (error) {
    console.error('Shopier callback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Callback processing failed'
    });
  }
} 