const { Connection, PublicKey, LAMPORTS_PER_SOL, SystemProgram } = require('@solana/web3.js');
// Solana Pay URL generation - using proper format for wallet popups
function createSolanaPayUrl(recipient, amount, reference, label, message) {
    // Create a simple payment page URL that wallets can handle
    const baseUrl = 'http://localhost:3001/pay';
    const params = new URLSearchParams();
    
    params.append('recipient', recipient);
    params.append('amount', amount.toString());
    if (reference) params.append('reference', reference);
    if (label) params.append('label', label);
    if (message) params.append('message', message);
    
    return `${baseUrl}?${params.toString()}`;
}
const dotenv = require('dotenv');

dotenv.config();

const SOLANA_PAYMENT_ADDRESS = process.env.SOLANA_PAYMENT_ADDRESS;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

if (!SOLANA_PAYMENT_ADDRESS) {
    console.error("SOLANA_PAYMENT_ADDRESS is not set in .env. Payments will not be verifiable.");
}

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

/**
 * Creates a Solana Pay transfer request URL
 * @param {number} amount - Amount in SOL
 * @param {string} reference - Unique reference for this payment
 * @param {string} label - Payment label
 * @param {string} message - Payment message
 * @returns {Promise<{success: boolean, error?: string, data?: Object}>}
 */
async function createPaymentRequest(amount, reference, label = 'MemeCoin Promotion', message = 'Payment for promotion services') {
    if (!SOLANA_PAYMENT_ADDRESS) {
        return { success: false, error: 'Payment system not configured. Please set SOLANA_PAYMENT_ADDRESS.' };
    }

    try {
        const recipient = new PublicKey(SOLANA_PAYMENT_ADDRESS);
        const amountInLamports = Math.floor(amount * LAMPORTS_PER_SOL);

        const transferRequestUrl = createSolanaPayUrl(
            SOLANA_PAYMENT_ADDRESS,
            amountInLamports,
            reference,
            label,
            message
        );

        console.log('🔗 Created Solana Pay URL for payment:', {
            amount: amount + ' SOL',
            reference,
            recipient: SOLANA_PAYMENT_ADDRESS
        });

        return {
            success: true,
            data: {
                paymentUrl: transferRequestUrl,
                amount,
                recipient: SOLANA_PAYMENT_ADDRESS,
                reference,
                label,
                message
            }
        };

    } catch (error) {
        console.error('❌ Error creating payment request:', error);
        return { success: false, error: `Failed to create payment request: ${error.message}` };
    }
}

/**
 * Validates a Solana payment transaction on-chain.
 * @param {string} signature - The transaction signature.
 * @param {string} senderAddress - The public key of the sender.
 * @param {number} expectedAmount - The expected amount in SOL.
 * @param {string} reference - The expected reference for this payment.
 * @returns {Promise<{success: boolean, error?: string, data?: Object}>}
 */
async function verifyPayment(signature, senderAddress, expectedAmount, reference = null) {
    if (!SOLANA_PAYMENT_ADDRESS) {
        return { success: false, error: 'Payment system not configured. Please set SOLANA_PAYMENT_ADDRESS.' };
    }

    try {
        console.log('🔍 Verifying Solana payment...');
        console.log('📝 Signature:', signature.substring(0, 20) + '...');
        console.log('👤 From:', senderAddress.substring(0, 10) + '...');
        console.log('💰 Expected:', expectedAmount, 'SOL');
        console.log('🎯 To:', SOLANA_PAYMENT_ADDRESS.substring(0, 10) + '...');
        if (reference) console.log('🏷️ Reference:', reference);

        const senderPubKey = new PublicKey(senderAddress);
        const recipientPubKey = new PublicKey(SOLANA_PAYMENT_ADDRESS);

        // Fetch transaction details with retry logic
        let transaction;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                transaction = await connection.getTransaction(signature, {
                    commitment: 'confirmed',
                    maxSupportedTransactionVersion: 0
                });
                break;
            } catch (error) {
                retryCount++;
                console.log(`Retry ${retryCount}/${maxRetries} for transaction fetch:`, error.message);
                if (retryCount >= maxRetries) {
                    throw new Error(`Failed to fetch transaction after ${maxRetries} attempts: ${error.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            }
        }

        if (!transaction) {
            console.log('❌ Transaction not found for signature:', signature);
            return { success: false, error: 'Transaction not found or not yet confirmed.' };
        }

        // Check transaction status
        const status = transaction.meta?.err;
        if (status) {
            console.log('❌ Transaction failed with error:', JSON.stringify(status));
            return { success: false, error: `Transaction failed on-chain: ${JSON.stringify(status)}` };
        }

        // Verify the transfer instruction
        const transferInstruction = transaction.transaction.message.compiledInstructions.find(
            ix => ix.programIdIndex === transaction.transaction.message.staticAccountKeys.findIndex(
                key => key.equals(SystemProgram.programId)
            )
        );

        if (!transferInstruction) {
            console.log('❌ No SystemProgram transfer instruction found in transaction:', signature);
            return { success: false, error: 'No SOL transfer instruction found in transaction.' };
        }

        // Decode the transfer instruction
        const decodedInstruction = SystemProgram.decodeTransfer(transferInstruction);

        // Verify sender, recipient, and amount
        if (!decodedInstruction.fromPubkey.equals(senderPubKey)) {
            console.log('❌ Sender mismatch. Expected:', senderPubKey.toBase58(), 'Got:', decodedInstruction.fromPubkey.toBase58());
            return { success: false, error: 'Sender address mismatch.' };
        }

        if (!decodedInstruction.toPubkey.equals(recipientPubKey)) {
            console.log('❌ Recipient mismatch. Expected:', recipientPubKey.toBase58(), 'Got:', decodedInstruction.toPubkey.toBase58());
            return { success: false, error: 'Recipient address mismatch.' };
        }

        const transferredAmountSOL = decodedInstruction.lamports / LAMPORTS_PER_SOL;
        const amountTolerance = 0.00001; // Allow for tiny variations due to fees or floating point
        if (Math.abs(transferredAmountSOL - expectedAmount) > amountTolerance) {
            console.log('❌ Amount mismatch. Expected:', expectedAmount, 'SOL, Got:', transferredAmountSOL, 'SOL');
            return { success: false, error: `Payment amount mismatch. Expected ${expectedAmount} SOL, received ${transferredAmountSOL} SOL.` };
        }

        // Verify reference if provided
        if (reference) {
            const transactionReference = transaction.meta?.postTokenBalances?.find(
                balance => balance.owner === SOLANA_PAYMENT_ADDRESS
            );
            
            if (transactionReference) {
                const referenceData = transactionReference.mint;
                const expectedReference = Buffer.from(reference, 'utf-8');
                if (!referenceData || !expectedReference.equals(Buffer.from(referenceData, 'base64'))) {
                    console.log('❌ Reference mismatch');
                    return { success: false, error: 'Payment reference mismatch.' };
                }
            }
        }

        console.log('✅ Payment validated successfully for signature:', signature);
        console.log('💰 Amount received:', transferredAmountSOL, 'SOL');
        console.log('📝 Transaction:', signature);
        
        return { 
            success: true,
            data: {
                signature,
                fromAddress: senderAddress,
                toAddress: SOLANA_PAYMENT_ADDRESS,
                amount: transferredAmountSOL,
                confirmed: true,
                timestamp: transaction.blockTime,
                reference: reference
            }
        };

    } catch (error) {
        console.error('❌ Error validating payment:', error);
        return { success: false, error: `Payment validation failed: ${error.message}` };
    }
}

/**
 * Get account balance
 * @param {string} address - Wallet address
 * @returns {Promise<number>} Balance in SOL
 */
async function getBalance(address) {
    try {
        const pubkey = new PublicKey(address);
        const balance = await connection.getBalance(pubkey);
        return balance / LAMPORTS_PER_SOL;
    } catch (error) {
        console.error('Error getting balance:', error);
        return 0;
    }
}

/**
 * Check if an address has sufficient balance
 * @param {string} address - Wallet address
 * @param {number} requiredAmount - Required amount in SOL
 * @returns {Promise<boolean>} Whether address has sufficient balance
 */
async function hasSufficientBalance(address, requiredAmount) {
    const balance = await getBalance(address);
    return balance >= requiredAmount;
}

/**
 * Parse a Solana Pay URL to extract payment details
 * @param {string} url - Solana Pay URL
 * @returns {Promise<{success: boolean, error?: string, data?: Object}>}
 */
async function parsePaymentUrl(url) {
    try {
        // Simple URL parsing for Solana Pay URLs
        const urlObj = new URL(url.replace('solana:', 'https://'));
        const recipient = urlObj.hostname;
        const params = urlObj.searchParams;
        
        const parsed = {
            recipient,
            amount: params.get('amount') ? parseInt(params.get('amount')) : null,
            reference: params.get('reference'),
            label: params.get('label'),
            message: params.get('message')
        };
        
        return {
            success: true,
            data: {
                recipient: parsed.recipient.toBase58(),
                amount: parsed.amount ? parsed.amount / LAMPORTS_PER_SOL : null,
                reference: parsed.reference ? Buffer.from(parsed.reference).toString('utf-8') : null,
                label: parsed.label,
                message: parsed.message,
                splToken: parsed.splToken
            }
        };
    } catch (error) {
        console.error('❌ Error parsing payment URL:', error);
        return { success: false, error: `Failed to parse payment URL: ${error.message}` };
    }
}

module.exports = {
    createPaymentRequest,
    verifyPayment,
    getBalance,
    hasSufficientBalance,
    parsePaymentUrl,
};
