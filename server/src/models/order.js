import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Order extends Model {
  static init() {
    super.init({
      order_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        comment: '订单唯一标识符，使用UUID生成'
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '创建订单的用户ID，关联到users表'
      },
      original_design_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '订单对应的原始设计图ID，关联到designs表'
      },
      design_data: {
        type: DataTypes.JSONB,
        allowNull: false,
        comment: '订单使用的设计图数据，以JSONB格式存储'
      },
      img_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '订单相关图片的URL地址'
      },
      size: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '商品尺寸规格'
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '订购数量'
      },
      shipping_address: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '收货地址'
      },
      tracking_number: {
        type: DataTypes.STRING(100),
        comment: '物流跟踪号'
      },
      estimated_delivery: {
        type: DataTypes.DATEONLY,
        comment: '预计送达日期'
      },
      actual_delivery: {
        type: DataTypes.DATEONLY,
        comment: '实际送达日期'
      },
      order_status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '订单状态，如未支付、待生产、待发货、已发货、已收货等状态'
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        },
        comment: '订单总价，保留两位小数，必须非负'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '订单创建时间，自动记录'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '订单最后更新时间，自动记录'
      }
    }, {
      sequelize,
      tableName: 'orders',
      timestamps: false,
      comment: '存储用户订单的详细信息',
      indexes: [
        { fields: ['user_id'], name: 'idx_orders_user_id' }
      ],
      hooks: {
        beforeUpdate: (order) => {
          order.updated_at = new Date();
        }
      }
    });
  }
}

Order.init();

export default Order;