import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js'; // Adjust path as per your project structure

class Design extends Model {
    static init() {
        super.init({
            design_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
                comment: '设计图唯一标识符，使用UUID生成'
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                comment: '创建此设计图的用户ID，关联到users表'
            },
            design_data: {
                type: DataTypes.JSONB,
                allowNull: false,
                comment: '设计图的详细数据，以JSONB格式存储'
            },
            design_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: '未命名设计',
                comment: '设计图的名称'
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                comment: '设计图创建时间，自动记录'
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                comment: '设计图最后更新时间，自动记录'
            }
        }, {
            sequelize, // The Sequelize instance
            tableName: 'designs', // The name of the table in the database
            timestamps: false, // Disable Sequelize's default timestamps (createdAt, updatedAt) as we manage them manually
            comment: '存储用户创建的设计图信息', // Table comment
            indexes: [
                {
                    fields: ['user_id'],
                    name: 'idx_designs_user_id',
                    comment: '加速查询特定用户设计图的索引'
                }
            ],
            hooks: {
                /**
                 * Hook to update the 'updated_at' timestamp before an update operation.
                 * @param {Design} design - The design instance being updated.
                 */
                beforeUpdate: (design) => {
                    design.updated_at = new Date();
                }
            }
        });
    }
}

// Initialize the model
Design.init();

export default Design;