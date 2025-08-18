const express = require('express');
const router = express.Router();

// Simple payment page that displays properly in popup windows
router.get('/pay', (req, res) => {
  const { recipient, amount, reference, label, message } = req.query;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solana Payment</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .payment-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            max-width: 400px;
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .amount {
            font-size: 3rem;
            font-weight: bold;
            margin: 20px 0;
            color: #4ade80;
        }
        .label {
            font-size: 1.2rem;
            margin-bottom: 10px;
            opacity: 0.9;
        }
        .message {
            font-size: 0.9rem;
            opacity: 0.7;
            margin-bottom: 30px;
        }
        .recipient {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 0.8rem;
            word-break: break-all;
            margin: 20px 0;
        }
        .pay-button {
            background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
            width: 100%;
        }
        .pay-button:hover {
            transform: translateY(-2px);
        }
        .close-button {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 15px;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="payment-card">
        <div class="label">${label || 'Payment Request'}</div>
        <div class="amount">${(amount / 1000000000).toFixed(2)} SOL</div>
        <div class="message">${message || 'Please complete this payment'}</div>
        
        <div class="recipient">
            To: ${recipient}
        </div>
        
        <button class="pay-button" onclick="initiatePayment()">
            Pay with Solana Wallet
        </button>
        
        <button class="close-button" onclick="window.close()">
            Cancel
        </button>
    </div>

    <script>
        function initiatePayment() {
            const recipient = '${recipient}';
            const amount = '${amount}';
            const reference = '${reference || ''}';
            const label = '${label || ''}';
            
            // Show manual payment instructions immediately
            const instructions = document.createElement('div');
            instructions.innerHTML = \`
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-top: 20px; border: 1px solid rgba(255,255,255,0.3);">
                    <h3 style="margin-top: 0; color: #4ade80;">📱 Payment Instructions:</h3>
                    <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p><strong>Amount:</strong> <span style="color: #4ade80; font-size: 1.1em;">\${(amount / 1000000000).toFixed(2)} SOL</span></p>
                        <p><strong>To Address:</strong></p>
                        <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px; font-family: monospace; font-size: 0.8em; word-break: break-all;">
                            \${recipient}
                        </div>
                        <p><strong>Reference:</strong> \${reference}</p>
                    </div>
                    <p style="margin-bottom: 0; font-size: 0.9em; opacity: 0.8;">
                        💡 <strong>How to pay:</strong> Open your Solana wallet (Phantom, Solflare, etc.) and send \${(amount / 1000000000).toFixed(2)} SOL to the address above. Include the reference in the memo if possible.
                    </p>
                </div>
            \`;
            
            // Replace the button with instructions
            const button = document.querySelector('.pay-button');
            button.style.display = 'none';
            document.querySelector('.payment-card').appendChild(instructions);
            
            // Add a "Payment Complete" button
            const completeButton = document.createElement('button');
            completeButton.className = 'pay-button';
            completeButton.style.marginTop = '15px';
            completeButton.textContent = '✅ Payment Complete - Close Window';
            completeButton.onclick = () => {
                // Send message to parent window that payment is complete
                if (window.opener) {
                    window.opener.postMessage({ type: 'PAYMENT_COMPLETE', reference: reference }, '*');
                }
                window.close();
            };
            document.querySelector('.payment-card').appendChild(completeButton);
        }
        
        // Listen for messages from parent window
        window.addEventListener('message', function(event) {
            if (event.data.type === 'PAYMENT_COMPLETE') {
                window.close();
            }
        });
        
        // Auto-close after 5 minutes
        setTimeout(() => {
            window.close();
        }, 300000);
    </script>
</body>
</html>`;

  res.send(html);
});

module.exports = router;
