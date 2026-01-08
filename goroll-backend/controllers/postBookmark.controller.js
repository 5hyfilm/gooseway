import postBookmarkService from '../services/postBookmark.service.js';
import { criteriaConverter } from '../utils/helper.js';

const postBookmarkController = {
    async findAll(req, res, next) {
        console.log('Start PostBookmark findAll');
        try {
            const userId = req.user.id;
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            criteria.userId = userId;
            const postBookmark = await postBookmarkService.findAll(queryOptions, criteria);
            res.send(postBookmark);
            console.log('End PostBookmark findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async insert(req, res, next) {
        console.log('Start PostBookmark insert');
        try {
            const { postId } = req.body;
            const userId = req.user.id;
            const newBookmark = await postBookmarkService.insert({ postId, userId });
            res.status(201).send(newBookmark);
            console.log('End PostBookmark insert');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },

    async delete(req, res, next) {
        console.log('Start PostBookmark delete');
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await postBookmarkService.delete(id, userId);
            res.status(204).send();
            console.log('End PostBookmark delete');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default postBookmarkController;
