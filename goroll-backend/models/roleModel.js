import { DataTypes } from 'sequelize';

export default sequelize => {
    const Role = sequelize.define(
        'Role',
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
            modelName: 'Role',
            tableName: 'roles',
            timestamps: true,
            underscored: true,
        },
    );

    // Associations
    Role.association = db => {
        Role.hasMany(db.user, {
            foreignKey: 'roleId',
            as: 'users',
        });
    };

    return Role;
};
