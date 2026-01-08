import db from '../models/database.js';

const { wheelChair } = db;

const wheelChairService = {
    async findByUserId(userId) {
        const existingWheelchair = await wheelChair.findOne({
            where: { userId: userId },
        });
        if (!existingWheelchair) {
            throw new Error('WheelChair not found');
        }
        return existingWheelchair;
    },
    async update(wheelChairPayload) {
        const existingWheelchair = await wheelChair.findOne({
            where: { userId: wheelChairPayload.userId },
        });
        if (!existingWheelchair) {
            await wheelChair.create(wheelChairPayload);
        } else {
            await existingWheelchair.update(wheelChairPayload);
        }
    },
};

export default wheelChairService;
