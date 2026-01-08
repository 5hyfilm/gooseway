import postCategoryService from '../services/postCategory.service.js';

const postCategoryController = {
    async findAll(req, res, next) {
        console.log('Start PostCategory findAll');
        try {
            const postCategory = await postCategoryService.findAll();
            res.send(postCategory);
            console.log('End PostCategory findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default postCategoryController;
