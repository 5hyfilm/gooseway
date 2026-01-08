import userStatusService from '../services/userStatus.service.js';

const userStatusController = {
    async findAll(req, res, next) {
        console.log('Start UserStatus findAll');
        try {
            const status = await userStatusService.findAll();
            res.send(status);
            console.log('End UserStatus findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default userStatusController;
