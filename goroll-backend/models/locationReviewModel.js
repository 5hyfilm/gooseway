import { DataTypes } from 'sequelize';

export default sequelize => {
    const LocationReview = sequelize.define(
        'LocationReview',
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
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
            },
            rating: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            reviewText: {
                type: DataTypes.TEXT,
                field: 'review_text',
            },
        },
        {
            sequelize,
            modelName: 'LocationReview',
            tableName: 'location_reviews',
            timestamps: true,
            updateAt: false,
            underscored: true,
        },
    );

    LocationReview.association = db => {
        LocationReview.belongsTo(db.location, {
            foreignKey: 'locationId',
            as: 'location',
        });

        LocationReview.belongsTo(db.user, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return LocationReview;
};
