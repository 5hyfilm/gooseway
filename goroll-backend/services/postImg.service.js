import db from '../models/database.js';

const { postImg } = db;

const postImgService = {
    async bulkInsert(postImgPayload) {
        const newPostImg = await postImg.bulkCreate(postImgPayload);
        return newPostImg;
    },
    async update(id, postImgData) {
        if (postImgData.imgPostDelete && postImgData.imgPostDelete.length > 0) {
            await postImg.destroy({
                where: { id: postImgData.imgPostDelete },
            });
        }
        if (postImgData.imgPostAdd && postImgData.imgPostAdd.length > 0) {
            const imgData = postImgData.imgPostAdd.map(img => ({
                imageUrl: img.imageUrl,
                postId: id,
            }));
            await postImg.bulkCreate(imgData);
        }
    },
};

export default postImgService;
