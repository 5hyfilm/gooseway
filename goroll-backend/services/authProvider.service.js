import db from '../models/database.js';

const { authProvider } = db;

const authProviderService = {
    async insert(authPayload) {
        const newAuth = await authProvider.create(authPayload);
        return newAuth.id;
    },
};

export default authProviderService;
