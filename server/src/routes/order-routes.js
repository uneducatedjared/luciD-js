import {Router} from 'express';

const router = Router();

// 根据订单ID获取订单数据
router.get('/orders/:orderId', getOrderById);

// 根据用户ID获取订单列表
router.get('/orders/user/:userId', getOrderByUserID);

// 根据订单ID更新/创建订单
router.put('/orders/:orderId', updateOrder);


// 获取待生产订单
router.get('/orders/production', getProductionOrders);

// 获取待发货订单
router.get('/orders/delivery', getDeliveryOrders);
