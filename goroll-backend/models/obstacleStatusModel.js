import { DataTypes } from 'sequelize';

export default sequelize => {
    const ObstacleStatus = sequelize.define(
        'ObstacleStatus',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            nameEn: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
            nameTh: {
                type: DataTypes.STRING(100),
                allowNull: true,
                unique: true,
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
            modelName: 'ObstacleStatus',
            tableName: 'obstacle_status',
            timestamps: true,
            underscored: true,
        },
    );

    ObstacleStatus.association = db => {
        ObstacleStatus.hasMany(db.obstacle, {
            foreignKey: 'statusId',
            as: 'obstacles',
        });

        ObstacleStatus.hasMany(db.obstacleConfirmation, {
            foreignKey: 'statusId',
            as: 'confirmations',
        });
    };

    return ObstacleStatus;
};
