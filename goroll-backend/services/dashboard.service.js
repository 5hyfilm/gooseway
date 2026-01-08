import db from '../models/database.js';
import { QueryTypes, Op } from 'sequelize';
const { sequelize, activityLog, user } = db;

const dashboardService = {
    async dashboard(day) {
        let whereLocation = '';
        let whereAccessLevel = '';
        let whereObstacleCategory = '';
        let whereLog = '';
        let replacements = {};

        if (day != 'All') {
            whereLocation = `WHERE location.created_at >= NOW() - INTERVAL :intervalText`;
            whereAccessLevel = `WHERE location.created_at >= NOW() - INTERVAL :intervalText`;
            whereObstacleCategory = `WHERE ob.created_at >= NOW() - INTERVAL :intervalText`;
            whereLog = `and a.created_at >= NOW() - INTERVAL :intervalText`;
            replacements.intervalText = `${day} day`;
        }

        const [user] = await sequelize.query(
            `
            WITH monthly_users AS (
                SELECT
                    DATE_TRUNC('month', created_at) AS month,
                    COUNT(1) AS user_count
                FROM users
                GROUP BY DATE_TRUNC('month', created_at)
                ORDER BY month DESC
                LIMIT 2
            ),
            total_users AS (
                SELECT COUNT(1) AS total_user_count FROM users
            )
            SELECT
                (SELECT total_user_count FROM total_users) AS "totalUsers",
                COALESCE((SELECT user_count FROM monthly_users ORDER BY month DESC LIMIT 1 OFFSET 0), 0) AS "thisMonth",
                COALESCE((SELECT user_count FROM monthly_users ORDER BY month DESC LIMIT 1 OFFSET 1), 0) AS "lastMonth",
                ROUND(
                    CASE 
                        WHEN COALESCE((SELECT user_count FROM monthly_users ORDER BY month DESC LIMIT 1 OFFSET 1), 0) = 0 
                        THEN (
                            (
                                COALESCE((SELECT user_count FROM monthly_users ORDER BY month DESC LIMIT 1 OFFSET 0), 0) -
                                0
                            )::numeric / 1
                        ) * 100
                        ELSE (
                            (
                                COALESCE((SELECT user_count FROM monthly_users ORDER BY month DESC LIMIT 1 OFFSET 0), 0) -
                                COALESCE((SELECT user_count FROM monthly_users ORDER BY month DESC LIMIT 1 OFFSET 1), 0)
                            )::numeric /
                            NULLIF(COALESCE((SELECT user_count FROM monthly_users ORDER BY month DESC LIMIT 1 OFFSET 1), 0), 0)
                        ) * 100
                    END, 2
                ) AS "growthPercent";
                `,
            { type: QueryTypes.SELECT },
        );
        const [location] = await sequelize.query(
            `
            WITH monthly_locations AS (
                SELECT
                    DATE_TRUNC('month', created_at) AS month,
                    COUNT(1) AS location_count
                FROM locations
                GROUP BY DATE_TRUNC('month', created_at)
                ORDER BY month DESC
                LIMIT 2
            ),
            total_locations AS (
                SELECT COUNT(1) AS total_location_count FROM locations
            )
            SELECT
                (SELECT total_location_count FROM total_locations) AS "totalLocation",
                COALESCE((SELECT location_count FROM monthly_locations ORDER BY month DESC LIMIT 1 OFFSET 0), 0) AS "thisMonth",
                COALESCE((SELECT location_count FROM monthly_locations ORDER BY month DESC LIMIT 1 OFFSET 1), 0) AS "lastMonth",
                ROUND(
                    CASE 
                        WHEN COALESCE((SELECT location_count FROM monthly_locations ORDER BY month DESC LIMIT 1 OFFSET 1), 0) = 0 
                        THEN (
                            (
                                COALESCE((SELECT location_count FROM monthly_locations ORDER BY month DESC LIMIT 1 OFFSET 0), 0) - 0
                            )::numeric / 1
                        ) * 100
                        ELSE (
                            (
                                COALESCE((SELECT location_count FROM monthly_locations ORDER BY month DESC LIMIT 1 OFFSET 0), 0) -
                                COALESCE((SELECT location_count FROM monthly_locations ORDER BY month DESC LIMIT 1 OFFSET 1), 0)
                            )::numeric /
                            COALESCE((SELECT location_count FROM monthly_locations ORDER BY month DESC LIMIT 1 OFFSET 1), 0)
                        ) * 100
                    END, 2
            ) AS "growthPercent";
            `,
            { type: QueryTypes.SELECT },
        );
        const [obstacles] = await sequelize.query(
            `
            WITH monthly_obstacles AS (
                SELECT
                    DATE_TRUNC('month', created_at) AS month,
                    COUNT(1) AS obstacle_count
                FROM obstacles
                GROUP BY DATE_TRUNC('month', created_at)
                ORDER BY month DESC
                LIMIT 2
            ),
            total_obstacles AS (
                SELECT COUNT(1) AS total_obstacle_count FROM obstacles
            )
            SELECT
                (SELECT total_obstacle_count FROM total_obstacles) AS "totalObstacle",
                COALESCE((SELECT obstacle_count FROM monthly_obstacles ORDER BY month DESC LIMIT 1 OFFSET 0), 0) AS "thisMonth",
                COALESCE((SELECT obstacle_count FROM monthly_obstacles ORDER BY month DESC LIMIT 1 OFFSET 1), 0) AS "lastMonth",
                ROUND(
                    (
                        COALESCE((SELECT obstacle_count FROM monthly_obstacles ORDER BY month DESC LIMIT 1 OFFSET 0), 0) -
                        COALESCE((SELECT obstacle_count FROM monthly_obstacles ORDER BY month DESC LIMIT 1 OFFSET 1), 0)
                    )::numeric /
                    CASE 
                        WHEN COALESCE((SELECT obstacle_count FROM monthly_obstacles ORDER BY month DESC LIMIT 1 OFFSET 1), 0) = 0 
                        THEN 1
                        ELSE COALESCE((SELECT obstacle_count FROM monthly_obstacles ORDER BY month DESC LIMIT 1 OFFSET 1), 0)
                    END
                    * 100
                ,2) AS "growthPercent";

            `,
            { type: QueryTypes.SELECT },
        );
        const [review] = await sequelize.query(
            `
            WITH monthly_reviews AS (
                SELECT
                    DATE_TRUNC('month', created_at) AS month,
                    COUNT(1) AS review_count
                FROM location_reviews
                GROUP BY DATE_TRUNC('month', created_at)
                ORDER BY month DESC
                LIMIT 2
            ),
            total_reviews AS (
                SELECT COUNT(1) AS total_review_count FROM location_reviews
            )
            SELECT
                (SELECT total_review_count FROM total_reviews) AS "totalReview",
                COALESCE((SELECT review_count FROM monthly_reviews ORDER BY month DESC LIMIT 1 OFFSET 0), 0) AS "thisMonth",
                COALESCE((SELECT review_count FROM monthly_reviews ORDER BY month DESC LIMIT 1 OFFSET 1), 0) AS "lastMonth",
                ROUND(
                    (
                        COALESCE((SELECT review_count FROM monthly_reviews ORDER BY month DESC LIMIT 1 OFFSET 0), 0) -
                        COALESCE((SELECT review_count FROM monthly_reviews ORDER BY month DESC LIMIT 1 OFFSET 1), 0)
                    )::numeric /
                    CASE 
                        WHEN COALESCE((SELECT review_count FROM monthly_reviews ORDER BY month DESC LIMIT 1 OFFSET 1), 0) = 0
                        THEN 1
                        ELSE COALESCE((SELECT review_count FROM monthly_reviews ORDER BY month DESC LIMIT 1 OFFSET 1), 0)
                    END
                    * 100
                ,2) AS "growthPercent";

            `,
            { type: QueryTypes.SELECT },
        );
        const log = await sequelize.query(
            `
            SELECT a.entity_type as "entityType",
                a.action as "action",
                u.full_name as "userName",
                a.created_at as "createdAt",
                a.metadata as "metaData"
                FROM activity_log a
                join users u on a.user_id = u.id
                where a."action" != 'login'
                ${whereLog}
                order by a.created_at desc
                limit 5;
            `,
            { type: QueryTypes.SELECT, replacements },
        );
        const locationCategory = await sequelize.query(
            `
            SELECT
                location.category_id as "categoryId",
                lc.name_th AS "categoryName",
                COUNT(1) AS count,
                ROUND(
                    COUNT(1) * 100.0 / SUM(COUNT(1)) OVER (),
                    2
                ) AS percent
            FROM locations location
            join location_categories lc on location.category_id = lc.id
            ${whereLocation}
            GROUP BY location.category_id, lc.name_th
            ORDER BY location.category_id;
            `,
            { type: QueryTypes.SELECT, replacements },
        );
        const locationCategoryAccessLevel = await sequelize.query(
            `
            SELECT
                location.category_id as "categoryId",
                lc.name_th AS "categoryName",
                la.id AS "accessLevelId",
                la.name_th AS "accessLevelName",
                COUNT(1) AS count,
                ROUND(
                    COUNT(1) * 100.0 / SUM(COUNT(1)) OVER (PARTITION BY category_id),
                    2
                ) AS percent
            FROM locations location
            join access_level la on location.access_level_id = la.id
            join location_categories lc on location.category_id = lc.id
            ${whereAccessLevel}
            GROUP BY location.category_id, lc.name_th, la.id, la.name_th
            ORDER BY location.category_id;
        `,
            { type: QueryTypes.SELECT, replacements },
        );
        const obstacleCategory = await sequelize.query(
            `
            SELECT
                oc.id as "categoryId",
                oc.name_th AS "categoryName",            
                COUNT(1) AS count,
                ROUND(
                COUNT(1) * 100.0 / SUM(COUNT(1)) OVER (),
                2
                ) AS percent
            FROM obstacles ob
            join obstacle_subcategories osc on ob.subcategory_id = osc.id
            join obstacle_categories oc on oc.id = osc.category_id
            ${whereObstacleCategory}
            GROUP BY oc.id, oc.name_th      
            ORDER BY oc.id;
        `,
            { type: QueryTypes.SELECT, replacements },
        );

        const result = {
            user: user,
            location: location,
            obstacle: obstacles,
            review: review,
            log: log,
            locationCategory: locationCategory,
            obstacleCategory: obstacleCategory,
            locationCategoryAccessLevel: locationCategoryAccessLevel,
        };

        return result;
    },
    async findLogAll(queryOptions, criteria) {
        let where = {};
        where['action'] = { [db.Sequelize.Op.ne]: 'login' };

        if (criteria.entityType) {
            where['entityType'] = criteria.entityType;
        }

        if (criteria.userName) {
            where[Op.and] = db.Sequelize.literal(`
            (
            SELECT LOWER(full_name)
            FROM users AS "user"
            WHERE "user"."id" = "ActivityLog"."user_id"
            ) LIKE '%${criteria.userName.toLowerCase()}%'
        `);
        }

        const data = criteria.countOnly
            ? undefined
            : await activityLog.findAll({
                  attributes: [
                      'id',
                      'entityType',
                      'action',
                      'userId',
                      'createdAt',
                      'entityId',
                      ['metadata', 'metaData'],
                      [
                          db.Sequelize.literal(`(
              SELECT full_name
              FROM users AS "user"
              WHERE "user"."id" = "ActivityLog"."user_id"
            )`),
                          'fullName',
                      ],
                  ],
                  where,
                  ...queryOptions,
                  order: queryOptions?.order ?? [['createdAt', 'DESC']],
              });

        const total = await activityLog.count({
            where,
        });

        return {
            data,
            total,
        };
    },
};

export default dashboardService;
