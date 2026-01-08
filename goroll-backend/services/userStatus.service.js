import db from '../models/database.js';

const { userStatus } = db;

const userStatusService = {
    async findAll() {
        const statuses = await userStatus.findAll({
            attributes: ['id', 'nameEn', 'nameTh'],
        });
        return statuses;
    },
};

export default userStatusService;
