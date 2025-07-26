import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class User extends Model {
  static init() {
    super.init({
      user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        comment: '用户唯一标识符，使用UUID生成'
      },
      user_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'customer',
        validate: {
          isIn: [['customer', 'vendor', 'admin']]
        },
        comment: '用户类型：customer（普通用户）、vendor（供应商）、admin（管理员）'
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '用户登录名，需保持唯一性'
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        },
        comment: '用户邮箱，需保持唯一性，用于登录和通知'
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '加密后的用户密码'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '用户账户状态，TRUE表示活跃，FALSE表示禁用'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '用户账户创建时间，自动记录'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '用户信息最后更新时间，自动记录'
      }
    }, {
      sequelize,
      tableName: 'users',
      timestamps: false,
      comment: '存储平台用户的基本信息',
    indexes: [
      { fields: ['username'] },
      { fields: ['email'] }
    ],
    hooks: {
      beforeUpdate: (user) => {
        user.updated_at = new Date();
      }
    }
  });
}}

User.init();

export default User;