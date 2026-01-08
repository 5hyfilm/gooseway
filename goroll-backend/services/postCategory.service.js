import db from '../models/database.js';

const { postCategory } = db;

const postCategoryService = {
    async findAll() {
        return await postCategory.findAll({
            attributes: ['id', 'nameEn', 'nameTh'],
            order: [['id', 'ASC']],
        });
    },
};

export default postCategoryService;
