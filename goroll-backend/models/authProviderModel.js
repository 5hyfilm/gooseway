import { DataTypes } from 'sequelize';

export default sequelize => {
    const AuthProvider = sequelize.define(
        'AuthProvider',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
            },
            providerName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'provider_name',
            },
            providerId: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'provider_id',
            },
            accessToken: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'access_token',
            },
            refreshToken: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'refresh_token',
            },
        },
        {
            sequelize,
            modelName: 'AuthProvider',
            tableName: 'auth_providers',
            timestamps: true,
            underscored: true,
        },
    );

    AuthProvider.association = db => {
        AuthProvider.belongsTo(db.user, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return AuthProvider;
};
