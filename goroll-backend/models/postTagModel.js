import { DataTypes } from 'sequelize';

export default sequelize => {
    const PostTag = sequelize.define(
        'PostTag',
        {
            postId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                field: 'post_id',
            },
            tag: {
                type: DataTypes.STRING(100),
                allowNull: false,
                primaryKey: true,
            },
        },
        {
            sequelize,
            modelName: 'PostTag',
            tableName: 'post_tags',
            timestamps: false,
            underscored: true,
        },
    );

    PostTag.association = db => {
        PostTag.belongsTo(db.post, {
            foreignKey: 'postId',
            as: 'post',
        });
    };

    return PostTag;
};
