import { DataTypes } from 'sequelize';

export default sequelize => {
    const Wheelchair = sequelize.define(
        'Wheelchair',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'user_id',
            },
            isFoldable: {
                type: DataTypes.BOOLEAN,
                field: 'is_foldable',
            },
            widthRegularCm: {
                type: DataTypes.INTEGER,
                field: 'width_regular_cm',
            },
            lengthRegularCm: {
                type: DataTypes.INTEGER,
                field: 'length_regular_cm',
            },
            weightKg: {
                type: DataTypes.INTEGER,
                field: 'weight_kg',
            },
            widthFoldedCm: {
                type: DataTypes.INTEGER,
                field: 'width_folded_cm',
            },
            lengthFoldedCm: {
                type: DataTypes.INTEGER,
                field: 'length_folded_cm',
            },
            heightFoldedCm: {
                type: DataTypes.INTEGER,
                field: 'height_folded_cm',
            },
            notes: {
                type: DataTypes.TEXT,
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
            modelName: 'Wheelchair',
            tableName: 'wheelchairs',
            timestamps: true,
            underscored: true,
        },
    );

    // Associations
    Wheelchair.association = db => {
        Wheelchair.belongsTo(db.user, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return Wheelchair;
};
