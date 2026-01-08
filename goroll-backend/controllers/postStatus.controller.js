import postStatusService from '../services/postStatus.service.js';

const postStatusController = {
    async findAll(req, res, next) {
        console.log('Start PostStatus findAll');
        try {
            const postStatus = await postStatusService.findAll();
            res.send(postStatus);
            console.log('End PostStatus findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default postStatusController;
