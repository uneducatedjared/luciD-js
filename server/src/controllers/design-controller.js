import Design from '../models/design.js';

// 获取单个设计图
export const getDesignById = async (req, res) => {
    try{
        const design = await Design.findByPk(req.params.id);
        if (design) {
            res.status(200).json(Design);
        }
        else{
            res.status(404).json({ message: '设计图不存在' });
        }
    }
    catch(error){
        res.status(500).json({ message: '获取设计图失败', error: error.message });
    }
};

// 获取用户所有的设计图
export const getDesignByUserID = async (req, res) => {
    try{
        const designs = await Design.findAll({
            where: {
                user_id: req.params.user_id
            }
        });
        if (designs) {
            res.status(200).json(designs);
        }
        else{
            res.status(404).json({ message: '用户没有设计图' });
        }
    }
    catch(error){
        res.status(500).json({ message: '获取设计图失败', error: error.message });
    }
};
// 保存/更新设计图
export const saveDesign = async (req, res) => {
    try {
        const { designId } = req.params;
        const { designData, designName } = req.body;
        const design = await Design.findByPk(designId);

        // 如果没有对应的设计图，创建一个新的
        if (!design) {
            const newDesign = await Design.create({
                user_id: req.user.id,
                design_data: designData || {},
                design_name: designName,
            });
            res.status(201).json(newDesign);
            return;
        }
        // 如果有设计图则更新
        else{
            await design.update({
                design_data: designData,
                design_name: designName,
            });
            res.status(200).json(design);
        }
    } catch (error) {
        console.error('Error saving design:', error);
        res.status(500).json({ message: '保存设计图失败', error: error.message });
    }
};

// 删除设计图   
export const deleteDesign = async (req, res) => {
    try{
        const design = await Design.findByPk(req.params.id);
        if (design) {
            await design.destroy();
            res.status(200).json({ message: '设计图删除成功' });
        }
        else{
            res.status(404).json({ message: '设计图不存在' });
        }
    }
    catch(error){
        res.status(500).json({ message: '删除设计图失败', error: error.message });
    }
};
