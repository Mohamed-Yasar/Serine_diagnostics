import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import testsRouter from './routes/tests';
import packagesRouter from './routes/packages';
import locationsRouter from './routes/locations';
import appointmentsRouter from './routes/appointments';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import providerRouter from './routes/provider';
import contactRouter from './routes/contact';

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Serine Diagnostics API is running',
  });
});

// Routes
app.use('/api/tests', testsRouter);
app.use('/api/packages', packagesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/provider', providerRouter);
app.use('/api/contact', contactRouter);

app.listen(PORT, () => {
  console.log(`🚀 Serine API running on http://localhost:${PORT}`);
});