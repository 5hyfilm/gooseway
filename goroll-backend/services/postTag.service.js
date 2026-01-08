import db from '../models/database.js';

const { postTag } = db;

const postTagService = {
    async bulkInsert(postTagPayload) {
        const newPostImg = await postTag.bulkCreate(postTagPayload);
        return newPostImg;
    },
    async update(postId, postTagData) {
        if (postTagData.tagsDelete && postTagData.tagsDelete.length > 0) {
            await postTag.destroy({
                where: {
                    tag: postTagData.tagsDelete,
                    postId: postId,
                },
            });
        }
        if (postTagData.tagsAdd && postTagData.tagsAdd.length > 0) {
            const tagsData = postTagData.tagsAdd.map(img => ({
                tag: img.tag,
                postId: postId,
            }));
            await postTag.bulkCreate(tagsData);
        }
        if (postTagData.tagsEdit && postTagData.tagsEdit.length > 0) {
            for (const editTag of postTagData.tagsEdit) {
                await postTag.update(
                    { tag: editTag.newTag },
                    {
                        where: {
                            tag: editTag.oldTag,
                            postId: postId,
                        },
                    },
                );
            }
        }
    },
};

export default postTagService;
