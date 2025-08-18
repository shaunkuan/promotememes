# 🚀 Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare your production environment variables

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub with the following structure:
```
promotememes-clone/
├── backend/          # Backend service
├── frontend/         # Frontend service
├── railway.json      # Railway config
└── Procfile         # Process file
```

## Step 2: Deploy Backend

1. **Go to Railway Dashboard**
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository**
5. **Select the `backend` directory as the source**
6. **Set Environment Variables**:
   ```
   PORT=3001
   NODE_ENV=production
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   SOLANA_PAYMENT_ADDRESS=C44TV5sV67m3aQtANFN8tSuUTypvf14eBnrCVHv4gsKY
   FRONTEND_URL=https://your-frontend-domain.railway.app
   ```

## Step 3: Deploy Frontend

1. **In the same project, click "New Service"**
2. **Select "Deploy from GitHub repo"**
3. **Choose your repository again**
4. **Select the `frontend` directory as the source**
5. **Set Environment Variables**:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.railway.app
   ```

## Step 4: Update URLs

1. **Get your backend URL** from Railway dashboard
2. **Update frontend environment variable**:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.railway.app
   ```
3. **Update backend CORS** with your frontend URL:
   ```
   FRONTEND_URL=https://your-frontend-domain.railway.app
   ```

## Step 5: Test Deployment

1. **Visit your frontend URL**
2. **Test the payment flow**
3. **Check backend health**: `https://your-backend-domain.railway.app/health`

## Environment Variables Reference

### Backend Variables
- `PORT`: Server port (Railway sets this automatically)
- `NODE_ENV`: Set to "production"
- `SOLANA_RPC_URL`: Solana mainnet RPC URL
- `SOLANA_PAYMENT_ADDRESS`: Your Solana wallet address
- `FRONTEND_URL`: Your frontend domain for CORS

### Frontend Variables
- `NEXT_PUBLIC_BACKEND_URL`: Your backend API URL

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Make sure `FRONTEND_URL` is set correctly
2. **Payment Issues**: Verify `SOLANA_PAYMENT_ADDRESS` is correct
3. **Build Failures**: Check Railway logs for dependency issues

### Railway Commands:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy from CLI
railway up

# View logs
railway logs

# Open project
railway open
```

## Custom Domains

1. **Go to Railway Dashboard**
2. **Select your service**
3. **Go to "Settings" > "Domains"**
4. **Add your custom domain**
5. **Update DNS records as instructed**

## Monitoring

- **Railway Dashboard**: Monitor deployments and logs
- **Health Checks**: Backend has `/health` endpoint
- **Logs**: View real-time logs in Railway dashboard

## Cost Optimization

- **Free Tier**: 500 hours/month per service
- **Pro Plan**: $5/month for unlimited usage
- **Team Plan**: $20/month for team collaboration
