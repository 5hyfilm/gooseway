import { Op, or, Sequelize } from 'sequelize';
import db from '../models/database.js';

const {
    location,
    locationFeatureMedia,
    locationReview,
    user,
    locationCategory,
    accessLevel,
    locationFeatureMediaImg,
    locationImg,
} = db;

const locationService = {
    async findById(locationId, userId) {
        let newLocation = await location.findByPk(locationId, {
            include: [
                {
                    model: locationReview,
                    as: 'reviews',
                    include: {
                        model: user,
                        as: 'user',
                        attributes: ['fullName', 'avatarUrl'],
                    },
                    order: [['createdAt', 'DESC']],
                },
                {
                    model: locationImg,
                    as: 'img',
                    attributes: ['id', 'imageUrl'],
                },
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
                    model: locationFeatureMedia,
                    as: 'featureMedia',
                    attributes: ['featureId', 'isGood'],
                    include: [
                        {
                            model: locationFeatureMediaImg,
                            as: 'img',
                            attributes: ['id', 'imageUrl', 'featureMediaId'],
                        },
                    ],
                },
            ],
            order: [['createdAt', 'ASC']],
        });

        if (!newLocation) return null;

        newLocation = newLocation.toJSON();

        const groupedMap = newLocation.featureMedia.reduce((acc, item) => {
            const { featureId, img, isGood } = item;

            if (!acc[featureId]) {
                acc[featureId] = {
                    featureId,
                    img: [],
                    goodCount: 0,
                    notGoodCount: 0,
                };
            }

            acc[featureId].img.push(...img);
            if (isGood === true) {
                acc[featureId].goodCount += 1;
            }
            if (isGood === false) {
                acc[featureId].notGoodCount += 1;
            }

            return acc;
        }, {});

        const userFeatureMedia = await locationFeatureMedia.findAll({
            where: {
                locationId,
                userId,
            },
            attributes: ['featureId', 'isGood'],
            raw: true,
        });

        const userIsGoodMap = userFeatureMedia.reduce((acc, item) => {
            acc[item.featureId] = item.isGood;
            return acc;
        }, {});

        const groupedFeatureMedia = Object.values(groupedMap).map(group => {
            const uniqueImgs = Array.from(new Map(group.img.map(i => [i.id, i])).values());
            return {
                featureId: group.featureId,
                featureMediaId: uniqueImgs[0]?.featureMediaId ?? null,
                isGood: userIsGoodMap[group.featureId] ?? null,
                goodCount: group.goodCount,
                notGoodCount: group.notGoodCount,
                img: uniqueImgs,
            };
        });

        newLocation.featureMedia = groupedFeatureMedia;

        return newLocation;
    },
    async insert(locationPayload) {
        const newLocation = await location.create(locationPayload);
        return newLocation;
    },
    async findAll(queryOptions, criteria) {
        let where = {};

        if (criteria.name) {
            where[Op.and] = [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('"Location".name')), {
                    [Op.like]: `%${criteria.name.toLowerCase()}%`,
                }),
            ];
        }

        if (criteria.categoryId) {
            where['categoryId'] = criteria.categoryId;
        }

        if (criteria.accessLevelId) {
            where['accessLevelId'] = criteria.accessLevelId;
        }

        const data = criteria.countOnly
            ? undefined
            : await location.findAll({
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
                  where,
                  ...queryOptions,
              });

        const total = await location.count({
            where,
        });

        return {
            data,
            total,
        };
    },
    async findAllForMap() {
        const locations = await location.findAll({
            attributes: ['id', 'name', 'latitude', 'longitude', 'description', 'accessLevelId', 'categoryId'],
            include: [
                {
                    model: accessLevel,
                    as: 'accessLevel',
                    attributes: ['id', 'nameEn', 'nameTh'],
                },
                {
                    model: locationCategory,
                    as: 'category',
                    attributes: ['id', 'nameEn', 'nameTh'],
                },
            ],
        });
        return locations;
    },
    async findDetailById(locationId) {
        const locationData = await location.findByPk(locationId, {
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
          SELECT COUNT(1) 
          FROM location_reviews AS lr 
          WHERE lr.location_id = "Location".id
        )`),
                        'reviewCount',
                    ],
                    [
                        Sequelize.literal(`(
          SELECT AVG(rating) 
          FROM location_reviews AS lr 
          WHERE lr.location_id = "Location".id
        )`),
                        'averageRating',
                    ],
                ],
            },
            include: [
                {
                    model: locationImg,
                    as: 'img',
                    attributes: ['id', 'imageUrl'],
                },
                {
                    model: accessLevel,
                    as: 'accessLevel',
                    attributes: ['id', 'nameEn', 'nameTh'],
                },
                {
                    model: locationCategory,
                    as: 'category',
                    attributes: ['id', 'nameEn', 'nameTh'],
                },
            ],
        });

        const locationMap = {
            id: locationData.id,
            name: locationData.name,
            categoryId: locationData.categoryId,
            categoryName: locationData.category?.name ?? null,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            description: locationData.description,
            accessLevelId: locationData.accessLevel?.id ?? null,
            accessLevelName: locationData.accessLevel?.name ?? null,
            reviewCount: locationData.get('reviewCount') ?? 0,
            averageRating: locationData.get('averageRating') ?? 0,
            img: locationData.img.map(i => i.imageUrl),
            accessLevel: {
                id: locationData.accessLevel?.id ?? null,
                nameEn: locationData.accessLevel?.nameEn ?? null,
                nameTh: locationData.accessLevel?.nameTh ?? null,
            },
            category: {
                id: locationData.category?.id ?? null,
                nameEn: locationData.category?.nameEn ?? null,
                nameTh: locationData.category?.nameTh ?? null,
            },
        };

        return locationMap;
    },
    async update(obj) {
        const { id, ...updateData } = obj;
        location.update(updateData, {
            where: { id: id },
        });
    },
    async delete(locationId) {
        await location.destroy({
            where: { id: locationId },
        });
    },
    async findLocationByName(locationName, id) {
        return await location.findOne({
            where: {
                name: locationName,
                ...(id && { id: { [Op.ne]: id } }),
            },
        });
    },
    async calAccessibility(locationId) {
        const result = await db.sequelize.query(
            `
            SELECT lf.id as "featureId",
          SUM(CASE WHEN lfm.is_good = TRUE THEN 1 ELSE 0 END) AS "thumbsUpCount",
          SUM(CASE WHEN lfm.is_good = FALSE THEN 1 ELSE 0 END) AS "thumbsDownCount"
      FROM location_feature lf
      left join location_feature_media lfm on lf.id = lfm.feature_id
      and location_id = :locationId
      where lf.id not in (8,9)
      GROUP BY lf.id
      order by lf.id;
      `,
            {
                type: db.Sequelize.QueryTypes.SELECT,
                replacements: { locationId },
            },
        );
        console.log('Accessibility calculation result:', result);
        const parsed = result.map(r => ({
            ...r,
            thumbsUpCount: Number(r.thumbsUpCount),
            thumbsDownCount: Number(r.thumbsDownCount),
        }));
        const allGreen = parsed.every(r => r.thumbsUpCount > r.thumbsDownCount);
        const redCount = parsed.filter(r => r.thumbsUpCount < r.thumbsDownCount).length;
        const equalCount = parsed.every(r => r.thumbsUpCount === 0 && r.thumbsDownCount === 0);
        let status;
        if (allGreen) {
            console.log('green');
            status = 1;
        } else if (equalCount) {
            console.log('gray');
            status = 4;
        } else if (redCount > 4) {
            console.log('red');
            status = 3;
        } else {
            console.log('yellow');
            status = 2;
        }
        await location.update(
            { accessLevelId: status },
            {
                where: { id: locationId, isAutoStatus: true },
            },
        );
        return status;
    },
};

export default locationService;
