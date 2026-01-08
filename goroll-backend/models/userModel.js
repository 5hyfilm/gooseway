import { DataTypes } from 'sequelize';

export default sequelize => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            roleId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'role_id',
            },
            statusId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'status_id',
            },
            email: {
                type: DataTypes.STRING(50),
                allowNull: true,
                unique: true,
            },
            passwordHash: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'password_hash',
            },
            fullName: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'full_name',
            },
            phoneNumber: {
                type: DataTypes.STRING(20),
                allowNull: true,
                field: 'phone_number',
            },
            avatarUrl: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'avatar_url',
            },
            createdBy: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'created_by',
            },
            updatedBy: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'updated_by',
            },
            suspendedReason: {
                type: DataTypes.STRING(1000),
                allowNull: true,
                field: 'suspended_reason',
            },
            suspendedBy: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'suspended_by',
            },
            suspendedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'suspended_at',
            },
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            timestamps: true,
            underscored: true,
        },
    );

    User.association = db => {
        User.belongsTo(db.role, {
            foreignKey: 'roleId',
            as: 'role',
        });

        User.belongsTo(db.userStatus, {
            foreignKey: 'statusId',
            as: 'status',
        });

        User.hasMany(db.authProvider, {
            foreignKey: 'userId',
            as: 'authProviders',
            onDelete: 'CASCADE',
        });

        User.hasOne(db.wheelChair, {
            foreignKey: 'userId',
            as: 'wheelChair',
            onDelete: 'CASCADE',
        });

        User.hasMany(db.locationReview, {
            foreignKey: 'userId',
            as: 'userReview',
        });

        User.hasMany(db.recordRoute, {
            foreignKey: 'userId',
            as: 'route',
        });

        User.hasMany(db.locationFeatureMedia, {
            foreignKey: 'userId',
            as: 'locationFeature',
        });

        User.hasMany(db.post, {
            foreignKey: 'userId',
            as: 'post',
        });

        User.hasMany(db.likePost, {
            foreignKey: 'userId',
            as: 'likePost',
        });

        User.hasMany(db.commentPost, {
            foreignKey: 'userId',
            as: 'commentPost',
        });

        User.hasMany(db.userFollower, {
            foreignKey: 'followingId',
            as: 'followers',
        });

        User.hasMany(db.userFollower, {
            foreignKey: 'followerId',
            as: 'followings',
        });
        User.hasMany(db.postBookmark, {
            foreignKey: 'userId',
            as: 'bookmarks',
        });
    };

    return User;
};
