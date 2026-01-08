import locationService from '../services/location.service.js';
import locationFeatureMediaService from '../services/locationFeatureMedia.service.js';
import locationReviewService from '../services/locationReview.service.js';
import locationImgService from '../services/locationImg.service.js';
import locationFeatureMediaImgService from '../services/locationFeatureMediaImg.service.js';
import db from '../models/database.js';
import { criteriaConverter } from '../utils/helper.js';
import { logActivity } from '../utils/logActivity.js';
import ExcelJS from 'exceljs';
import moment from 'moment';

function getCurrentTimestamp() {
    const now = new Date();
    return now
        .toISOString()
        .replace(/[-:.TZ]/g, '')
        .slice(0, 14);
}

const locationController = {
    async insert(req, res, next) {
        console.log('Start location insert');
        try {
            console.log(req.body);
            await db.sequelize.transaction(async () => {
                const { categoryId, name, accessLevelId, description, latitude, longitude, imageUrl, isAutoStatus } =
                    req.body.location;
                let location = {
                    categoryId: categoryId,
                    name: name,
                    accessLevelId: accessLevelId,
                    description: description,
                    latitude: latitude,
                    longitude: longitude,
                    userId: req.user.id,
                    isAutoStatus: isAutoStatus,
                };
                console.log('location', location);

                const nameLocation = await locationService.findLocationByName(location.name);
                if (nameLocation) {
                    return res.status(400).send({ message: 'Location name already exists' });
                }

                const newLocation = await locationService.insert(location);

                if (imageUrl?.length) {
                    const locationImgData = imageUrl.map(url => ({
                        locationId: newLocation.id,
                        imageUrl: url,
                    }));
                    await locationImgService.bulkInsert(locationImgData);
                }

                const features = req.body.features || [];
                const featureMediaPayload = features.map(f => ({
                    featureId: f.featureId,
                    isGood: f.isGood,
                    locationId: newLocation.id,
                    userId: req.user.id,
                }));

                const createdFeatureMedia = await locationFeatureMediaService.bulkInsert(featureMediaPayload);

                const featureImgData = createdFeatureMedia.flatMap((media, index) => {
                    const imgs = features[index].imageUrl || [];
                    return imgs.map(url => ({
                        featureMediaId: media.id,
                        imageUrl: url,
                    }));
                });

                if (featureImgData.length) {
                    await locationFeatureMediaImgService.bulkInsert(featureImgData);
                }

                if (req.body.review) {
                    const reviewData = {
                        ...req.body.review,
                        locationId: newLocation.id,
                        userId: req.user.id,
                    };

                    await locationReviewService.insert(reviewData);
                }

                await logActivity({
                    userId: req.user.id,
                    action: 'create_location',
                    entityType: 'location',
                    entityId: newLocation.id,
                    metadata: {
                        ...location,
                    },
                });
            });

            console.log('End location insert');
            res.sendStatus(200);
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findById(req, res, next) {
        console.log('Start location findById');
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const location = await locationService.findById(id, userId);
            res.send(location);
            console.log('End location findById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findDetailById(req, res, next) {
        console.log('Start location findDetailById');
        try {
            const { id } = req.params;

            const location = await locationService.findDetailById(id);
            res.send(location);
            console.log('End location findDetailById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findAll(req, res, next) {
        console.log('Start location findAll');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const location = await locationService.findAll(queryOptions, criteria);
            res.send(location);
            console.log('End location findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findAllForMap(req, res, next) {
        console.log('Start location findAllForMap');
        try {
            const location = await locationService.findAllForMap();
            await res.send(location);
            console.log('End location findAllForMap');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findFeatureAll(req, res, next) {
        console.log('Start location findFeatureAll');
        try {
            const { locationId } = req.params;
            const locationFeature = await locationFeatureMediaService.findFeatureAll(locationId);
            res.send(locationFeature);
            console.log('End location findFeatureAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findFeature(req, res, next) {
        console.log('Start location findFeature');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            criteria.userId = req.user.id;
            const locationFeature = await locationFeatureMediaService.findFeature(queryOptions, criteria);
            res.send(locationFeature);
            console.log('End location findFeature');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async reviewLocationFeature(req, res, next) {
        console.log('Start location reviewLocationFeature');
        try {
            const { features } = req.body;
            const featureMediaPayload = {
                featureId: features.featureId,
                isGood: features.isGood == undefined ? null : features.isGood,
                locationId: features.locationId,
                userId: req.user.id,
            };
            console.log('featureMediaPayload', featureMediaPayload);
            await locationFeatureMediaService.insert(featureMediaPayload);
            res.sendStatus(200);
            console.log('End location reviewLocationFeature');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async reviewLocationFeatureImg(req, res, next) {
        console.log('Start location reviewLocationFeatureImg');
        try {
            const { features } = req.body;
            const featureMediaPayload = {
                featureId: features.featureId,
                locationId: features.locationId,
                userId: req.user.id,
            };
            console.log('featureMediaPayload', featureMediaPayload);
            await db.sequelize.transaction(async () => {
                const featureMedia = await locationFeatureMediaService.findFeatureMedia(featureMediaPayload);
                let newFeatureMedia;
                if (!featureMedia) {
                    newFeatureMedia = await locationFeatureMediaService.insert(featureMediaPayload);
                }
                const featureMediaId = featureMedia?.id || newFeatureMedia?.id;
                if (!featureMediaId) {
                    throw new Error('location is not invalid');
                }
                const featureImgData = features.imageUrl.map(img => ({
                    featureMediaId: featureMediaId,
                    imageUrl: img,
                }));
                console.log('featureImgData', featureImgData);

                if (featureImgData.length) {
                    await locationFeatureMediaImgService.bulkInsert(featureImgData);
                }
            });
            res.sendStatus(200);
            console.log('End location reviewLocationFeatureImg');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async reviewLocation(req, res, next) {
        console.log('Start location reviewLocation');
        try {
            const { review } = req.body;

            const reviewData = {
                ...review,
                userId: req.user.id,
            };
            const reviewLocation = await locationReviewService.insert(reviewData);
            await logActivity({
                userId: req.user.id,
                action: 'review_location',
                entityType: 'location',
                entityId: reviewLocation.id,
                metadata: {
                    ...review,
                },
            });
            res.sendStatus(200);
            console.log('End location reviewLocation');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findReviewById(req, res, next) {
        console.log('Start location findReviewById');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const locationReview = await locationReviewService.findReviewById(queryOptions, criteria);
            res.send(locationReview);
            console.log('End location findReviewById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async deleteReviewById(req, res, next) {
        console.log('Start location deleteReviewById');
        try {
            const { id } = req.params;
            console.log(id);

            await locationReviewService.deleteReview(id);
            res.sendStatus(200);
            console.log('End location deleteReviewById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async updateLocation(req, res, next) {
        console.log('Start location updateLocation');
        try {
            const location = req.body;
            const locationPayload = {
                id: location.id,
                categoryId: location.categoryId,
                name: location.name,
                accessLevelId: location.accessLevelId,
                description: location.description,
                latitude: location.latitude,
                longitude: location.longitude,
                updateBy: req.user.id,
                isAutoStatus: location.isAutoStatus,
            };

            await db.sequelize.transaction(async () => {
                const name = await locationService.findLocationByName(locationPayload.name, locationPayload.id);
                if (name) {
                    return res.status(400).send({ message: 'Location name already exists' });
                }

                await locationService.update(locationPayload);
                if (location) {
                    console.log('imgLocationDelete', location.imgLocationDelete);
                    await locationImgService.delete(location.imgLocationDelete);
                }
                if (location.imgLocationAdd) {
                    const locationImgData = location.imgLocationAdd.map(url => ({
                        locationId: location.id,
                        imageUrl: url.imageUrl,
                    }));

                    await locationImgService.bulkInsert(locationImgData);
                }

                if (Array.isArray(location.featureMedia)) {
                    for (const fm of location.featureMedia) {
                        if (fm.imgDelete?.length) {
                            console.log('====>imgDelete', fm.imgDelete);

                            await locationFeatureMediaImgService.delete(fm.imgDelete);
                        }
                        if (fm.imgAdd?.length) {
                            console.log('====>imgAdd', fm.imgAdd);
                            const imgData = fm.imgAdd.map(a => ({
                                imageUrl: a.imageUrl,
                            }));
                            await locationFeatureMediaImgService.bulkUpdate(
                                imgData,
                                fm.featureId,
                                req.user.id,
                                location.id,
                            );
                        }
                    }
                }
                await logActivity({
                    userId: req.user.id,
                    action: 'update_location',
                    entityType: 'location',
                    entityId: location.id,
                    metadata: {
                        ...locationPayload,
                    },
                });
            });
            res.sendStatus(200);
            console.log('End location updateLocation');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async delete(req, res, next) {
        console.log('Start location delete');
        try {
            const { id } = req.params;
            console.log('id', id);

            await locationService.delete(id);
            await logActivity({
                userId: req.user.id,
                action: 'delete_location',
                entityType: 'location',
                entityId: id,
                metadata: {
                    id: id,
                },
            });
            res.sendStatus(200);
            console.log('End location delete');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findAvgReviewById(req, res, next) {
        console.log('Start location findAvgReviewById');
        try {
            const { id } = req.params;
            const locationReview = await locationReviewService.findAvgReviewById(id);
            res.send(locationReview);
            console.log('End location findAvgReviewById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async export(req, res, next) {
        console.log('Start location export');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const locationList = await locationService.findAll(queryOptions, criteria);
            console.log('locationList', locationList.data.name);

            const fileName = `Locations_${getCurrentTimestamp()}.xlsx`;
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('data');

            // Title row
            sheet.addRow([`Location Report - ${moment().format('DD/MM/YYYY HH:mm')}`]);

            sheet.mergeCells(`A1:E1`);
            sheet.getCell('A1').font = { bold: true, size: 14 };
            sheet.getCell('A1').alignment = { horizontal: 'center' };

            // Header row at row 3
            const headerRow = sheet.addRow(['No', 'Location Name', 'Category', 'AccessLevel', 'Coordinates']);

            // style ้ header row
            headerRow.eachCell(cell => {
                cell.font = { bold: true };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'D6EAF8' },
                };
            });
            sheet.getRow(headerRow.number).height = 25;

            // Set column widths
            sheet.getColumn(1).width = 5; // No
            sheet.getColumn(2).width = 25; // Location Name
            sheet.getColumn(3).width = 20; // Category
            sheet.getColumn(4).width = 20; // AccessLevel
            sheet.getColumn(5).width = 30; // Coordinates

            // Data rows
            let no = 1;
            for (const data of locationList.data) {
                const row = sheet.addRow([
                    no++,
                    data.name,
                    data.category.nameTh,
                    data.accessLevel.nameTh,
                    `${data.latitude}, ${data.longitude}`,
                ]);

                row.eachCell({ includeEmpty: true }, cell => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                });
            }

            const buffer = await workbook.xlsx.writeBuffer();

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.send(buffer);

            console.log('End location export');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async updateReview(req, res, next) {
        console.log('Start location updateReview');
        try {
            const review = req.body;
            let payload = {
                rating: review.rating,
                reviewText: review.reviewText,
            };
            const userId = req.user.id;

            await locationReviewService.updateReview(review.id, payload, userId);

            res.sendStatus(200);
            console.log('End location updateReview');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async calAccessibility(req, res, next) {
        console.log('Start location calAccessibility');
        try {
            const { locationId } = req.params;
            const status = await locationService.calAccessibility(locationId);

            res.send({ status });
            console.log('End location calAccessibility');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default locationController;
