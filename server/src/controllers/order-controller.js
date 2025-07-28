import Order from '../models/order.js';
import { Op } from 'sequelize';

// 单个订单详情
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: '获取订单失败', details: error.message });
  }
};

// 用户订单列表
export const getOrderByUserID = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: '获取用户订单失败', details: error.message });
  }
};

// 更新/创建订单，orderId后台自动生成
export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { user_id, ...orderData } = req.body;

    // 检查是否存在用户ID（创建订单必需）
    if (!user_id && !orderId) {
      return res.status(400).json({ error: '创建订单需要提供用户ID' });
    }

    // 处理创建或更新逻辑
    let order;
    if (orderId) {
      // 更新现有订单
      const [updatedCount, [updatedOrder]] = await Order.update(orderData, {
        where: { order_id: orderId },
        returning: true
      });
      
      if (updatedCount === 0) {
        return res.status(404).json({ error: '订单不存在' });
      }
      
      order = updatedOrder;
    } else {
      // 创建新订单（自动生成UUID）
      order = await Order.create({
        user_id,
        ...orderData,
        order_id: DataTypes.UUIDV4 // 依赖模型默认值
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: '处理订单失败', details: error.message });
  }
};

// 获取待生产订单
export const getProductionOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { 
        order_status: {
          [Op.in]: ['待生产'] 
        }
      },
      order: [['created_at', 'ASC']]
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: '获取待生产订单失败', details: error.message });
  }
};

export const getDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { 
        order_status: {
          [Op.in]: ['待发货'] 
        }
      },
      order: [['estimated_delivery', 'ASC']]
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: '获取待发货订单失败', details: error.message });
  }
};