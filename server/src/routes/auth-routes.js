import {Router} from 'express';
import { register, login, verifyToken } from '../controllers/auth-controller.js';
import { validateRegister } from '../validators/auth-validator.js';


const router = Router();

// 注册新用户 匹配/register，
router.post('/register', validateRegister, register);

// 用户登录
router.post('/login', login);

// 验证JWT的有效性
router.get('/verify', verifyToken);

export default router;
