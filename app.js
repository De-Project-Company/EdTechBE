import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './controllers/errorController.js';
import authRoutes from './routes/authRoutes.js';
import AppError from './utils/appError.js';

const app = express();
app.set('view engine', 'pug');
const currentDir = path.dirname(fileURLToPath(import.meta.url));

app.set('views', path.join(currentDir, 'views'));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const allowedOrigins = [
  'https://edtechdev.vercel.app',
  'http://localhost:3000'
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('welcome to edtech backend repository');
});
app.use('/api/v1/auth', authRoutes);
app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
