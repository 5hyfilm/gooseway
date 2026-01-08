import db from '../models/database.js';

const { obstacleSubcategory } = db;

const obstacleSubCategoryService = {
    async findByCategoryId(id) {
        const obstacleSubCat = await obstacleSubcategory.findAll({
            attributes: ['id', 'nameEn', 'nameTh'],
            order: [['id', 'ASC']],
            where: {
                categoryId: id,
            },
        });
        return obstacleSubCat;
    },
};

export default obstacleSubCategoryService;
