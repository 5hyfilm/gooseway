import db from '../models/database.js';

const { likePost } = db;

const likePostService = {
    async insert(likePostObj) {
        if (likePostObj.like === true) {
            await likePost.create(likePostObj);
        } else {
            await likePost.destroy({
                where: { postId: likePostObj.postId, userId: likePostObj.userId },
            });
        }
    },
};

export default likePostService;
