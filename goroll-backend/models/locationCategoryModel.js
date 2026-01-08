import { DataTypes } from 'sequelize';

export default sequelize => {
    const LocationCategory = sequelize.define(
        'LocationCategory',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            nameEn: {
                type: DataTypes.STRING(100),
                allowNull: true,
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
            modelName: 'LocationCategory',
            tableName: 'location_categories',
            timestamps: true,
            underscored: true,
        },
    );

    LocationCategory.association = db => {
        LocationCategory.hasMany(db.location, {
            foreignKey: 'categoryId',
            as: 'locations',
        });
    };

    return LocationCategory;
};
