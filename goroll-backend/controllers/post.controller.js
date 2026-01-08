import postService from '../services/post.service.js';
import postImgService from '../services/postImg.service.js';
import postTagService from '../services/postTag.service.js';
import likePostService from '../services/likePost.service.js';
import commentPostService from '../services/commentPost.service.js';
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

const postController = {
    async insert(req, res, next) {
        console.log('Start Post insert');
        try {
            await db.sequelize.transaction(async () => {
                const { title, content, categoryId, statusId, latitude, longitude, tag, imageUrl } = req.body;
                let post = {
                    title: title,
                    content: content,
                    categoryId: categoryId,
                    statusId: statusId,
                    latitude: latitude,
                    longitude: longitude,
                    tag: tag,
                    userId: req.user.id,
                };

                const newPost = await postService.insert(post);

                if (imageUrl?.length) {
                    const postImgData = imageUrl.map(url => ({
                        postId: newPost.id,
                        imageUrl: url,
                    }));
                    await postImgService.bulkInsert(postImgData);
                }

                if (tag?.length) {
                    const postTag = tag.map(tag => ({
                        postId: newPost.id,
                        tag: tag,
                    }));
                    await postTagService.bulkInsert(postTag);
                }

                await logActivity({
                    userId: req.user.id,
                    action: 'create_post',
                    entityType: 'post',
                    entityId: newPost.id,
                    metadata: {
                        ...post,
                    },
                });
            });
            console.log('End Post insert');
            res.sendStatus(200);
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findById(req, res, next) {
        console.log('Start Post findById');
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const post = await postService.findById(id, userId);
            res.send(post);
            console.log('End Post findById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findShareById(req, res, next) {
        console.log('Start Post findShareById');
        try {
            const { id } = req.params;

            const post = await postService.findShareById(id);
            res.send(post);
            console.log('End Post findShareById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async adminFindById(req, res, next) {
        console.log('Start Post adminFindById');
        try {
            const { id } = req.params;
            console.log(id);

            const post = await postService.adminFindById(id);
            res.send(post);
            console.log('End Post adminFindById');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findAll(req, res, next) {
        console.log('Start Post findAll');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            criteria.userId = req.user?.id;
            const posts = await postService.findAll(queryOptions, criteria);
            res.send(posts);
            console.log('End Post findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async adminFindAll(req, res, next) {
        console.log('Start Post adminFindAll');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const posts = await postService.adminFindAll(queryOptions, criteria);
            res.send(posts);
            console.log('End Post adminFindAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findPostAll(req, res, next) {
        console.log('Start Post findPostAll');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            criteria.userId = req.user?.id;
            const posts = await postService.findPostAll(queryOptions, criteria);
            res.send(posts);
            console.log('End Post findPostAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async update(req, res, next) {
        console.log('Start Post update');
        try {
            await db.sequelize.transaction(async () => {
                const {
                    id,
                    title,
                    content,
                    categoryId,
                    statusId,
                    latitude,
                    longitude,
                    tagsDelete,
                    tagsAdd,
                    tagsEdit,
                    imgPostDelete,
                    imgPostAdd,
                } = req.body;
                const userId = req.user.id;
                let post = {
                    id: id,
                    title: title,
                    content: content,
                    categoryId: categoryId,
                    statusId: statusId,
                    latitude: latitude,
                    longitude: longitude,
                    updatedBy: req.user?.id,
                };

                await postService.update(post, userId);
                const images = {
                    imgPostDelete: imgPostDelete,
                    imgPostAdd: imgPostAdd,
                };
                console.log('images', images);

                await postImgService.update(id, images);

                const tags = {
                    tagsDelete: tagsDelete,
                    tagsAdd: tagsAdd,
                    tagsEdit: tagsEdit,
                };
                console.log('tags', tags);

                await postTagService.update(id, tags);

                await logActivity({
                    userId: req.user.id,
                    action: 'update_post',
                    entityType: 'post',
                    entityId: post.id,
                    metadata: {
                        ...post,
                    },
                });
            });
            res.sendStatus(204);
            console.log('End Post update');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async adminUpdate(req, res, next) {
        console.log('Start Post adminUpdate');
        try {
            await db.sequelize.transaction(async () => {
                const {
                    id,
                    title,
                    content,
                    categoryId,
                    statusId,
                    latitude,
                    longitude,
                    tagsDelete,
                    tagsAdd,
                    imgPostDelete,
                    imgPostAdd,
                } = req.body;
                const userId = req.user.id;
                let post = {
                    id: id,
                    title: title,
                    content: content,
                    categoryId: categoryId,
                    statusId: statusId,
                    latitude: latitude,
                    longitude: longitude,
                    updatedBy: req.user?.id,
                };
                const images = {
                    imgPostDelete: imgPostDelete,
                    imgPostAdd: imgPostAdd,
                };
                await postService.adminUpdate(post, userId);
                await postImgService.update(id, images);
                const tags = {
                    tagsDelete: tagsDelete,
                    tagsAdd: tagsAdd,
                };
                await postTagService.update(id, tags);
            });
            res.sendStatus(204);
            console.log('End Post adminUpdate');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async delete(req, res, next) {
        console.log('Start Post delete');
        try {
            const { id } = req.params;
            await postService.delete(id);
            res.sendStatus(200);
            console.log('End Post delete');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async deleteComment(req, res, next) {
        console.log('Start Post deleteComment');
        try {
            const { id } = req.params;
            await commentPostService.delete(id);
            res.sendStatus(200);
            console.log('End Post deleteComment');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async likePost(req, res, next) {
        console.log('Start Post likePost');
        try {
            const { postId, like } = req.body;
            console.log('req.body', req.body);

            let likePost = {
                postId: postId,
                like: like,
                userId: req.user.id,
            };

            await likePostService.insert(likePost);
            res.sendStatus(200);
            console.log('End Post likePost');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async commentPost(req, res, next) {
        console.log('Start Post commentPost');
        try {
            const { postId, content } = req.body;
            let commentPost = {
                postId: postId,
                content: content,
                userId: req.user.id,
            };
            await commentPostService.insert(commentPost);
            res.sendStatus(200);
            console.log('End Post commentPost');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async findCommentByPostId(req, res, next) {
        console.log('Start Post findCommentByPostId');
        try {
            const { postId } = req.params;
            const comment = await commentPostService.findCommentById(postId);
            res.send(comment);
            console.log('End Post findCommentByPostId');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async export(req, res, next) {
        console.log('Start Post export');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const postList = await postService.adminFindAll(queryOptions, criteria);

            const fileName = `Posts_${getCurrentTimestamp()}.xlsx`;
            // res.send(locationList);
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('data');

            // Title row + datetime
            sheet.addRow([`Post Report - ${moment().format('DD/MM/YYYY HH:mm')}`]);
            sheet.mergeCells(`A1:G1`);
            sheet.getCell('A1').font = { bold: true, size: 16 };
            sheet.getCell('A1').alignment = { horizontal: 'center' };

            // Header row at row 3
            const headerRow = sheet.addRow(['No', 'Title', 'User', 'Category', 'Date', 'Likes', 'Comments']);

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
            sheet.getColumn(2).width = 40; // Title
            sheet.getColumn(3).width = 25; // User
            sheet.getColumn(4).width = 20; // Category
            sheet.getColumn(5).width = 20; // Date
            sheet.getColumn(6).width = 10; // Likes
            sheet.getColumn(7).width = 12; // Comments

            // Data rows
            let no = 1;
            for (const data of postList.data) {
                const row = sheet.addRow([
                    no++,
                    data.title,
                    data.user.fullName,
                    data.category.nameTh,
                    moment(data.createdAt).format('DD/MM/YYYY HH:mm'),
                    data.dataValues?.likeCount || 0,
                    data.dataValues?.commentCount || 0,
                ]);

                row.eachCell({ includeEmpty: true }, cell => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                });

                // ให้ Title จัดชิดซ้ายเพื่ออ่านง่าย
                row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
            }

            const buffer = await workbook.xlsx.writeBuffer();

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.send(buffer);

            console.log('End Post export');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async updateComment(req, res, next) {
        console.log('Start Post updateComment');
        try {
            const comment = req.body;
            const userId = req.user.id;
            const payload = {
                content: comment.content,
            };
            await commentPostService.update(comment.id, payload, userId);

            res.sendStatus(204);
            console.log('End Post updateComment');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async userDelete(req, res, next) {
        console.log('Start Post userDelete');
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await postService.userDelete(id, userId);
            res.sendStatus(204);
            console.log('End Post userDelete');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default postController;
