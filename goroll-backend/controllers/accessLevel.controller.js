import accessLevelService from '../services/accessLevel.service.js';

const accessLevelController = {
    async findAll(req, res, next) {
        console.log('Start AccessLevel findAll');
        try {
            const accessLevel = await accessLevelService.findAll();
            res.send(accessLevel);
            console.log('End AccessLevel findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default accessLevelController;
