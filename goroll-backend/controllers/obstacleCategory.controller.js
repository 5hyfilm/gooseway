import obstacleCategoryService from '../services/obstacleCategory.service.js';

const obstacleCategoryController = {
    async findAll(req, res, next) {
        console.log('Start ObstacleCategory findAll');
        try {
            const obstacleCategory = await obstacleCategoryService.findAll();
            res.send(obstacleCategory);
            console.log('End ObstacleCategory findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default obstacleCategoryController;
