import db from '../models/database.js';

const { obstacleImg } = db;

const obstacleImgService = {
    async bulkInsert(obstacle, obstacleImgData) {
        const imgData = obstacleImgData.map(img => ({
            imageUrl: img,
            obstacleId: obstacle.id,
        }));
        await obstacleImg.bulkCreate(imgData);

        return obstacle;
    },
    async update(obstacle) {
        if (obstacle.imgObstacleDelete && obstacle.imgObstacleDelete.length > 0) {
            await obstacleImg.destroy({
                where: { id: obstacle.imgObstacleDelete },
            });
        }
        if (obstacle.imgObstacleAdd && obstacle.imgObstacleAdd.length > 0) {
            const imgData = obstacle.imgObstacleAdd.map(img => ({
                imageUrl: img.imageUrl,
                obstacleId: obstacle.id,
            }));
            await obstacleImg.bulkCreate(imgData);
        }
    },
};

export default obstacleImgService;
