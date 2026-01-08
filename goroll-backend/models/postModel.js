import { DataTypes } from 'sequelize';

export default sequelize => {
    const Post = sequelize.define(
        'Post',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
            },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'category_id',
            },
            statusId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'status_id',
            },
            latitude: {
                type: DataTypes.DECIMAL(9, 6),
                allowNull: true,
            },
            longitude: {
                type: DataTypes.DECIMAL(9, 6),
                allowNull: true,
            },
        },
        {
            tableName: 'posts',
            timestamps: true,
            underscored: true,
        },
    );

    Post.association = db => {
        Post.belongsTo(db.user, {
            foreignKey: 'userId',
            as: 'user',
        });
        Post.belongsTo(db.postCategory, {
            foreignKey: 'categoryId',
            as: 'category',
        });
        Post.belongsTo(db.postStatus, {
            foreignKey: 'statusId',
            as: 'status',
        });
        Post.hasMany(db.postImg, {
            foreignKey: 'postId',
            as: 'images',
            onDelete: 'CASCADE',
        });
        Post.hasMany(db.postTag, {
            foreignKey: 'postId',
            as: 'tags',
            onDelete: 'CASCADE',
        });
        Post.hasMany(db.likePost, {
            foreignKey: 'postId',
            as: 'likes',
            onDelete: 'CASCADE',
        });
        Post.hasMany(db.commentPost, {
            foreignKey: 'postId',
            as: 'comments',
            onDelete: 'CASCADE',
        });
        Post.hasMany(db.postBookmark, {
            foreignKey: 'postId',
            as: 'bookmarks',
            onDelete: 'CASCADE',
        });
    };

    return Post;
};
