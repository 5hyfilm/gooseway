import userService from '../services/user.service.js';
import wheelchairService from '../services/wheelchair.service.js';
import bcrypt from 'bcrypt';
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

const userController = {
    async findAll(req, res, next) {
        console.log('Start User findAll');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const user = await userService.findAll(queryOptions, criteria);
            res.send(user);
            console.log('End User findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async adminFindById(req, res, next) {
        console.log('Start User adminFindById');
        try {
            const { id } = req.params;
            const user = await userService.adminFindById(id);
            await res.send(user);
            console.log('End User adminFindById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findById(req, res, next) {
        console.log('Start User findById');
        try {
            const { id } = req.params;
            const user = await userService.findById(id);
            await res.send(user);
            console.log('End User findById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async insert(req, res, next) {
        console.log('Start User insert');
        try {
            const { email, password, fullName, avatarUrl, phoneNumber, statusId, roleId } = req.body;
            const existingUser = await userService.getUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({ message: 'Email already exists.' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            let user = {
                email: email,
                passwordHash: hashedPassword,
                fullName: fullName,
                avatarUrl: avatarUrl,
                phoneNumber: phoneNumber,
                statusId: statusId,
                roleId: roleId,
                createdBy: req.user?.id,
                updatedBy: req.user?.id,
            };
            await sequelize.transaction(async () => {
                const newUser = await userService.insert(user);
                await logActivity({
                    userId: req.user.id,
                    action: 'create_user',
                    entityType: 'user',
                    entityId: newUser.id,
                    metadata: {
                        ...user,
                    },
                });
            });
            await res.sendStatus(204);
            console.log('End User insert');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async update(req, res, next) {
        console.log('Start User update');
        try {
            const { id, email, fullName, avatarUrl, phoneNumber } = req.body;
            const existingUser = await userService.getUserByEmail(email, id);
            if (existingUser) {
                return res.status(409).json({ message: 'Email already exists.' });
            }
            let user = {
                id: id,
                email: email,
                fullName: fullName,
                avatarUrl: avatarUrl,
                phoneNumber: phoneNumber,
                updatedBy: req.user?.id,
            };
            await userService.update(user);
            await logActivity({
                userId: req.user.id,
                action: 'update_user',
                entityType: 'user',
                entityId: id,
                metadata: {
                    ...user,
                },
            });

            res.sendStatus(204);
            console.log('End User update');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async updateWheelChair(req, res, next) {
        console.log('Start User updateWheelChair');
        try {
            const {
                userId,
                isFoldable,
                widthRegularCm,
                lengthRegularCm,
                weightKg,
                widthFoldedCm,
                lengthFoldedCm,
                heightFoldedCm,
                notes,
            } = req.body;
            const wheelchair = {
                userId: userId,
                isFoldable: isFoldable,
                widthRegularCm: widthRegularCm,
                lengthRegularCm: lengthRegularCm,
                weightKg: weightKg,
                widthFoldedCm: widthFoldedCm,
                lengthFoldedCm: lengthFoldedCm,
                heightFoldedCm: heightFoldedCm,
                notes: notes,
                createdBy: req.user?.id,
                updatedBy: req.user?.id,
            };
            await wheelchairService.update(wheelchair);
            res.sendStatus(204);
            console.log('End User updateWheelChair');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async adminUpdate(req, res, next) {
        console.log('Start User adminUpdate');
        try {
            await db.sequelize.transaction(async () => {
                const { id, email, fullName, avatarUrl, phoneNumber, statusId, roleId, suspendedReason } =
                    req.body.user;
                const existingUser = await userService.getUserByEmail(email, id);
                if (existingUser) {
                    return res.status(409).json({ message: 'Email already exists.' });
                }
                let user = {
                    id: id,
                    email: email,
                    fullName: fullName,
                    avatarUrl: avatarUrl,
                    phoneNumber: phoneNumber,
                    statusId: statusId,
                    roleId: roleId,
                    updatedBy: req.user?.id,
                    suspendedAt: new Date(),
                    suspendedReason: suspendedReason,
                    suspendedBy: req.user?.id,
                };
                await userService.update(user);
                await logActivity({
                    userId: req.user.id,
                    action: 'update_user',
                    entityType: 'user',
                    entityId: id,
                    metadata: {
                        ...user,
                    },
                });
                if (req.body.wheelchair) {
                    const {
                        isFoldable,
                        widthRegularCm,
                        lengthRegularCm,
                        weightKg,
                        widthFoldedCm,
                        lengthFoldedCm,
                        heightFoldedCm,
                        notes,
                    } = req.body.wheelchair;
                    const wheelchair = {
                        userId: id,
                        isFoldable: isFoldable,
                        widthRegularCm: widthRegularCm,
                        lengthRegularCm: lengthRegularCm,
                        weightKg: weightKg,
                        widthFoldedCm: widthFoldedCm,
                        lengthFoldedCm: lengthFoldedCm,
                        heightFoldedCm: heightFoldedCm,
                        notes: notes,
                        createdBy: req.user?.id,
                        updatedBy: req.user?.id,
                    };
                    await wheelchairService.update(wheelchair);
                }
            });
            res.sendStatus(204);
            console.log('End User adminUpdate');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async delete(req, res, next) {
        console.log('Start User delete');
        try {
            const { id } = req.params;
            await userService.delete(id);
            await logActivity({
                userId: req.user.id,
                action: 'delete_user',
                entityType: 'user',
                entityId: id,
                metadata: {
                    id: id,
                },
            });

            res.sendStatus(204);
            console.log('End User delete');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async changeStatus(req, res, next) {
        console.log('Start User changeStatus');
        try {
            const { id, statusId } = req.body;
            let user = {
                id: id,
                statusId: statusId,
            };
            await userService.update(user);
            res.sendStatus(204);
            console.log('End User changeStatus');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findWheelChairByUserId(req, res, next) {
        console.log('Start User findWheelChairByUserId');
        try {
            const { userId } = req.params;
            const wheelchair = await wheelchairService.findByUserId(userId);
            await res.send(wheelchair);
            console.log('End User findWheelChairByUserId');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async followUser(req, res, next) {
        console.log('Start User followUser');
        try {
            const { followingId, follow } = req.body;
            let followObj = {
                followerId: req.user?.id,
                followingId: followingId,
            };
            await userService.followUser(followObj, follow);
            res.sendStatus(204);
            console.log('End User followUser');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findAllFollower(req, res, next) {
        console.log('Start User findAllFollower');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            criteria.userId = req.user?.id;
            const follower = await userService.findAllFollower(queryOptions, criteria);
            res.send(follower);
            console.log('End User findAllFollower');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findAllFollowing(req, res, next) {
        console.log('Start User findAllFollowing');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            criteria.userId = req.user?.id;
            const following = await userService.findAllFollowing(queryOptions, criteria);
            res.send(following);
            console.log('End User findAllFollowing');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async profile(req, res, next) {
        console.log('Start User profile');
        try {
            const userId = req.user.id;
            const user = await userService.profile(userId);
            await res.send(user);
            console.log('End User profile');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async export(req, res, next) {
        console.log('Start User export');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const postList = await userService.findAll(queryOptions, criteria);

            const fileName = `Users_${getCurrentTimestamp()}.xlsx`;
            // res.send(locationList);
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('data');

            // Title row + datetime
            sheet.addRow([`User Report - ${moment().format('DD/MM/YYYY HH:mm')}`]);
            sheet.mergeCells(`A1:H1`);
            sheet.getCell('A1').font = { bold: true, size: 16 };
            sheet.getCell('A1').alignment = { horizontal: 'center' };

            // Header row at row 3
            const headerRow = sheet.addRow([
                'No',
                'Name',
                'E-mail',
                'Phone Number',
                'Role',
                'Status',
                'Registered At',
                'Last Login',
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
            sheet.getColumn(2).width = 25; // Name
            sheet.getColumn(3).width = 30; // E-mail
            sheet.getColumn(4).width = 18; // Phone Number
            sheet.getColumn(5).width = 15; // Role
            sheet.getColumn(6).width = 15; // Status
            sheet.getColumn(7).width = 20; // Registered At
            sheet.getColumn(8).width = 20; // Last Login

            // Data rows
            let no = 1;
            for (const data of postList.data) {
                const row = sheet.addRow([
                    no++,
                    data.fullName,
                    data.email,
                    data.phoneNumber,
                    data.role.name,
                    data.status.name,
                    moment(data.dataValues?.registeredAt).format('DD/MM/YYYY HH:mm') ?? '',
                    data.dataValues?.lastLogin && moment(data.dataValues.lastLogin).isValid()
                        ? moment(data.dataValues.lastLogin).format('DD/MM/YYYY HH:mm')
                        : '',
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

            console.log('End User export');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default userController;
