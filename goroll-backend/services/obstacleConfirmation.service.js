import db from '../models/database.js';

const { obstacleConfirmation } = db;

const obstacleService = {
    async findOne(obj) {
        const existingObstacle = await obstacleConfirmation.findOne({
            where: { obstacleId: obj.obstacleId, userId: obj.userId },
        });
        return existingObstacle;
    },
    async insert(obstacleCon) {
        const obstacleConfirm = await obstacleConfirmation.create(obstacleCon);
        return obstacleConfirm;
    },
    async delete(obj) {
        await obj.destroy();
    },
    async update(obj, statusId) {
        await obj.update({ statusId: statusId });
    },
};

export default obstacleService;
