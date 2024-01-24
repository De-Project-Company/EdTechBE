import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './SchoolFeature/controllers/errorController.js';
import { router as authRoutes } from './SchoolFeature/routes/authRoutes.js';
import AppError from './utils/appError.js';
import mongoose from "mongoose";
import dotenv from "dotenv";
import { config } from "./config/index.js";


dotenv.config();

const port = process.env.PORT || 5000;

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



// mongodb connection
mongoose.connect(config.mongodb_connection_url)
  .then(() => console.log("Database Connection Established"))
  .catch((error) => console.error("Error connecting to the database:", error.message));



  app.listen(port, () => {
    console.log(`app is listening on port ${port}...`);
    console.log("Connecting to database...");
  });