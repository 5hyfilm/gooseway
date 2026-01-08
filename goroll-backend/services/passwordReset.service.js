import { Op } from 'sequelize';
import db from '../models/database.js';

const { passwordReset } = db;

const passwordResetService = {
    async insert(payload) {
        const reset = await passwordReset.create(payload);
        return reset;
    },
    async find(payload) {
        const passwordResetDate = await passwordReset.findOne({
            where: {
                token: payload.token,
                isUsed: false,
                expiresAt: { [Op.gt]: new Date() },
            },
        });
        return passwordResetDate;
    },
    async update(id, isUsed) {
        const existing = await passwordReset.findOne({
            where: { id: id },
        });
        if (!existing) {
            throw new Error('Error User not found');
        }
        await existing.update({ isUsed: isUsed });
    },
};

export default passwordResetService;
