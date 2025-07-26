import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import User from '../models/user.js'; // 导入 Sequelize 和用户模型

/**
 * @function register
 * @description 处理用户注册请求。验证输入，检查用户是否已存在，加密密码，创建新用户，并生成JWT令牌。
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 注册成功消息、用户数据和JWT令牌，或错误消息
 */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // --- 输入验证 Start ---
    // 检查所有必需字段是否存在
    if (!username || !email || !password) {
      return res.status(400).json({ message: '所有字段都是必需的：用户名、邮箱和密码' });
    }

    // 邮箱格式验证 (简单验证)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: '请输入有效的邮箱地址' });
    }

    // 密码强度验证 (例如，至少6个字符)
    if (password.length < 6) {
      return res.status(400).json({ message: '密码至少需要6个字符' });
    }
    // --- 输入验证 End ---

    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已被使用' });
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const user = new User({
      username,
      email,
      password_hash: hashedPassword
    });

    await user.save();

    // 生成JWT令牌
    // 建议：'24h' 可以通过环境变量配置，例如 process.env.JWT_EXPIRES_IN
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: '注册成功',
      user: {
        userId: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误，注册失败' });
  }
};

/**
 * @function login
 * @description 处理用户登录请求。验证邮箱和密码，并生成JWT令牌。
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 登录成功消息、用户数据和JWT令牌，或错误消息
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- 输入验证 Start ---
    // 检查所有必需字段是否存在
    if (!email || !password) {
      return res.status(400).json({ message: '所有字段都是必需的：邮箱和密码' });
    }

    // 邮箱格式验证 (简单验证)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: '请输入有效的邮箱地址' });
    }
    // --- 输入验证 End ---

    // 查找用户
    // 注意：如果您的User模型中password字段设置了 select: false，
    // 则需要在此处显式选择它才能进行密码比较：
    // const user = await User.findOne({ email }).select('+password');
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码不正确' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '邮箱或密码不正确' });
    }

    // 生成JWT令牌
    // 建议：'24h' 可以通过环境变量配置，例如 process.env.JWT_EXPIRES_IN
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: '登录成功',
      user: {
        userId: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误，登录失败' });
  }
};
