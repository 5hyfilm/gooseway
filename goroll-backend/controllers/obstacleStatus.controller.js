import obstacleStatusService from '../services/obstacleStatus.service.js';

const obstacleStatusController = {
    async findAll(req, res, next) {
        console.log('Start ObstacleStatus findAll');
        try {
            const obstacleStatus = await obstacleStatusService.findAll();
            res.send(obstacleStatus);
            console.log('End ObstacleStatus findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default obstacleStatusController;
