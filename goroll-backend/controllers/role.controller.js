import roleService from '../services/role.service.js';

const roleController = {
    async findAll(req, res, next) {
        console.log('Start Role findAll');
        try {
            const role = await roleService.findAll();
            res.send(role);
            console.log('End Role findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default roleController;
