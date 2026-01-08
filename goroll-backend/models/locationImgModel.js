import { DataTypes } from 'sequelize';

export default sequelize => {
    const LocationImg = sequelize.define(
        'LocationImg',
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
            imageUrl: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'image_url',
            },
        },
        {
            sequelize,
            modelName: 'LocationImg',
            tableName: 'location_img',
            timestamps: false,
            underscored: true,
        },
    );

    // Associations
    LocationImg.association = db => {
        LocationImg.belongsTo(db.location, {
            foreignKey: 'locationId',
            as: 'location',
        });
    };

    return LocationImg;
};
