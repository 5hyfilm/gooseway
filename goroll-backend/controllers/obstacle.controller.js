import obstacleService from '../services/obstacle.service.js';
import obstacleImgService from '../services/obstacleImg.service.js';
import obstacleConfirmationService from '../services/obstacleConfirmation.service.js';
import db from '../models/database.js';
import { criteriaConverter } from '../utils/helper.js';
import { logActivity } from '../utils/logActivity.js';
import ExcelJS from 'exceljs';
import moment from 'moment';

const { sequelize } = db;

function getCurrentTimestamp() {
    const now = new Date();
    return now
        .toISOString()
        .replace(/[-:.TZ]/g, '')
        .slice(0, 14);
}

const obstacleController = {
    async findAll(req, res, next) {
        console.log('Start Obstacle findAll');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const obstacle = await obstacleService.findAll(queryOptions, criteria);
            res.send(obstacle);
            console.log('End Obstacle findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async adminFindById(req, res, next) {
        console.log('Start Obstacle adminFindById');
        try {
            const { id } = req.params;
            console.log(id);

            const obstacle = await obstacleService.adminFindById(id);
            res.send(obstacle);
            console.log('End Obstacle adminFindById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findById(req, res, next) {
        console.log('Start Obstacle findById');
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const obstacle = await obstacleService.findById(id, userId);
            res.send(obstacle);
            console.log('End Obstacle findById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async insert(req, res, next) {
        console.log('Start Obstacle insert');
        try {
            const { obstacle, imageUrl } = req.body;
            console.log('body', req.body);
            let newObstacle;
            await sequelize.transaction(async () => {
                const a = {
                    ...obstacle,
                    userId: req.user.id,
                    createdBy: req.user.id,
                    updatedBy: req.user.id,
                };
                newObstacle = await obstacleService.insert(a);
                await obstacleImgService.bulkInsert(newObstacle, imageUrl);

                await logActivity({
                    userId: req.user.id,
                    action: 'create_obstacle',
                    entityType: 'obstacle',
                    entityId: newObstacle.id,
                    metadata: {
                        ...obstacle,
                    },
                });
            });
            res.send(newObstacle);
            console.log('End Obstacle insert');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async update(req, res, next) {
        console.log('Start Obstacle update');
        try {
            const { obstacle, imgObstacleDelete, imgObstacleAdd } = req.body;
            console.log('body', req.body);
            await sequelize.transaction(async () => {
                const obstacleObj = {
                    ...obstacle,
                    updatedBy: req.user.id,
                };
                const obstacleImgObj = {
                    ...obstacle,
                    imgObstacleDelete,
                    imgObstacleAdd,
                };
                await obstacleService.update(obstacleObj);
                await obstacleImgService.update(obstacleImgObj);

                await logActivity({
                    userId: req.user.id,
                    action: 'update_obstacle',
                    entityType: 'obstacle',
                    entityId: obstacle.id,
                    metadata: {
                        ...obstacle,
                    },
                });
            });
            res.sendStatus(200);
            console.log('End Obstacle update');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async delete(req, res, next) {
        console.log('Start Obstacle delete');
        try {
            const { id } = req.params;
            await obstacleService.delete(id);
            await logActivity({
                userId: req.user.id,
                action: 'delete_obstacle',
                entityType: 'obstacle',
                entityId: id,
                metadata: {
                    id: id,
                },
            });
            res.sendStatus(200);
            console.log('End Obstacle delete');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async confirmation(req, res, next) {
        console.log('Start Obstacle confirmation');
        try {
            const { obstacleId, statusId } = req.body;
            console.log('body', req.body);
            let newObstacle;
            const obstacleObj = {
                obstacleId,
                statusId,
                userId: req.user.id,
            };
            await sequelize.transaction(async () => {
                console.log('obstacleObj', obstacleObj);

                const exitingObstacle = await obstacleConfirmationService.findOne(obstacleObj);
                console.log('exitingObstacle', exitingObstacle);

                if (!exitingObstacle) {
                    newObstacle = await obstacleConfirmationService.insert(obstacleObj);
                } else if (statusId) {
                    await obstacleConfirmationService.update(exitingObstacle, statusId);
                } else {
                    await obstacleConfirmationService.delete(exitingObstacle);
                }
            });
            res.send(newObstacle);
            console.log('End Obstacle confirmation');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findAllForMap(req, res, next) {
        console.log('Start Obstacle findAllForMap');
        try {
            const obstacles = await obstacleService.findAllForMap();
            await res.send(obstacles);
            console.log('End Obstacle findAllForMap');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async export(req, res, next) {
        console.log('Start Obstacle export');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const obstaclesList = await obstacleService.findAll(queryOptions, criteria);

            const fileName = `Obstacles_${getCurrentTimestamp()}.xlsx`;
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('data');

            // Title row + datetime
            sheet.addRow([`Obstacles Report - ${moment().format('DD/MM/YYYY HH:mm')}`]);
            sheet.mergeCells(`A1:H1`);
            sheet.getCell('A1').font = { bold: true, size: 16 };
            sheet.getCell('A1').alignment = { horizontal: 'center' };

            // Header row at row 3
            const headerRow = sheet.addRow([
                'No',
                'Date',
                'User',
                'Detail',
                'Category',
                'Type',
                'Coordinates',
                'Status',
            ]);

            // Style header
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
                    fgColor: { argb: 'D6EAF8' }, // ฟ้าอ่อน
                };
            });
            sheet.getRow(headerRow.number).height = 25;

            // Column widths
            sheet.getColumn(1).width = 5; // No
            sheet.getColumn(2).width = 20; // Date
            sheet.getColumn(3).width = 20; // User
            sheet.getColumn(4).width = 40; // Detail
            sheet.getColumn(5).width = 20; // Category
            sheet.getColumn(6).width = 25; // Type
            sheet.getColumn(7).width = 25; // Coordinates
            sheet.getColumn(8).width = 20; // Status

            // Data rows
            let no = 1;
            for (const data of obstaclesList.data) {
                const row = sheet.addRow([
                    no++,
                    moment(data.createdAt).format('DD/MM/YYYY HH:mm'), // format วันที่
                    data.user.fullName,
                    data.description,
                    data.subcategory.category.nameTh,
                    data.subcategory.nameTh,
                    `${data.latitude}, ${data.longitude}`,
                    data.status.nameTh,
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

            console.log('End Obstacle export');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async checkResolve(req, res, next) {
        console.log('Start Obstacle checkResolve');
        try {
            const { obstacleId } = req.params;
            await obstacleService.checkResolve(obstacleId);
            res.sendStatus(200);
            console.log('End Obstacle checkResolve');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default obstacleController;
