import { DataTypes } from 'sequelize';

export default sequelize => {
    const AccessLevel = sequelize.define(
        'AccessLevel',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
            nameEn: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
            nameTh: {
                type: DataTypes.STRING(100),
                allowNull: true,
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
            modelName: 'AccessLevel',
            tableName: 'access_level',
            timestamps: true,
            underscored: true,
        },
    );

    AccessLevel.associate = db => {
        AccessLevel.hasMany(db.location, {
            foreignKey: 'accessLevelId',
            as: 'locations',
        });
    };

    return AccessLevel;
};
