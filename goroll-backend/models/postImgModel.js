import { DataTypes } from 'sequelize';

export default sequelize => {
    const PostImg = sequelize.define(
        'PostImg',
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
                onDelete: 'CASCADE',
            },
            imageUrl: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'image_url',
            },
        },
        {
            sequelize,
            modelName: 'PostImg',
            tableName: 'posts_img',
            timestamps: false,
            underscored: true,
        },
    );

    PostImg.association = db => {
        PostImg.belongsTo(db.post, {
            foreignKey: 'postId',
            as: 'post',
        });
    };

    return PostImg;
};
