import { DataTypes } from 'sequelize';

export default sequelize => {
    const PostStatus = sequelize.define(
        'PostStatus',
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
            modelName: 'PostStatus',
            tableName: 'post_status',
            timestamps: true,
            underscored: true,
        },
    );

    PostStatus.association = db => {
        PostStatus.hasMany(db.post, {
            foreignKey: 'statusId',
            as: 'posts',
        });
    };

    return PostStatus;
};
