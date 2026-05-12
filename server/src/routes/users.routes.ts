import { Router } from 'express';
import { registerUser } from '../controllers/users.controller';

const router = Router();

router.post('/users', registerUser);

export default router;
