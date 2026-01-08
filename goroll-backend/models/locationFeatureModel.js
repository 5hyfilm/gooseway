import { DataTypes } from 'sequelize';

export default sequelize => {
    const LocationFeature = sequelize.define(
        'LocationFeature',
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
            modelName: 'LocationFeature',
            tableName: 'location_feature',
            timestamps: true,
            underscored: true,
        },
    );

    LocationFeature.association = db => {
        LocationFeature.hasMany(db.locationFeatureMedia, {
            foreignKey: 'featureId',
            as: 'media',
            onDelete: 'CASCADE',
            hooks: true,
        });
    };

    return LocationFeature;
};
