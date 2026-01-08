import { DataTypes } from 'sequelize';

export default sequelize => {
    const UserStatus = sequelize.define(
        'UserStatus',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
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
            modelName: 'UserStatus',
            tableName: 'user_status',
            timestamps: true,
            underscored: true,
        },
    );

    // Associations
    UserStatus.association = db => {
        UserStatus.hasMany(db.user, {
            foreignKey: 'statusId',
            as: 'users',
        });
    };

    return UserStatus;
};
