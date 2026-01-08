import { DataTypes } from 'sequelize';

export default sequelize => {
    const LocationFeatureMediaImg = sequelize.define(
        'LocationFeatureMediaImg',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            featureMediaId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'feature_media_id',
            },
            imageUrl: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'image_url',
            },
        },
        {
            sequelize,
            modelName: 'LocationFeatureMediaImg',
            tableName: 'location_feature_media_img',
            timestamps: true,
            updatedAt: false,
            underscored: true,
        },
    );

    // Associations
    LocationFeatureMediaImg.association = db => {
        LocationFeatureMediaImg.belongsTo(db.locationFeatureMedia, {
            foreignKey: 'featureMediaId',
            as: 'featureMedia',
        });
    };

    return LocationFeatureMediaImg;
};
