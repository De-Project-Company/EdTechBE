import express from 'express';
import {
  signup,
  signin,
  activateAccount
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/activate', activateAccount);
router.post('/signin', signin);

export { router };
