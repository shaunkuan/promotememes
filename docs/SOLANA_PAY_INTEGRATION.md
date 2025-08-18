# Solana Pay Integration Guide

## Overview

This project now uses **Solana Pay** for handling payments instead of manual transaction creation. Solana Pay provides a standardized way to handle payments that works across all Solana wallets.

## Features Implemented

### ✅ Backend Integration
- **Solana Pay URL Generation**: Creates standardized payment URLs
- **Real Payment Verification**: Validates transactions on-chain
- **Reference Tracking**: Uses unique references for each payment
- **Balance Checking**: Verifies wallet balances before payment

### ✅ Frontend Integration
- **Solana Pay Button Component**: Dedicated component for payment processing
- **Payment Window Management**: Opens Solana Pay URLs in popup windows
- **Payment Status Tracking**: Monitors payment completion
- **Error Handling**: Comprehensive error handling and user feedback

## Configuration

### Environment Variables

Create a `.env` file in the backend directory with:

```env
# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PAYMENT_ADDRESS=YOUR_SOLANA_WALLET_ADDRESS_HERE

# Other configurations...
```

### Required Setup

1. **Set Payment Address**: Replace `YOUR_SOLANA_WALLET_ADDRESS_HERE` with your actual Solana wallet address
2. **RPC Endpoint**: Use mainnet or devnet RPC URL as needed
3. **Network**: Ensure frontend and backend use the same network

## How It Works

### 1. Payment Request Creation
```javascript
// Backend creates Solana Pay URL
const paymentRequest = await solanaPayment.createPaymentRequest(
  amount, 
  reference, 
  label, 
  message
);
```

### 2. Frontend Payment Flow
```javascript
// Frontend opens Solana Pay URL
const paymentWindow = window.open(paymentUrl, '_blank');
```

### 3. Payment Verification
```javascript
// Backend verifies payment on-chain
const verification = await solanaPayment.verifyPayment(
  signature,
  senderAddress,
  expectedAmount,
  reference
);
```

## API Endpoints

### Create Payment Request
```
POST /api/wallet/create-payment-request
{
  "plan": "Basic|Advanced",
  "reference": "unique_payment_reference"
}
```

### Validate Payment
```
POST /api/wallet/validate-payment
{
  "from": "sender_address",
  "to": "recipient_address", 
  "amount": 0.1,
  "signature": "transaction_signature",
  "plan": "Basic|Advanced",
  "reference": "payment_reference"
}
```

### Check Balance
```
GET /api/wallet/balance/:address
GET /api/wallet/check-balance/:address/:plan
```

## Benefits of Solana Pay

1. **Standardized**: Works with all Solana wallets
2. **Secure**: On-chain verification of all payments
3. **User-Friendly**: Native wallet integration
4. **Cross-Platform**: Works on mobile and desktop
5. **Reference Tracking**: Unique identifiers for each payment

## Testing

### Testnet Setup
For testing, use:
- **RPC URL**: `https://api.devnet.solana.com`
- **Test SOL**: Get from Solana faucet
- **Test Wallet**: Use Phantom devnet wallet

### Payment Flow Testing
1. Connect wallet
2. Verify token
3. Select plan
4. Click "Pay with Solana Pay"
5. Approve payment in wallet
6. Verify promotion creation

## Troubleshooting

### Common Issues

1. **Payment Timeout**: Increase timeout in `SolanaPayButton.tsx`
2. **RPC Errors**: Check network connectivity and RPC endpoint
3. **Balance Issues**: Ensure sufficient SOL for payment + fees
4. **Reference Mismatch**: Verify reference encoding/decoding

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Payment Address**: Use dedicated wallet for payments
3. **RPC Security**: Use trusted RPC endpoints
4. **Transaction Verification**: Always verify on-chain
5. **Reference Validation**: Validate payment references

## Future Enhancements

- [ ] SPL Token support
- [ ] Payment status webhooks
- [ ] Multi-signature support
- [ ] Payment analytics
- [ ] Automated refunds
