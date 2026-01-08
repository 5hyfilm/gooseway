import db from '../models/database.js';
import { Op, Sequelize } from 'sequelize';

const {
    post,
    user,
    postCategory,
    postTag,
    obstacle,
    obstacleCategory,
    postImg,
    obstacleImg,
    locationImg,
    location,
    locationCategory,
    accessLevel,
    recordRoute,
    obstacleSubcategory,
    obstacleStatus,
} = db;

const globalSearchService = {
    async findAll(queryOptions, criteria) {
        const keyword = criteria.keyword;

        const postWhere = {};
        const obstacleWhere = {};
        const locationWhere = {};
        const recordRouteWhere = {};

        if (keyword) {
            postWhere[Op.and] = [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('"Post".title')), {
                    [Op.like]: `%${keyword.toLowerCase()}%`,
                }),
            ];
            obstacleWhere[Op.and] = [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('"Obstacle".description')), {
                    [Op.like]: `%${keyword.toLowerCase()}%`,
                }),
            ];
            locationWhere[Op.and] = [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('"Location".name')), {
                    [Op.like]: `%${keyword.toLowerCase()}%`,
                }),
            ];
            recordRouteWhere[Op.and] = [
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

        const [posts, postTotal] = criteria.countOnly
            ? [undefined, await post.count({ where: postWhere, ...queryOptions })]
            : [
                  await post.findAll({
                      include: [
                          { model: user, as: 'user', attributes: ['id', 'fullName'] },
                          { model: postCategory, as: 'category', attributes: ['id', 'nameTh'] },
                          { model: postTag, as: 'tags' },
                          {
                              model: postImg,
                              as: 'images',
                              attributes: ['id', 'imageUrl'],
                              limit: 1,
                          },
                      ],
                      attributes: {
                          include: [
                              [
                                  Sequelize.literal(`(
                            SELECT COUNT(1)
                            FROM "like_post" AS "likes"
                            WHERE "likes"."post_id" = "Post"."id"
                            )`),
                                  'likeCount',
                              ],
                              [
                                  Sequelize.literal(`(
                            SELECT COUNT(1)
                            FROM "comment_post" AS "comments"
                            WHERE "comments"."post_id" = "Post"."id"
                            )`),
                                  'commentCount',
                              ],
                          ],
                      },
                      where: postWhere,
                      ...queryOptions,
                  }),
                  await post.count({ where: postWhere, ...queryOptions }),
              ];

        const [obstacles, obstacleTotal] = criteria.countOnly
            ? [undefined, await obstacle.count({ where: obstacleWhere, ...queryOptions })]
            : [
                  await obstacle.findAll({
                      include: [
                          {
                              model: obstacleSubcategory,
                              as: 'subcategory',
                              attributes: ['id', 'nameTh', 'nameEn'],
                              include: [
                                  {
                                      model: obstacleCategory,
                                      as: 'category',
                                      attributes: ['id', 'nameTh', 'nameEn'],
                                  },
                              ],
                          },
                          {
                              model: obstacleStatus,
                              as: 'status',
                              attributes: ['id', 'nameTh', 'nameEn'],
                          },
                          {
                              model: user,
                              as: 'user',
                              attributes: ['id', 'fullName'],
                          },
                          {
                              model: obstacleImg,
                              as: 'img',
                              attributes: ['id', 'imageUrl'],
                              limit: 1,
                          },
                      ],
                      where: obstacleWhere,
                      ...queryOptions,
                  }),
                  await obstacle.count({ where: obstacleWhere, ...queryOptions }),
              ];

        const [locations, locationTotal] = criteria.countOnly
            ? [undefined, await location.count({ where: locationWhere, ...queryOptions })]
            : [
                  await location.findAll({
                      include: [
                          {
                              model: locationCategory,
                              as: 'category',
                              attributes: ['id', 'nameEn', 'nameTh'],
                          },
                          {
                              model: accessLevel,
                              as: 'accessLevel',
                              attributes: ['id', 'nameEn', 'nameTh'],
                          },
                          {
                              model: locationImg,
                              as: 'img',
                              attributes: ['id', 'imageUrl'],
                              limit: 1,
                          },
                      ],
                      where: locationWhere,
                      ...queryOptions,
                  }),
                  await location.count({ where: locationWhere }),
              ];

        const [recordRoutes, recordRouteTotal] = criteria.countOnly
            ? [undefined, await recordRoute.count({ where: recordRouteWhere, ...queryOptions })]
            : [
                  await recordRoute.findAll({
                      include: [
                          {
                              model: user,
                              as: 'user',
                              attributes: ['id', 'fullName'],
                          },
                      ],
                      where: recordRouteWhere,
                      ...queryOptions,
                  }),
                  await recordRoute.count({ where: recordRouteWhere, ...queryOptions }),
              ];

        console.log('recordRouteWhere', recordRouteWhere);

        return {
            data: {
                posts,
                obstacles,
                locations,
                recordRoutes,
            },
            total: {
                posts: postTotal,
                obstacles: obstacleTotal,
                locations: locationTotal,
                recordRoutes: recordRouteTotal,
            },
        };
    },
};

export default globalSearchService;
