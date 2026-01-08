import { DataTypes } from 'sequelize';

export default sequelize => {
    const PostCategory = sequelize.define(
        'PostCategory',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            nameEn: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            nameTh: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
            },
            createdBy: {
                type: DataTypes.STRING(50),
                field: 'created_by',
            },
            updatedBy: {
                type: DataTypes.STRING(50),
                field: 'updated_by',
            },
        },
        {
            sequelize,
            modelName: 'PostCategory',
            tableName: 'post_categories',
            timestamps: true,
            underscored: true,
        },
    );

    PostCategory.association = db => {
        PostCategory.hasMany(db.post, {
            foreignKey: 'categoryId',
            as: 'posts',
        });
    };

    return PostCategory;
};
