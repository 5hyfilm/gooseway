import db from '../models/database.js';

const { locationCategory } = db;

const locationCategoryService = {
    async findAll() {
        const locationCate = await locationCategory.findAll({
            attributes: ['id', 'nameEn', 'nameTh'],
        });
        return locationCate;
    },
};

export default locationCategoryService;
