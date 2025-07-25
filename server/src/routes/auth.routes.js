import {Router} from 'express';
const router = Router();
import { register, login } from '../controllers/auth.controller.js';
import { validateRegister } from '../validators/auth.validator.js';

// 注册新用户 匹配/register，
router.post('/register', validateRegister, register);

// 用户登录
router.post('/login', login);

export default router;
