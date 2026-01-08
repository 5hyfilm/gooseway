import { DataTypes } from 'sequelize';

export default sequelize => {
    const CommentPost = sequelize.define(
        'CommentPost',
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
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'CommentPost',
            tableName: 'comment_post',
            timestamps: true,
            underscored: true,
        },
    );

    CommentPost.association = db => {
        CommentPost.belongsTo(db.post, {
            foreignKey: 'postId',
            as: 'post',
        });
        CommentPost.belongsTo(db.user, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return CommentPost;
};
