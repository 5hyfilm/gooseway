import { DataTypes } from 'sequelize';

export default sequelize => {
    const LikePost = sequelize.define(
        'LikePost',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            postId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'post_id',
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
            },
        },
        {
            sequelize,
            modelName: 'LikePost',
            tableName: 'like_post',
            timestamps: true,
            underscored: true,
            updatedAt: false,
            // indexes: [
            //   {
            //     unique: true,
            //     fields: ['post_id', 'user_id'],
            //   },
            // ],
        },
    );

    LikePost.association = db => {
        LikePost.belongsTo(db.post, {
            foreignKey: 'postId',
            as: 'post',
        });
        LikePost.belongsTo(db.user, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return LikePost;
};
