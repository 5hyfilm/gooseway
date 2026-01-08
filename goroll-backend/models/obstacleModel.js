import { DataTypes } from 'sequelize';

export default sequelize => {
    const Obstacle = sequelize.define(
        'Obstacle',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
            },
            subcategoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'subcategory_id',
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'description',
            },
            latitude: {
                type: DataTypes.DECIMAL(9, 6),
                allowNull: true,
            },
            longitude: {
                type: DataTypes.DECIMAL(9, 6),
                allowNull: true,
            },
            statusId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'status_id',
            },
            createdBy: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'created_by',
            },
            updatedBy: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'updated_by',
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'created_at',
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'updated_at',
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'Obstacle',
            tableName: 'obstacles',
            timestamps: true,
            underscored: true,
        },
    );

    Obstacle.association = db => {
        Obstacle.belongsTo(db.user, {
            foreignKey: 'userId',
            as: 'user',
        });
        Obstacle.belongsTo(db.obstacleSubcategory, {
            foreignKey: 'subcategoryId',
            as: 'subcategory',
        });
        Obstacle.belongsTo(db.obstacleStatus, {
            foreignKey: 'statusId',
            as: 'status',
        });
        Obstacle.hasMany(db.obstacleImg, {
            foreignKey: 'obstacleId',
            as: 'img',
            onDelete: 'CASCADE',
        });
        Obstacle.hasMany(db.obstacleConfirmation, {
            foreignKey: 'obstacleId',
            as: 'confirmation',
            onDelete: 'CASCADE',
        });
    };

    return Obstacle;
};
