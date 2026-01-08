import { Op, Sequelize } from 'sequelize';
import db from '../models/database.js';

const { user, authProvider, wheelChair, userStatus, role, userFollower, post, recordRoute, postTag } = db;

const userService = {
    async insert(userPayload) {
        const newUser = await user.create(userPayload);
        return newUser;
    },
    async update(userPayload) {
        const existingUser = await user.findByPk(userPayload.id);
        if (!existingUser) {
            throw new Error('Error User not found');
        }
        await existingUser.update(userPayload);
    },
    async updateByEmail(obj) {
        const existingUser = await user.findOne({
            where: { email: obj.email },
        });
        if (!existingUser) {
            throw new Error('Error User not found');
        }
        await existingUser.update({ passwordHash: obj.password });
    },
    async delete(userId) {
        return await user.destroy({
            where: { id: userId },
        });
    },
    async getUserByEmail(email, excludeId) {
        const whereClause = { email };

        if (excludeId) {
            whereClause.id = { [Op.not]: excludeId };
        }

        return await user.findOne({
            where: whereClause,
            include: [
                {
                    model: authProvider,
                    as: 'authProviders',
                    attributes: ['providerName'],
                },
            ],
        });
    },

    async getProviderByUserEmail(email) {
        const providerData = await authProvider.findOne({
            include: [
                {
                    model: user,
                    as: 'user',
                    where: { email: email },
                },
            ],
        });

        return providerData;
    },
    async findAll(queryOptions, criteria) {
        let where = {};

        if (criteria.fullName) {
            const keyword = `%${criteria.fullName.toLowerCase()}%`;
            where[Op.and] = [
                {
                    [Op.or]: [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('full_name')), {
                            [Op.like]: keyword,
                        }),
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), {
                            [Op.like]: keyword,
                        }),
                    ],
                },
            ];
        }

        if (criteria.roleId) {
            where['roleId'] = criteria.roleId;
        }

        if (criteria.statusId) {
            where['statusId'] = criteria.statusId;
        }

        const data = criteria.countOnly
            ? undefined
            : await user.findAll({
                  attributes: [
                      'id',
                      'avatarUrl',
                      'email',
                      'fullName',
                      'phoneNumber',
                      ['created_at', 'registeredAt'],
                      [
                          Sequelize.literal(`(
                        SELECT max(created_at)
                        FROM activity_log
                        WHERE ACTION = 'login'
                        and user_id = "User"."id"
                    )`),
                          'lastLogin',
                      ],
                  ],

                  include: [
                      {
                          model: userStatus,
                          as: 'status',
                          attributes: ['id', 'name'],
                      },
                      {
                          model: role,
                          as: 'role',
                          attributes: ['id', 'name'],
                      },
                  ],
                  where,
                  ...queryOptions,
              });

        const total = await user.count({
            where,
        });

        return {
            data,
            total,
        };
    },

    async adminFindById(id) {
        const users = user.findByPk(id, {
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                        SELECT max(created_at)
                        FROM activity_log
                        WHERE ACTION = 'login'
                        and user_id = "User"."id"
                    )`),
                        'lastLogin',
                    ],
                ],
            },
            include: [
                {
                    model: wheelChair,
                    as: 'wheelChair',
                },
                {
                    model: userStatus,
                    as: 'status',
                    attributes: ['id', 'name'],
                },
                {
                    model: role,
                    as: 'role',
                    attributes: ['id', 'name'],
                },
            ],
        });
        return users;
    },
    async findById(id) {
        const users = user.findByPk(id);
        return users;
    },
    async followUser(followObj, follow) {
        if (follow === true) {
            await userFollower.create(followObj);
        } else {
            await userFollower.destroy({
                where: { followerId: followObj.followerId, followingId: followObj.followingId },
            });
        }
    },
    async findAllFollower(queryOptions, criteria) {
        let where = {};
        where['followingId'] = criteria.userId;
        const data = criteria.countOnly
            ? undefined
            : await userFollower.findAll({
                  include: [
                      {
                          model: db.user,
                          as: 'follower',
                          attributes: ['id', 'fullName'],
                      },
                  ],
                  where,
                  ...queryOptions,
              });

        const total = await userFollower.count({
            where,
        });

        return {
            data,
            total,
        };
    },
    async findAllFollowing(queryOptions, criteria) {
        let where = {};
        where['followerId'] = criteria.userId;
        const data = criteria.countOnly
            ? undefined
            : await userFollower.findAll({
                  include: [
                      {
                          model: db.user,
                          as: 'following',
                          attributes: ['id', 'fullName'],
                      },
                  ],
                  where,
                  ...queryOptions,
              });

        const total = await userFollower.count({
            where,
        });

        return {
            data,
            total,
        };
    },
    async profile(id) {
        const users = user.findByPk(id, {
            include: [
                {
                    model: wheelChair,
                    as: 'wheelChair',
                },
                {
                    model: post,
                    as: 'post',
                    limit: 4,
                    order: [['createdAt', 'DESC']],
                    include: [
                        {
                            model: postTag,
                            as: 'tags',
                        },
                    ],
                },
                {
                    model: recordRoute,
                    as: 'route',
                    limit: 4,
                    order: [['createdAt', 'DESC']],
                },
            ],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "recorded_routes" AS "route"
                        WHERE "route"."user_id" = "User"."id"
                        )`),
                        'routeCount',
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "posts" AS "post"
                        WHERE "post"."user_id" = "User"."id"
                        )`),
                        'postCount',
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "user_followers" AS "follower"
                        WHERE "follower"."following_id" = "User"."id"
                        )`),
                        'followerCount',
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "user_followers" AS "following"
                        WHERE "following"."follower_id" = "User"."id"
                        )`),
                        'followingCount',
                    ],
                ],
            },
        });
        return users;
    },
};

export default userService;
