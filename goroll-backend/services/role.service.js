import db from '../models/database.js';

const { role } = db;

const roleService = {
    async findAll() {
        const roles = await role.findAll({
            attributes: ['id', 'name'],
        });
        return roles;
    },
};

export default roleService;
