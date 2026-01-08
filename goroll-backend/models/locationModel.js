import { DataTypes } from 'sequelize';

export default sequelize => {
    const Location = sequelize.define(
        'Location',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'category_id',
            },
            name: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            accessLevelId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'access_level_id',
            },
            description: {
                type: DataTypes.TEXT,
            },
            latitude: {
                type: DataTypes.DECIMAL(9, 6),
            },
            longitude: {
                type: DataTypes.DECIMAL(9, 6),
            },
            isAutoStatus: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                field: 'is_auto_status',
            },
        },
        {
            sequelize,
            modelName: 'Location',
            tableName: 'locations',
            timestamps: true,
            underscored: true,
        },
    );

    Location.association = db => {
        Location.belongsTo(db.locationCategory, {
            foreignKey: 'categoryId',
            as: 'category',
        });

        Location.belongsTo(db.accessLevel, {
            foreignKey: 'accessLevelId',
            as: 'accessLevel',
        });

        Location.hasMany(db.locationReview, {
            foreignKey: 'locationId',
            as: 'reviews',
            onDelete: 'CASCADE',
        });

        Location.hasMany(db.locationFeatureMedia, {
            foreignKey: 'locationId',
            as: 'featureMedia',
            onDelete: 'CASCADE',
        });

        Location.hasMany(db.locationImg, {
            foreignKey: 'locationId',
            as: 'img',
            onDelete: 'CASCADE',
        });
    };

    return Location;
};
