import db from '../models/database.js';

const { accessLevel } = db;

const accessLevelService = {
    async findAll() {
        const accessLevels = await accessLevel.findAll({
            attributes: ['id', 'nameEn', 'nameTh'],
            order: [['id', 'ASC']],
        });
        return accessLevels;
    },
};

export default accessLevelService;
