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
export const createOrUpdateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { user_id, ...orderData } = req.body;

    // 创建订单时必须有user_id，更新订单时必须有orderId
    if (!orderId && !user_id) {
      return res.status(400).json({ error: '创建订单需要提供用户ID' });
    }

    // 处理创建或更新逻辑
    let order;
    if (orderId) {
      // 更新现有订单 - 只更新前端传来的非空字段
      const updateFields = {};
      
      // 过滤掉undefined、null和空字符串的字段
      Object.keys(orderData).forEach(key => {
        const value = orderData[key];
        if (value !== undefined && value !== null && value !== '') {
          updateFields[key] = value;
        }
      });

      const [updatedCount, [updatedOrder]] = await Order.update(updateFields, {
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
        ...orderData
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: '处理订单失败', details: error.message });
  }
};

// 获取未完成订单
export const getUnfinishedOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let whereCondition;
    let orderBy;

    if (status === '待生产') {
      whereCondition = { order_status: { [Op.in]: ['待生产'] } };
      orderBy = [['created_at', 'ASC']];
    } else if (status === '待发货') {
      whereCondition = { order_status: { [Op.in]: ['待发货'] } };
      orderBy = [['estimated_delivery', 'ASC']];
    } else {
      return res.status(400).json({ error: '无效的订单状态参数' });
    }

    const orders = await Order.findAll({
      where: whereCondition,
      order: orderBy
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: '获取未完成订单失败', details: error.message });
  }
};  