import app from './app.js';
import config from './config/config.js';
import { SyncDatabase } from './models/database.js';

main();

async function main() {
    await SyncDatabase();

    app.listen(config.port || 3000, () => console.log(`🚀 server run listening on port ${config.port || 3000}`));
}
