import { DataTypes } from 'sequelize';

export default sequelize => {
    const RecordedRoute = sequelize.define(
        'RecordedRoute',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            totalDistanceMeters: {
                type: DataTypes.DOUBLE,
                allowNull: true,
                field: 'total_distance_meters',
            },
            startLocationName: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'start_location_name',
            },
            endLocationName: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'end_location_name',
            },
            routeCoordinates: {
                type: DataTypes.JSON,
                allowNull: true,
                field: 'route_coordinates',
            },
            time: {
                type: DataTypes.DOUBLE,
                allowNull: true,
            },
            routeDate: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'route_date',
            },
            isPublic: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                field: 'is_public',
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'created_at',
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'updated_at',
            },
        },
        {
            sequelize,
            modelName: 'RecordedRoute',
            tableName: 'recorded_routes',
            timestamps: true,
            underscored: true,
        },
    );

    // Associations
    RecordedRoute.association = db => {
        RecordedRoute.belongsTo(db.user, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return RecordedRoute;
};
