import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * PostgreSQL数据库连接配置
 * 优先从环境变量读取配置，未配置则使用默认值
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || 'diy',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      underscored: true,
      freezeTableName: true
    }
  }
);

/**
 * 测试数据库连接
 * 在应用启动时调用，验证数据库连接状态
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
};

// 导出实例和测试方法
export { sequelize, testConnection };

export default sequelize;