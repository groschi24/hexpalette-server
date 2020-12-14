import { Router } from 'express';
import TokenController from '../controllers/token';

const router = Router();

router.route('/checktoken').get(TokenController.checkToken);

export default router;
