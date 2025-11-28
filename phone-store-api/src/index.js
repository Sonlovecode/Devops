import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';

import authRouter from './routes/auth.routes.js';
import productsRouter from './routes/products.routes.js';
import ordersRouter from './routes/orders.routes.js';
import usersRouter from './routes/users.js';
import paymentRouter from './routes/payment.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

await connectDB();

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/payment', paymentRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API running at http://localhost:${PORT}`);
});
