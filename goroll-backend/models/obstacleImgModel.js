import { DataTypes } from 'sequelize';

export default sequelize => {
    const ObstacleImg = sequelize.define(
        'ObstacleImg',
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
            imageUrl: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'image_url',
            },
        },
        {
            sequelize,
            modelName: 'ObstacleImg',
            tableName: 'obstacles_img',
            timestamps: false,
            underscored: true,
        },
    );

    ObstacleImg.association = db => {
        ObstacleImg.belongsTo(db.obstacle, {
            foreignKey: 'obstacleId',
            as: 'obstacle',
        });
    };

    return ObstacleImg;
};
