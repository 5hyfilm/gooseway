import { DataTypes } from 'sequelize';

export default sequelize => {
    const ObstacleConfirmation = sequelize.define(
        'ObstacleConfirmation',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            obstacleId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'obstacle_id',
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
            },
            statusId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'status_id',
            },
        },
        {
            sequelize,
            modelName: 'ObstacleConfirmation',
            tableName: 'obstacle_confirmations',
            timestamps: true,
            updatedAt: false,
            underscored: true,
        },
    );

    ObstacleConfirmation.association = db => {
        ObstacleConfirmation.belongsTo(db.obstacle, {
            foreignKey: 'obstacleId',
            as: 'obstacle',
        });

        ObstacleConfirmation.belongsTo(db.user, {
            foreignKey: 'userId',
            as: 'user',
        });

        ObstacleConfirmation.belongsTo(db.obstacleStatus, {
            foreignKey: 'statusId',
            as: 'status',
        });
    };

    return ObstacleConfirmation;
};
