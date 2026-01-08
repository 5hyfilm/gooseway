import { DataTypes } from 'sequelize';

export default sequelize => {
    const ObstacleCategory = sequelize.define(
        'ObstacleCategory',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
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
            modelName: 'ObstacleCategory',
            tableName: 'obstacle_categories',
            timestamps: true,
            underscored: true,
        },
    );

    ObstacleCategory.association = db => {
        ObstacleCategory.hasMany(db.obstacleSubcategory, {
            foreignKey: 'categoryId',
            as: 'subcategories',
        });
    };

    return ObstacleCategory;
};
