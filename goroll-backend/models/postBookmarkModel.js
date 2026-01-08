import { DataTypes } from 'sequelize';

export default sequelize => {
    const PostBookmark = sequelize.define(
        'PostBookmark',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
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
            modelName: 'PostBookmark',
            tableName: 'post_bookmark',
            timestamps: true,
            underscored: true,
        },
    );

    PostBookmark.association = db => {
        PostBookmark.belongsTo(db.user, {
            foreignKey: 'userId',
            as: 'user',
        });
        PostBookmark.belongsTo(db.post, {
            foreignKey: 'postId',
            as: 'post',
        });
    };

    return PostBookmark;
};
