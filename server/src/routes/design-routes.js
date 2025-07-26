import {Router} from 'express';
// 导入设计图相关的控制器函数
import {
    getDesignById,
    getDesignByUserID,
    saveDesign,
    deleteDesign
} from '../controllers/design-controller'

const router = Router();

// 根据设计ID获取设计数据
router.get('/designs/:designId', getDesignById);

// 根据用户ID获取设计列表
router.get('/designs/user/:userId', getDesignByUserID);

// 保存设计
router.post('/designs/:designId/save', saveDesign);

// 删除设计
router.delete('/designs/:designId', deleteDesign);

