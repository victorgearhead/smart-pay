
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { paymentHandler } from './handlers/paymentHandler';
import { fraudHandler } from './handlers/fraudHandler';
// import { rewardHandler } from './handlers/rewardHandler';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true
}));
app.use(
  helmet({
    contentSecurityPolicy: false,
    strictTransportSecurity: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
  })
);


app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.post('/api/payment', async (req, res) => {
  try {
    const event = {
      body: JSON.stringify(req.body),
      headers: req.headers
    };
    const result = await paymentHandler(event as any, {} as any);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    logger.error('Payment API error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/fraud', async (req, res) => {
  try {
    const event = {
      body: JSON.stringify(req.body),
      headers: req.headers
    };
    const result = await fraudHandler(event as any, {} as any);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    logger.error('Fraud API error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// app.post('/api/rewards', async (req, res) => {
//   try {
//     const event = {
//       body: JSON.stringify(req.body),
//       headers: req.headers
//     };
//     const result = await rewardHandler(event as any, {} as any);
//     res.status(result.statusCode).json(JSON.parse(result.body));
//   } catch (error) {
//     logger.error('Rewards API error', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.post('/ml/fraud/predict', async (req, res) => {
  const mockScore = 0.1 + Math.random() * 0.3;
  res.json({
    predictions: [{ score: mockScore }],
    model: 'local-mock-fraud-detector'
  });
});

app.post('/ml/routing/predict', async (req, res) => {
  const actions = ['Stripe', 'AmazonPay', 'Solana'];
  const chosenAction = Math.floor(Math.random() * actions.length);
  
  res.json({
    chosen_action: chosenAction,
    action_probability: 0.7 + Math.random() * 0.25,
    exploration: Math.random() < 0.3,
    expected_reward: 0.8 + Math.random() * 0.15,
    recommended_gateway: actions[chosenAction]
  });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.listen(PORT, () => {
  logger.info(`SmartPay Orchestrator Backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL}`);
});

export default app;
