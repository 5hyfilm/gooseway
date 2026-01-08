import locationCategoryService from '../services/locationCategory.service.js';

const locationCategoryController = {
    async findAll(req, res, next) {
        console.log('Start LocationCategory findAll');
        try {
            const locationCategory = await locationCategoryService.findAll();
            res.send(locationCategory);
            console.log('End LocationCategory findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default locationCategoryController;
