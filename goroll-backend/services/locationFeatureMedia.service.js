import db from '../models/database.js';

const { locationFeatureMedia, locationFeatureMediaImg, locationFeature, Sequelize } = db;

const locationMediaService = {
    async bulkInsert(locationPayload) {
        const newLocationMedia = await locationFeatureMedia.bulkCreate(locationPayload, {
            returning: true,
        });
        return newLocationMedia;
    },
    async insert(locationPayload) {
        const [newLocationMedia, created] = await locationFeatureMedia.findOrCreate({
            where: {
                userId: locationPayload.userId,
                locationId: locationPayload.locationId,
                featureId: locationPayload.featureId,
            },
            defaults: locationPayload,
        });

        if (!created) {
            await newLocationMedia.update(locationPayload);
        }
        return newLocationMedia;
    },
    async findFeatureMedia(locationPayload) {
        return await locationFeatureMedia.findOne({
            where: {
                userId: locationPayload.userId,
                locationId: locationPayload.locationId,
                featureId: locationPayload.featureId,
            },
        });
    },

    async findFeatureAll(locationId) {
        let where = {};
        where['locationId'] = locationId;

        const data = await locationFeatureMedia.findAll({
            attributes: [
                'featureId',
                [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN "is_good" = true THEN 1 ELSE 0 END')), 'isGoodCount'],
                [
                    Sequelize.fn('SUM', Sequelize.literal('CASE WHEN "is_good" = false THEN 1 ELSE 0 END')),
                    'isNotGoodCount',
                ],
            ],
            include: [
                {
                    model: locationFeature,
                    as: 'feature',
                    attributes: ['nameEn', 'nameTh'],
                },
            ],
            where,
            group: ['featureId', 'feature.id', 'feature.name_en', 'feature.name_th'],
            order: ['featureId'],
        });

        const mapped = data.map(item => ({
            featureId: item.featureId,
            isGoodCount: Number(item.dataValues.isGoodCount),
            isNotGoodCount: Number(item.dataValues.isNotGoodCount),
            nameEn: item.feature?.nameEn,
            nameTh: item.feature?.nameTh,
        }));

        return mapped;
    },

    async findFeature(queryOptions, criteria) {
        let where = {};
        let whereImg = {};

        if (criteria.locationId) {
            where['locationId'] = criteria.locationId;
        }

        if (criteria.featureId) {
            where['featureId'] = criteria.featureId;
        }

        if (criteria.last24hrs === true) {
            const last24hrs = new Date(Date.now() - 24 * 60 * 60 * 1000);
            whereImg.createdAt = {
                [db.Sequelize.Op.gte]: last24hrs,
            };
        }

        const data = criteria.countOnly
            ? undefined
            : await locationFeatureMedia.findAll({
                  include: [
                      {
                          model: locationFeatureMediaImg,
                          as: 'img',
                          attributes: ['id', 'imageUrl'],
                          where: whereImg,
                          required: false,
                      },
                  ],
                  attributes: {
                      include: [
                          [
                              Sequelize.literal(`(
                                SELECT COUNT(1)
                                FROM "location_feature_media" AS "featureMedia"
                                WHERE "featureMedia"."feature_id" = ${criteria.featureId}
                                and "featureMedia"."location_id" = ${criteria.locationId}
                                and "featureMedia"."is_good" = true
                            )`),
                              'isGoodCount',
                          ],
                          [
                              Sequelize.literal(`(
                                SELECT COUNT(1)
                                FROM "location_feature_media" AS "featureMedia"
                                WHERE "featureMedia"."feature_id" = ${criteria.featureId}
                                and "featureMedia"."location_id" = ${criteria.locationId}
                                and "featureMedia"."is_good" = false
                            )`),
                              'isNotGoodCount',
                          ],
                          [
                              Sequelize.literal(`(
                                SELECT is_good
                                FROM location_feature_media AS "featureMedia"
                                WHERE "featureMedia"."feature_id" = ${criteria.featureId}
                                and "featureMedia"."location_id" = ${criteria.locationId}
                                and "featureMedia"."user_id" = ${criteria.userId}
                            )`),
                              'isLike',
                          ],
                      ],
                  },
                  where,
                  order: [[{ model: locationFeatureMediaImg, as: 'img' }, 'id', 'DESC']],
              });

        console.log('Data fetched:', data);

        const firstItem = data[0] || {};

        const allImages = data.flatMap(item =>
            (item.img ?? []).map(img => ({
                imgId: img.id,
                imgUrl: img.imageUrl,
            })),
        );

        const total = allImages.length;

        const { limit = total, offset = 0 } = queryOptions;

        const pagedImages = allImages.slice(offset, offset + limit);

        const mapped = {
            isGoodCount: firstItem.isGoodCount ?? firstItem.dataValues?.isGoodCount,
            isNotGoodCount: firstItem.isNotGoodCount ?? firstItem.dataValues?.isNotGoodCount,
            isLike: firstItem.isLike ?? firstItem.dataValues?.isLike,
            img: pagedImages,
        };

        return {
            data: mapped,
            total,
        };
    },
};

export default locationMediaService;
