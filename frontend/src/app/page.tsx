'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import SolanaPayButton from '../components/SolanaPayButton';

interface RecentPromotion {
  id: number;
  symbol: string;
  name: string;
  marketCap: string;
  time: string;
  plan: string;
  status: string;
  platforms: string[];
  icon: string | null;
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col items-center justify-center">
    <Loader2 className="animate-spin text-blue-400 mb-4" size={48} />
    <p className="text-xl font-semibold">Loading application...</p>
    <p className="text-gray-400 text-sm mt-2">Initializing Solana wallet and services.</p>
  </div>
);

const Home = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [tokenVerificationError, setTokenVerificationError] = useState('');

  const [twitterHandle, setTwitterHandle] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promotionError, setPromotionError] = useState('');
  const [promotionSuccess, setPromotionSuccess] = useState<any>(null);

  const [recentPromotions, setRecentPromotions] = useState<RecentPromotion[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [promotionStats, setPromotionStats] = useState({ totalPromoted: 0, activeUsers: 0, todayPromotions: 0 });

  const [isClient, setIsClient] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchRecentPromotions = useCallback(async () => {
    setIsLoadingRecent(true);
    try {
      const response = await axios.get(`${backendUrl}/api/promotions/recent?t=${Date.now()}`);
      if (response.data.success) {
        setRecentPromotions(response.data.data);
      } else {
        toast.error('Failed to load recent promotions.');
      }
    } catch (error) {
      console.error('Error fetching recent promotions:', error);
      toast.error('Failed to connect to promotion service.');
    } finally {
      setIsLoadingRecent(false);
    }
  }, []);

  const fetchPromotionStats = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/promotions/stats`);
      if (response.data.success) {
        setPromotionStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching promotion stats:', error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchRecentPromotions();
      fetchPromotionStats();
    }
  }, [isClient, fetchRecentPromotions, fetchPromotionStats]);

  const handleTokenAddressChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setTokenAddress(address);
    setTokenInfo(null);
    setTokenVerificationError('');

    if (address.length > 30) {
      setIsVerifyingToken(true);
      try {
        const response = await axios.post(`${backendUrl}/api/tokens/verify`, { tokenAddress: address });
        if (response.data.success) {
          setTokenInfo(response.data.data);
          toast.success(`Token Verified: ${response.data.data.name} (${response.data.data.symbol})`);
              } else {
          setTokenVerificationError(response.data.error || 'Failed to verify token.');
          toast.error(response.data.error || 'Failed to verify token.');
        }
      } catch (error) {
        console.error('Token verification API error:', error);
        setTokenVerificationError('Failed to connect to token verification service.');
        toast.error('Failed to connect to token verification service.');
      } finally {
        setIsVerifyingToken(false);
      }
    }
  }, []);

  // Function to generate gradient initials for fallback
  const generateGradientInitials = (symbol: string) => {
    const colors = [
      'from-purple-500 to-blue-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-pink-500 to-purple-500',
      'from-blue-500 to-indigo-500',
      'from-yellow-500 to-orange-500'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return (
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${randomColor} flex items-center justify-center text-white font-bold text-sm`}>
        {symbol.substring(0, 2).toUpperCase()}
      </div>
    );
  };

  if (!isClient) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <Toaster />
      {/* Alert Bar */}
      <div className="bg-green-600 text-white text-center py-3 font-semibold">
        ✅ Servers online, promotion mechanism available
      </div>

      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          Promote Your Meme Coin on Solana
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Get your token seen by thousands across X, Discord, and Telegram.
        </p>
        <div className="flex justify-center space-x-8 mb-12">
          <div className="text-center">
            <p className="text-4xl font-bold text-green-400">{promotionStats.totalPromoted}+</p>
            <p className="text-gray-400">Tokens Promoted</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-400">{promotionStats.activeUsers}+</p>
            <p className="text-gray-400">Active Users</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-400">{promotionStats.todayPromotions}+</p>
            <p className="text-gray-400">Today's Promotions</p>
          </div>
        </div>
        <a
          href="#promote"
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:from-purple-700 hover:to-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Get Started Now
        </a>
      </header>

      {/* Recent Promotions Feed */}
      <section className="py-16 bg-gray-900/50 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Recent Promotions</h2>
            <button
              onClick={fetchRecentPromotions}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
              disabled={isLoadingRecent}
            >
              {isLoadingRecent ? <Loader2 className="animate-spin mr-2" size={18} /> : <RefreshCw className="mr-2" size={18} />}
              {isLoadingRecent ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingRecent ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              recentPromotions.map((promo) => (
                <div key={promo.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center space-x-4 mb-3">
                    {promo.icon ? (
                      <div className="relative">
                        <Image
                          src={promo.icon}
                          alt={`${promo.name} icon`}
                          width={40}
                          height={40}
                          className="rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallbackDiv) fallbackDiv.style.display = 'flex';
                          }}
                        />
                        <div className="hidden">
                          {generateGradientInitials(promo.symbol)}
                        </div>
                      </div>
                    ) : (
                      generateGradientInitials(promo.symbol)
                    )}
                    <div className="flex-1">
                      <p className="text-lg font-semibold">{promo.name}</p>
                      <p className="text-gray-400 text-sm">{promo.symbol}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm">MCap: {promo.marketCap}</p>
                    <p className="text-gray-500 text-xs">{promo.time}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${
                        promo.plan === 'Basic' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {promo.plan}
                      </span>
                      <span className="text-gray-400 text-xs">{promo.status}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Promotion Form Section */}
      <section id="promote" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Promote Your Meme Coin</h2>
          <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-gray-700">

            <form>
              {/* Token Address Input */}
              <div className="mb-6">
                <label htmlFor="tokenAddress" className="block text-white font-semibold mb-2">Solana Token Address</label>
                <input
                  type="text"
                  id="tokenAddress"
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 79R6qbuH3whS4YEcLEmUBiu7NWkExFnx1GBjiDSWtPSc"
                  value={tokenAddress}
                  onChange={handleTokenAddressChange}
                  required
                />
                {isVerifyingToken && (
                  <p className="text-blue-400 mt-2 flex items-center">
                    <Loader2 className="animate-spin mr-2" size={16} /> Verifying token...
                  </p>
                )}
                {tokenVerificationError && (
                  <p className="text-red-400 mt-2 flex items-center">
                    <XCircle className="mr-2" size={16} /> {tokenVerificationError}
                  </p>
                )}
                {tokenInfo && !tokenVerificationError && (
                  <div className="bg-green-700/30 border border-green-600 rounded-lg p-3 mt-4">
                    <p className="text-green-300 font-semibold flex items-center">
                      <CheckCircle className="mr-2" size={16} /> Token Verified:
                    </p>
                    <p className="text-white ml-6">Name: {tokenInfo.name} ({tokenInfo.symbol})</p>
                    <p className="text-white ml-6">Market Cap: {tokenInfo.marketCap}</p>
                    <p className="text-white ml-6">Price: {tokenInfo.price}</p>
                  </div>
                )}
              </div>

              {/* Twitter Handle Input */}
              <div className="mb-6">
                <label htmlFor="twitterHandle" className="block text-white font-semibold mb-2">Twitter Handle (Optional)</label>
                <input
                  type="text"
                  id="twitterHandle"
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., @YourMemeCoin"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                />
              </div>

              {/* Choose Plan */}
              <div className="mb-8">
                <label className="block text-white font-semibold mb-4">Choose Your Plan</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPlan === 'Basic'
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-gray-600 hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedPlan('Basic')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">Basic</h4>
                      <span className="text-green-400 font-bold">0.1 SOL</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">Quick promotion in 10 minutes</p>
                    <div className="flex items-center text-gray-400 text-xs">
                      ⏱️ 10 minutes
                    </div>
                  </div>
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPlan === 'Advanced'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedPlan('Advanced')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">Advanced</h4>
                      <span className="text-blue-400 font-bold">0.5 SOL</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">Extended promotion over 3 hours</p>
                    <div className="flex items-center text-gray-400 text-xs">
                      🚀 3 hours
                    </div>
                  </div>
                </div>
              </div>

              {/* Solana Pay Button */}
              <SolanaPayButton
                plan={selectedPlan}
                amount={selectedPlan === 'Basic' ? 0.1 : 0.5}
                backendUrl={backendUrl}
                onPaymentSuccess={async (signature) => {
                  try {
                    // Submit promotion details to backend
                    const promotionResponse = await axios.post(`${backendUrl}/api/promotions/create`, {
                      tokenAddress,
                      plan: selectedPlan,
                      twitterHandle,
                      paymentSignature: signature,
                      amount: selectedPlan === 'Basic' ? 0.1 : 0.5
                    });

                    if (promotionResponse.data.success) {
                      setPromotionSuccess(promotionResponse.data.data);
                      toast.success('Promotion submitted successfully!');
                      setTokenAddress('');
                      setTokenInfo(null);
                      setTwitterHandle('');
                      setSelectedPlan('Basic');
                      fetchRecentPromotions();
                      fetchPromotionStats();
                    } else {
                      throw new Error(promotionResponse.data.error || 'Failed to submit promotion');
                    }
                  } catch (error: any) {
                    console.error('Promotion submission error:', error);
                    toast.error(error.message || 'Failed to submit promotion');
                    setPromotionError(error.message || 'Failed to submit promotion');
                  }
                }}
                onPaymentError={(error) => {
                  setPromotionError(error);
                }}
                disabled={!tokenInfo}
                className="w-full font-bold py-4 px-6 rounded-lg transition-all duration-200"
              />

              {promotionError && (
                <p className="text-red-400 text-center mt-4">{promotionError}</p>
              )}
              {promotionSuccess && (
                <div className="bg-green-700/30 border border-green-600 rounded-lg p-4 mt-4 text-center">
                  <p className="text-green-300 font-semibold flex items-center justify-center">
                    <CheckCircle className="mr-2" size={20} /> Promotion Successful!
                  </p>
                  <p className="text-white text-sm mt-2">Your token "{promotionSuccess.tokenInfo?.name || 'Unknown'}" has been scheduled for promotion.</p>
                  <p className="text-white text-sm">Plan: {promotionSuccess.plan} ({promotionSuccess.price} SOL)</p>
                  <p className="text-white text-sm">Estimated time: {promotionSuccess.estimatedTime}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-400">
          © 2024 MemeCoin Promoter. Built for the Solana ecosystem.
        </p>
      </footer>
    </div>
  );
};

export default Home;
