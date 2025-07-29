import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth-routes.js';
import orderRoutes from './routes/order-routes.js';

// 加载环境变量 - 应该在最开始加载
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件配置
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// 解析 JSON 请求体 - express.json() 已经包含了 body-parser 的功能
app.use(express.json({ 
  limit: '50mb',
  strict: true
}));

// 解析 URL 编码的请求体
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb' 
}));

// 安全相关中间件（建议添加）
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
// 根路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl 
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // 开发环境显示详细错误，生产环境只显示通用错误
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 优雅关闭处理
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Access URL: http://localhost:${PORT}`);
});

// 处理进程信号，优雅关闭服务器
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default app;