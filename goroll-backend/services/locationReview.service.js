import db from '../models/database.js';

const { locationReview, user } = db;

const locationReviewService = {
    async insert(reviewPayload) {
        const newLocationReview = await locationReview.create(reviewPayload);
        return newLocationReview;
    },
    async findReviewById(queryOptions, criteria) {
        let where = {};

        if (criteria.last24hrs === true) {
            const last24hrs = new Date(Date.now() - 24 * 60 * 60 * 1000);
            where.createdAt = {
                [db.Sequelize.Op.gte]: last24hrs,
            };
        }

        where.locationId = criteria.locationId;

        const data = criteria.countOnly
            ? undefined
            : await locationReview.findAll({
                  include: [
                      {
                          model: user,
                          as: 'user',
                          attributes: ['fullName', 'avatarUrl', 'createdAt'],
                      },
                  ],
                  where,
                  ...queryOptions,
              });

        const total = await locationReview.count({
            where,
        });

        return {
            data,
            total,
        };
    },

    async findAvgReviewById(locationId) {
        let where = {};
        where.locationId = locationId;

        const [avgResult] = await db.sequelize.query(
            `
            SELECT 
                AVG(rating) AS averageRating,
                COUNT(1) AS reviewCount
            FROM location_reviews
            WHERE location_id = :locationId
            `,
            {
                replacements: { locationId },
                type: db.Sequelize.QueryTypes.SELECT,
            },
        );

        const data = await locationReview.findAll({
            attributes: ['rating', [locationReview.sequelize.fn('COUNT', 1), 'count']],
            where,
            group: ['rating'],
            raw: true,
        });
        return {
            avg: avgResult,
            data,
        };
    },

    async deleteReview(id) {
        await locationReview.destroy({
            where: { id: id },
        });
    },
    async updateReview(id, reviewPayload, userId) {
        const existingReview = await locationReview.findByPk(id);
        if (!existingReview) {
            throw new Error('Review not found');
        }
        if (existingReview.userId !== userId) {
            throw new Error('You can only update your own reviews.');
        }

        const updatedReview = await locationReview.update(reviewPayload, {
            where: { id: id },
            returning: true,
        });
        return updatedReview[1][0];
    },
};

export default locationReviewService;
