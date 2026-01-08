import { DataTypes } from 'sequelize';

export default sequelize => {
    const ObstacleSubcategory = sequelize.define(
        'ObstacleSubcategory',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'category_id',
            },
            nameEn: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            nameTh: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            createdBy: {
                type: DataTypes.STRING(50),
                field: 'created_by',
            },
            updatedBy: {
                type: DataTypes.STRING(50),
                field: 'updated_by',
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'created_at',
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'updated_at',
            },
        },
        {
            sequelize,
            modelName: 'ObstacleSubcategory',
            tableName: 'obstacle_subcategories',
            timestamps: true,
            underscored: true,
        },
    );

    ObstacleSubcategory.association = db => {
        ObstacleSubcategory.belongsTo(db.obstacleCategory, {
            foreignKey: 'categoryId',
            as: 'category',
        });

        ObstacleSubcategory.hasMany(db.obstacle, {
            foreignKey: 'subcategoryId',
            as: 'obstacles',
        });
    };

    return ObstacleSubcategory;
};
