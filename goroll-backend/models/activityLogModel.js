import { DataTypes } from 'sequelize';

export default sequelize => {
    const ActivityLog = sequelize.define(
        'ActivityLog',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'user_id',
            },
            action: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            entityType: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'entity_type',
            },
            entityId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'entity_id',
            },
            metadata: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                field: 'created_at',
            },
        },
        {
            sequelize,
            modelName: 'ActivityLog',
            tableName: 'activity_log',
            timestamps: true,
            updateAtd: false,
            underscored: true,
        },
    );

    return ActivityLog;
};
