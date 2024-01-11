import express from 'express';
import {
  signup,
  signin,
  activateAccount
} from '../controllers/authController.js';
const router = express.Router();

router.post('/signup', signup);

export default router;
