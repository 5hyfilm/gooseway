import { Op, Sequelize } from 'sequelize';
import db from '../models/database.js';

const { recordRoute, user } = db;

const recordedRouteService = {
    async insert(payload) {
        const route = await recordRoute.create(payload);
        return route;
    },
    async findAll(queryOptions, criteria) {
        let where = {};

        if (criteria.name) {
            const keyword = `%${criteria.name.toLowerCase()}%`;

            where[Op.and] = [
                {
                    [Op.or]: [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('start_location_name')), {
                            [Op.like]: `%${keyword.toLowerCase()}%`,
                        }),
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('end_location_name')), {
                            [Op.like]: `%${keyword.toLowerCase()}%`,
                        }),
                    ],
                },
            ];
        }

        const data = criteria.countOnly
            ? undefined
            : await recordRoute.findAll({
                  include: [
                      {
                          model: user,
                          as: 'user',
                          attributes: ['id', 'fullName'],
                      },
                  ],
                  where,
                  ...queryOptions,
              });

        const total = await recordRoute.count({
            where,
        });

        return {
            data,
            total,
        };
    },
    async findById(id) {
        const route = await recordRoute.findByPk(id, {
            include: [
                {
                    model: user,
                    as: 'user',
                    attributes: ['id', 'fullName'],
                },
            ],
        });

        if (!route) {
            throw new Error('Error RecordRoute not found');
        }
        return route;
    },
    async delete(id) {
        return await recordRoute.destroy({
            where: { id: id },
        });
    },
    async findAllForMap(userId) {
        const routes = await recordRoute.findAll({
            where: {
                [Op.or]: [{ isPublic: true }, { userId: userId }],
            },
            attributes: ['id', 'name', 'routeCoordinates'],
        });
        return routes;
    },

    async updateIsPublic(id, isPublic, user) {
        const existingRoute = await recordRoute.findByPk(id);
        if (!existingRoute) {
            throw new Error('Error Route not found');
        }

        if (user.roleId !== 2 && existingRoute.userId !== user.id) {
            throw new Error('Error You are not authorized to update this route');
        }

        await existingRoute.update({ isPublic: isPublic });
    },
    async findRouteAll(queryOptions, criteria) {
        let where = {};
        where['userId'] = criteria.userId;

        if (criteria.name) {
            const keyword = `%${criteria.name.toLowerCase()}%`;

            where[Op.and] = [
                {
                    [Op.or]: [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('start_location_name')), {
                            [Op.like]: keyword,
                        }),
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('end_location_name')), {
                            [Op.like]: keyword,
                        }),
                    ],
                },
            ];
        }

        const data = criteria.countOnly
            ? undefined
            : await recordRoute.findAll({
                  attributes: [
                      'id',
                      'name',
                      'startLocationName',
                      'endLocationName',
                      'totalDistanceMeters',
                      'createdAt',
                      'time',
                  ],
                  where,
                  ...queryOptions,
              });

        const total = await recordRoute.count({
            where,
        });

        return {
            data,
            total,
        };
    },
};

export default recordedRouteService;
