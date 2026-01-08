import db from '../models/database.js';

const { obstacleStatus } = db;

const obstacleStatusService = {
    async findAll() {
        const obStatus = await obstacleStatus.findAll({
            attributes: ['id', 'nameEn', 'nameTh'],
            order: [['id', 'ASC']],
        });
        return obStatus;
    },
};

export default obstacleStatusService;
