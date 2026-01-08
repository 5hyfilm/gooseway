import db from '../models/database.js';

export async function logActivity({ userId, action, entityType, entityId, metadata = {}, transaction = null }) {
    try {
        await db.activityLog.create(
            {
                userId,
                action,
                entityType,
                entityId,
                metadata,
            },
            transaction ? { transaction } : {},
        );
    } catch (err) {
        console.error('Logging failed:', err);
    }
}
