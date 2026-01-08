import db from '../models/database.js';

const { postStatus } = db;

const postStatusService = {
    async findAll() {
        return await postStatus.findAll({
            attributes: ['id', 'nameEn', 'nameTh'],
        });
    },
};

export default postStatusService;
