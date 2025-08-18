const express = require('express');
const router = express.Router();
const solanaPayment = require('../services/solanaPayment');

// Create Solana Pay payment request
router.post('/create-payment-request', async (req, res) => {
  const { plan, reference } = req.body;
  
  if (!plan || !['Basic', 'Advanced'].includes(plan)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid plan. Must be Basic or Advanced'
    });
  }

  if (!reference) {
    return res.status(400).json({
      success: false,
      error: 'Payment reference is required'
    });
  }

  const amount = plan === 'Basic' ? 0.1 : 0.5;
  const label = `MemeCoin Promotion - ${plan} Plan`;
  const message = `Payment for ${plan} promotion services`;
  
  try {
    const paymentRequest = await solanaPayment.createPaymentRequest(
      amount, 
      reference, 
      label, 
      message
    );

    if (!paymentRequest.success) {
      return res.status(500).json({
        success: false,
        error: paymentRequest.error
      });
    }

    res.json({
      success: true,
      data: {
        paymentUrl: paymentRequest.data.paymentUrl,
        amount,
        currency: 'SOL',
        plan,
        reference,
        label,
        message
      }
    });
  } catch (error) {
    console.error('Error creating payment request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment request'
    });
  }
});

// Validate Solana payment with real blockchain verification
router.post('/validate-payment', async (req, res) => {
  const { from, to, amount, signature, plan, reference } = req.body;
  
  if (!from || !to || !amount || !signature || !plan) {
    return res.status(400).json({
      success: false,
      error: 'All payment details are required'
    });
  }

  // Validate amount based on plan
  const expectedAmount = plan === 'Basic' ? 0.1 : 0.5;
  
  if (amount !== expectedAmount) {
    return res.status(400).json({
      success: false,
      error: `Invalid payment amount. Expected ${expectedAmount} SOL for ${plan} plan`
    });
  }

  try {
    // REAL PAYMENT VERIFICATION - Check actual Solana transaction
    const paymentVerification = await solanaPayment.verifyPayment(
      signature,
      from,
      expectedAmount,
      reference
    );

    if (!paymentVerification.success) {
      return res.status(402).json({
        success: false,
        error: paymentVerification.error || 'Payment verification failed'
      });
    }

    console.log('✅ Payment verified on-chain!');
    console.log('💰 Amount received:', paymentVerification.data.amount, 'SOL');
    console.log('📝 Transaction:', paymentVerification.data.signature);

    res.json({
      success: true,
      data: {
        transactionId: paymentVerification.data.signature,
        amount: paymentVerification.data.amount,
        plan,
        status: 'confirmed',
        fromAddress: paymentVerification.data.fromAddress,
        toAddress: paymentVerification.data.toAddress,
        timestamp: paymentVerification.data.timestamp,
        reference: paymentVerification.data.reference
      }
    });
  } catch (error) {
    console.error('Error validating payment:', error);
    res.status(500).json({
      success: false,
      error: 'Payment validation failed: ' + error.message
    });
  }
});

// Simplified payment verification for direct wallet transactions
router.post('/verify-transaction', async (req, res) => {
  const { signature, fromAddress, amount, plan } = req.body;
  
  if (!signature || !fromAddress || !amount || !plan) {
    return res.status(400).json({
      success: false,
      error: 'Transaction signature, sender address, amount, and plan are required'
    });
  }

  const expectedAmount = plan === 'Basic' ? 0.1 : 0.5;
  
  try {
    // Verify the transaction on-chain
    const paymentVerification = await solanaPayment.verifyPayment(
      signature,
      fromAddress,
      expectedAmount
    );

    if (!paymentVerification.success) {
      return res.status(402).json({
        success: false,
        error: paymentVerification.error || 'Transaction verification failed'
      });
    }

    console.log('✅ Transaction verified on-chain!');
    console.log('💰 Amount received:', paymentVerification.data.amount, 'SOL');
    console.log('📝 Transaction:', paymentVerification.data.signature);

    res.json({
      success: true,
      data: {
        signature: paymentVerification.data.signature,
        amount: paymentVerification.data.amount,
        fromAddress: paymentVerification.data.fromAddress,
        toAddress: paymentVerification.data.toAddress,
        confirmed: true,
        timestamp: paymentVerification.data.timestamp
      }
    });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Transaction verification failed: ' + error.message
    });
  }
});

// Get payment address and amount for plans
router.get('/payment-address/:plan', async (req, res) => {
  const { plan } = req.params;
  
  if (!plan || !['Basic', 'Advanced'].includes(plan)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid plan. Must be Basic or Advanced'
    });
  }

  const amount = plan === 'Basic' ? 0.1 : 0.5;
  
  if (!process.env.SOLANA_PAYMENT_ADDRESS) {
    return res.status(500).json({
      success: false,
      error: 'Payment system not configured'
    });
  }

  res.json({
    success: true,
    data: {
      address: process.env.SOLANA_PAYMENT_ADDRESS,
      amount,
      currency: 'SOL',
      plan
    }
  });
});

// Check wallet balance
router.get('/balance/:address', async (req, res) => {
  const { address } = req.params;
  
  if (!address) {
    return res.status(400).json({
      success: false,
      error: 'Wallet address is required'
    });
  }

  try {
    const balance = await solanaPayment.getBalance(address);
    
    res.json({
      success: true,
      data: {
        address,
        balance,
        currency: 'SOL'
      }
    });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wallet balance'
    });
  }
});

// Get recent blockhash
router.get('/blockhash', async (req, res) => {
  try {
    const { Connection } = require('@solana/web3.js');
    const connection = new Connection('https://solana-mainnet.rpc.extrnode.com', 'confirmed');
    const { blockhash } = await connection.getLatestBlockhash();
    
    res.json({
      success: true,
      blockhash
    });
  } catch (error) {
    console.error('Error getting blockhash:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent blockhash'
    });
  }
});

// Check if wallet has sufficient balance for a plan
router.get('/check-balance/:address/:plan', async (req, res) => {
  const { address, plan } = req.params;
  
  if (!address || !plan || !['Basic', 'Advanced'].includes(plan)) {
    return res.status(400).json({
      success: false,
      error: 'Valid wallet address and plan are required'
    });
  }

  const requiredAmount = plan === 'Basic' ? 0.1 : 0.5;

  try {
    const hasBalance = await solanaPayment.hasSufficientBalance(address, requiredAmount);
    const currentBalance = await solanaPayment.getBalance(address);
    
    res.json({
      success: true,
      data: {
        address,
        currentBalance,
        requiredAmount,
        hasSufficientBalance: hasBalance,
        plan
      }
    });
  } catch (error) {
    console.error('Error checking balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check wallet balance'
    });
  }
});

module.exports = router;
