import { where } from 'sequelize';
import db from '../models/database.js';

const { locationImg } = db;

const locationService = {
    async bulkInsert(locationImgPayload) {
        const newLocationImg = await locationImg.bulkCreate(locationImgPayload);
        return newLocationImg;
    },
    async delete(idList) {
        await locationImg.destroy({
            where: { id: idList },
        });
    },
};

export default locationService;
