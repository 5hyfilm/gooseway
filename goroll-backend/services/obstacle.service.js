import db from '../models/database.js';
import { Op, Sequelize } from 'sequelize';

const { obstacle, obstacleImg, obstacleCategory, obstacleSubcategory, obstacleStatus, user, obstacleConfirmation } = db;

const obstacleService = {
    async findAll(queryOptions, criteria) {
        let { order, ...restQueryOptions } = queryOptions;
        let finalOrder = order;

        if (
            Array.isArray(queryOptions.order) &&
            queryOptions.order.length &&
            queryOptions.order[0][0] === 'categoryId'
        ) {
            const direction = queryOptions.order[0][1] || 'ASC'; // ASC หรือ DESC
            finalOrder = [
                [
                    { model: obstacleSubcategory, as: 'subcategory' },
                    { model: obstacleCategory, as: 'category' },
                    'id',
                    direction,
                ],
            ];
        }

        let where = {};
        let whereCategory = {};

        if (criteria.description) {
            where[Op.and] = [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('"Obstacle".description')), {
                    [Op.like]: `%${criteria.description.toLowerCase()}%`,
                }),
            ];
        }

        if (criteria.categoryId) {
            whereCategory['id'] = criteria.categoryId;
        }

        if (criteria.statusId) {
            where['statusId'] = criteria.statusId;
        }

        const data = criteria.countOnly
            ? undefined
            : await obstacle.findAll({
                  include: [
                      {
                          model: obstacleSubcategory,
                          as: 'subcategory',
                          attributes: ['id', 'nameEn', 'nameTh'],
                          required: true,
                          include: [
                              {
                                  model: obstacleCategory,
                                  as: 'category',
                                  attributes: ['id', 'nameEn', 'nameTh'],
                                  where: whereCategory,
                              },
                          ],
                      },
                      {
                          model: obstacleStatus,
                          as: 'status',
                          attributes: ['id', 'nameEn', 'nameTh'],
                          required: true,
                      },
                      {
                          model: user,
                          as: 'user',
                          attributes: ['id', 'fullName'],
                          required: true,
                      },
                      {
                          model: obstacleImg,
                          as: 'img',
                          attributes: ['id', 'imageUrl'],
                          limit: 1,
                      },
                  ],
                  order: finalOrder,
                  where,
                  ...restQueryOptions,
              });

        const total = await obstacle.count({
            where,
            include: {
                model: obstacleSubcategory,
                as: 'subcategory',
                required: true,
                include: [
                    {
                        model: obstacleCategory,
                        as: 'category',
                        required: true,
                        where: whereCategory,
                    },
                ],
            },
        });

        return {
            data,
            total,
        };
    },
    async adminFindById(id) {
        const obstacleObj = await obstacle.findByPk(id, {
            include: [
                {
                    model: obstacleImg,
                    as: 'img',
                    attributes: ['id', 'imageUrl'],
                },
                {
                    model: user,
                    as: 'user',
                    attributes: ['id', 'fullName'],
                },
                {
                    model: obstacleSubcategory,
                    as: 'subcategory',
                    attributes: ['id', 'nameEn', 'nameTh'],
                    include: [
                        {
                            model: obstacleCategory,
                            as: 'category',
                            attributes: ['id', 'nameEn', 'nameTh'],
                        },
                    ],
                },
            ],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "obstacle_confirmations" AS "oc"
                        WHERE "oc"."obstacle_id" = "Obstacle"."id"
                        and "oc"."status_id" = 1
                        )`),
                        'isAvailable',
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "obstacle_confirmations" AS "oc"
                        WHERE "oc"."obstacle_id" = "Obstacle"."id"
                        and "oc"."status_id" = 2
                        )`),
                        'isEdited',
                    ],
                ],
            },
        });

        return obstacleObj;
    },
    async findById(id, userId) {
        const obstacleObj = await obstacle.findByPk(id, {
            include: [
                {
                    model: obstacleImg,
                    as: 'img',
                    attributes: ['id', 'imageUrl'],
                },
                {
                    model: user,
                    as: 'user',
                    attributes: ['id', 'fullName'],
                },
                {
                    model: obstacleSubcategory,
                    as: 'subcategory',
                    attributes: ['id', 'nameEn', 'nameTh'],
                    include: [
                        {
                            model: obstacleCategory,
                            as: 'category',
                            attributes: ['id', 'nameEn', 'nameTh'],
                        },
                    ],
                },
            ],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "obstacle_confirmations" AS "oc"
                        WHERE "oc"."obstacle_id" = "Obstacle"."id"
                        and "oc"."status_id" = 1
                        )`),
                        'isAvailableCount',
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "obstacle_confirmations" AS "oc"
                        WHERE "oc"."obstacle_id" = "Obstacle"."id"
                        and "oc"."status_id" = 2
                        )`),
                        'isEditedCount',
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT "oc".status_id
                        FROM "obstacle_confirmations" AS "oc"
                        WHERE "oc"."obstacle_id" = "Obstacle"."id"
                        and "oc"."user_id" = ${userId}
                        )`),
                        'isConfirmed',
                    ],
                ],
            },
        });

        const obstacleMap = {
            id: obstacleObj.id,
            latitude: obstacleObj.latitude,
            longitude: obstacleObj.longitude,
            description: obstacleObj.description,
            img: obstacleObj.img.map(img => img.imageUrl),
            user: {
                id: obstacleObj.user.id,
                fullName: obstacleObj.user.fullName,
            },
            subcategory: {
                id: obstacleObj.subcategory.id,
                nameEn: obstacleObj.subcategory.nameEn,
                nameTh: obstacleObj.subcategory.nameTh,
                category: {
                    id: obstacleObj.subcategory.category.id,
                    nameEn: obstacleObj.subcategory.category.nameEn,
                    nameTh: obstacleObj.subcategory.category.nameTh,
                },
            },
            isAvailableCount: obstacleObj.dataValues.isAvailableCount,
            isEditedCount: obstacleObj.dataValues.isEditedCount,
            createdAt: obstacleObj.createdAt,
            updatedAt: obstacleObj.updatedAt,
            statusId: obstacleObj.statusId,
            isConfirmed: obstacleObj.dataValues.isConfirmed,
        };

        return obstacleMap;
    },
    async insert(obstaclePayload) {
        const newObstacle = await obstacle.create(obstaclePayload);
        return newObstacle;
    },
    async update(obstaclePayload) {
        const existingObstacle = await obstacle.findByPk(obstaclePayload.id);
        if (!existingObstacle) {
            throw new Error('Error Obstacle not found');
        } else {
            await existingObstacle.update(obstaclePayload);
        }
    },
    async delete(obstacleId) {
        await obstacle.destroy({
            where: { id: obstacleId },
        });
    },
    async findAllForMap() {
        const obstacles = await obstacle.findAll({
            attributes: ['id', 'latitude', 'longitude', 'description'],
            where: {
                statusId: 1,
            },
        });
        return obstacles;
    },
    async checkResolve(obstacleId) {
        const result = await db.sequelize.query(
            `
            SELECT 
                obstacle_id as "obstacleId",
                COUNT(CASE WHEN status_id = 1 THEN 1 END) AS "status1Count",
                COUNT(CASE WHEN status_id = 2 THEN 1 END) AS "status2Count"
            FROM obstacle_confirmations
            WHERE obstacle_id = :obstacleId
            GROUP BY obstacle_id;
          `,
            {
                type: db.Sequelize.QueryTypes.SELECT,
                replacements: { obstacleId },
            },
        );
        if (result[0].status2Count > result[0].status1Count) {
            obstacle.update({ statusId: 2 }, { where: { id: obstacleId } });
        } else {
            obstacle.update({ statusId: 1 }, { where: { id: obstacleId } });
        }
    },
};

export default obstacleService;
