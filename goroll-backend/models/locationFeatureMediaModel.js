import { DataTypes } from 'sequelize';

export default sequelize => {
    const LocationFeatureMedia = sequelize.define(
        'LocationFeatureMedia',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            locationId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'location_id',
            },
            featureId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'feature_id',
            },
            isGood: {
                type: DataTypes.BOOLEAN,
                field: 'is_good',
                allowNull: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
            },
        },
        {
            sequelize,
            modelName: 'LocationFeatureMedia',
            tableName: 'location_feature_media',
            timestamps: true,
            updatedAt: false,
            underscored: true,
        },
    );

    LocationFeatureMedia.association = db => {
        LocationFeatureMedia.belongsTo(db.location, {
            foreignKey: 'locationId',
            as: 'location',
        });

        LocationFeatureMedia.belongsTo(db.locationFeature, {
            foreignKey: 'featureId',
            as: 'feature',
        });

        LocationFeatureMedia.hasMany(db.locationFeatureMediaImg, {
            foreignKey: 'featureMediaId',
            as: 'img',
        });

        LocationFeatureMedia.belongsTo(db.user, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return LocationFeatureMedia;
};
