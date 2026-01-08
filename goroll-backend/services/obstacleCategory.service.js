import db from '../models/database.js';

const { obstacleCategory } = db;

const obstacleCategoryService = {
    async findAll() {
        const obstacleCat = await obstacleCategory.findAll({
            attributes: ['id', 'nameEn', 'nameTh'],
            order: [['id', 'ASC']],
        });
        return obstacleCat;
    },
};

export default obstacleCategoryService;
