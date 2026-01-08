import { DataTypes } from 'sequelize';

export default sequelize => {
    const UserFollower = sequelize.define(
        'UserFollower',
        {
            followerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'follower_id',
                primaryKey: true,
            },
            followingId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'following_id',
                primaryKey: true,
            },
        },
        {
            sequelize,
            modelName: 'UserFollower',
            tableName: 'user_followers',
            timestamps: true,
            updatedAt: false,
            underscored: true,
        },
    );

    UserFollower.association = db => {
        UserFollower.belongsTo(db.user, {
            foreignKey: 'followerId',
            as: 'follower',
        });

        UserFollower.belongsTo(db.user, {
            foreignKey: 'followingId',
            as: 'following',
        });
    };

    return UserFollower;
};
