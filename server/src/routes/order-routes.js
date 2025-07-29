import {Router} from 'express';

import { 
    getOrderById, 
    getOrderByUserID,
    createOrUpdateOrder,
    getProductionOrders } from '../controllers/order-controller.js';
    
const router = Router();

// 根据订单ID获取订单数据
router.get('/:orderId', getOrderById);

// 根据用户ID获取订单列表
router.get('/:userId', getOrderByUserID);

// 根据订单ID更新/创建订单
router.post('/order', createOrUpdateOrder);


// 获取待生产/待发货订单
router.get('/unfinished', getUnfinishedOrders);

export default router;
