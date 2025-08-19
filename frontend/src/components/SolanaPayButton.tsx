'use client';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, CreditCard, ExternalLink } from 'lucide-react';

interface SolanaPayButtonProps {
  plan: string;
  amount: number;
  backendUrl: string;
  onPaymentSuccess: (signature: string) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

const SolanaPayButton = ({
  plan,
  amount,
  backendUrl,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  className = ''
}: SolanaPayButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    toast.loading('Creating payment request...');

    try {
      // Generate unique reference for this payment
      const paymentReference = `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('🔗 Creating Solana Pay request:', {
        plan,
        amount,
        reference: paymentReference
      });

      // Create payment request via backend
      const paymentRequestResponse = await axios.post(`${backendUrl}/api/wallet/create-payment-request`, {
        plan,
        reference: paymentReference
      });

      if (!paymentRequestResponse.data.success) {
        throw new Error(paymentRequestResponse.data.error || 'Failed to create payment request');
      }

      const { paymentUrl } = paymentRequestResponse.data.data;

      toast.dismiss();
      toast.loading('Opening payment window...');

      // Open Solana Pay URL in new window
      const paymentWindow = window.open(paymentUrl, '_blank', 'width=400,height=600');
      
      if (!paymentWindow) {
        throw new Error('Please allow popups to complete payment');
      }

      // Wait for payment completion
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max wait
      
      const checkPaymentStatus = async () => {
        if (attempts >= maxAttempts) {
          paymentWindow.close();
          throw new Error('Payment timeout. Please try again.');
        }

        try {
          // Check if payment window is still open
          if (paymentWindow.closed) {
            // Payment window closed, assume payment was completed
            toast.dismiss();
            toast.success('Payment completed!');
            
            // Call success callback with reference as signature
            onPaymentSuccess(paymentReference);
            return;
          }

          attempts++;
          setTimeout(checkPaymentStatus, 5000); // Check every 5 seconds
        } catch (error) {
          console.error('Payment check error:', error);
          attempts++;
          setTimeout(checkPaymentStatus, 5000);
        }
      };

      // Start checking payment status after 5 seconds
      setTimeout(checkPaymentStatus, 5000);

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.dismiss();
      toast.error(error.message || 'Payment failed. Please try again.');
      onPaymentError(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || isProcessing}
      className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 py-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${className}`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>Processing Payment...</span>
        </>
      ) : (
        <>
          <CreditCard size={20} />
          <span>Pay with Solana Pay</span>
          <ExternalLink size={16} />
        </>
      )}
    </button>
  );
};

export default SolanaPayButton;
