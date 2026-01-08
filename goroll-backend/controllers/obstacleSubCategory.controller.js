import obstacleSubcategoryService from '../services/obstacleSubcategory.service.js';

const obstacleSubcategoryController = {
    async findByCategoryId(req, res, next) {
        console.log('Start ObstacleSubcategory findByCategoryId');
        try {
            const { id } = req.params;
            const obstacleSubcategory = await obstacleSubcategoryService.findByCategoryId(id);
            res.send(obstacleSubcategory);
            console.log('End ObstacleSubcategory findByCategoryId');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default obstacleSubcategoryController;
