import { DataTypes } from 'sequelize';

export default sequelize => {
    const PasswordReset = sequelize.define(
        'PasswordReset',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            token: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'expires_at',
            },
            isUsed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_used',
            },
        },
        {
            sequelize,
            modelName: 'PasswordReset',
            tableName: 'password_reset',
            timestamps: true,
            underscored: true,
        },
    );

    return PasswordReset;
};
