import recordedRouteService from '../services/recordedRoute.service.js';
import { criteriaConverter } from '../utils/helper.js';
import db from '../models/database.js';
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

const userController = {
    async adminFindAll(req, res, next) {
        console.log('Start RecordedRoute adminFindAll');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const route = await recordedRouteService.findAll(queryOptions, criteria);
            res.send(route);
            console.log('End RecordedRoute adminFindAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findAll(req, res, next) {
        console.log('Start RecordedRoute findAll');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const route = await recordedRouteService.findAll(queryOptions, criteria);
            res.send(route);
            console.log('End RecordedRoute findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findRouteAll(req, res, next) {
        console.log('Start RecordedRoute findRouteAll');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            criteria.userId = req.user?.id;
            const route = await recordedRouteService.findRouteAll(queryOptions, criteria);
            res.send(route);
            console.log('End RecordedRoute findRouteAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findAllForMap(req, res, next) {
        console.log('Start RecordedRoute findAllForMap');
        try {
            const routes = await recordedRouteService.findAllForMap(req.user?.id);
            await res.send(routes);
            console.log('End RecordedRoute findAllForMap');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findById(req, res, next) {
        console.log('Start RecordedRoute findById');
        try {
            const { id } = req.params;
            const route = await recordedRouteService.findById(id);
            await res.send(route);
            console.log('End RecordedRoute findById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async adminFindById(req, res, next) {
        console.log('Start RecordedRoute adminFindById');
        try {
            const { id } = req.params;
            const route = await recordedRouteService.findById(id);
            await res.send(route);
            console.log('End RecordedRoute adminFindById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async insert(req, res, next) {
        console.log('Start RecordedRoute insert');
        try {
            const {
                name,
                description,
                totalDistanceMeters,
                startLocationName,
                endLocationName,
                time,
                routeCoordinates,
                isPublic,
                routeDate,
            } = req.body;
            let route = {
                name: name,
                description: description,
                totalDistanceMeters: totalDistanceMeters,
                startLocationName: startLocationName,
                endLocationName: endLocationName,
                time: time,
                routeCoordinates: routeCoordinates,
                isPublic: isPublic,
                routeDate: routeDate,
                userId: req.user?.id,
                createdBy: req.user?.id,
                updatedBy: req.user?.id,
            };
            await db.sequelize.transaction(async () => {
                const newRoute = await recordedRouteService.insert(route);
                await logActivity({
                    userId: req.user.id,
                    action: 'create_route',
                    entityType: 'route',
                    entityId: newRoute.id,
                    metadata: {
                        ...route,
                    },
                });
            });
            await res.sendStatus(204);
            console.log('End RecordedRoute insert');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async updateIsPublic(req, res, next) {
        console.log('Start RecordedRoute updateIsPublic');
        try {
            const { id, isPublic } = req.body;
            const userId = req.user.id;
            const route = await recordedRouteService.updateIsPublic(id, isPublic, {
                id: userId,
                roleId: req.user.role,
            });
            await res.send(route);
            console.log('End RecordedRoute updateIsPublic');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async delete(req, res, next) {
        console.log('Start RecordedRoute delete');
        try {
            const { id } = req.params;
            await db.sequelize.transaction(async () => {
                await recordedRouteService.delete(id);
                await logActivity({
                    userId: req.user.id,
                    action: 'delete_route',
                    entityType: 'route',
                    entityId: id,
                    metadata: {
                        id,
                    },
                });
            });
            res.sendStatus(204);
            console.log('End RecordedRoute delete');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async export(req, res, next) {
        console.log('Start RecordedRoute export');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const routeList = await recordedRouteService.findAll(queryOptions, criteria);

            const fileName = `Routes_${getCurrentTimestamp()}.xlsx`;
            // res.send(locationList);
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('data');

            // Title row + datetime
            sheet.addRow([`Route Report - ${moment().format('DD/MM/YYYY HH:mm')}`]);
            sheet.mergeCells(`A1:E1`);
            sheet.getCell('A1').font = { bold: true, size: 16 };
            sheet.getCell('A1').alignment = { horizontal: 'center' };

            // Header row at row 3
            const headerRow = sheet.addRow(['No', 'Start', 'End', 'Distance (km)', 'User']);

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
            sheet.getColumn(2).width = 30; // Start
            sheet.getColumn(3).width = 30; // End
            sheet.getColumn(4).width = 15; // Distance
            sheet.getColumn(5).width = 25; // User

            // Data rows
            let no = 1;
            for (const data of routeList.data) {
                const row = sheet.addRow([
                    no++,
                    data.startLocationName,
                    data.endLocationName,
                    (data.totalDistanceMeters / 1000).toFixed(2),
                    data.user.fullName,
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

            console.log('End RecordedRoute export');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default userController;
