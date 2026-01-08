import db from '../models/database.js';

const { commentPost, user } = db;

const commentPostService = {
    async insert(likePostObj) {
        const newCommentPost = await commentPost.create(likePostObj);
        return newCommentPost;
    },
    async delete(id) {
        await commentPost.destroy({
            where: { id: id },
        });
    },
    async findCommentById(postId) {
        return await commentPost.findAll({
            where: { postId: postId },
            include: [
                {
                    model: user,
                    as: 'user',
                    attributes: ['id', 'fullName', 'avatarUrl'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
    },
    async update(id, updateData, userId) {
        const comment = await commentPost.findOne({
            where: { id: id },
        });
        if (comment.userId !== userId) {
            throw new Error('You can only update your own comments');
        }
        await comment.update(updateData);
        return comment;
    },
};

export default commentPostService;
