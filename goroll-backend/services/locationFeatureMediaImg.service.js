import db from '../models/database.js';

const { locationFeatureMediaImg, locationFeatureMedia } = db;

const locationService = {
    async bulkUpdate(locationImgPayload, featureId, userId, locationId) {
        const data = await locationFeatureMedia.create(
            {
                locationId: locationId,
                featureId: featureId,
                isGood: null,
                userId: userId,
                createdBy: userId,
                updatedBy: userId,
            },
            {
                returning: true,
            },
        );

        const imgData = locationImgPayload.map(a => ({
            featureMediaId: data.id,
            imageUrl: a.imageUrl,
        }));
        const newLocationImg = await locationFeatureMediaImg.bulkCreate(imgData);
        return newLocationImg;
    },
    async bulkInsert(locationImgPayload) {
        const newLocationImg = await locationFeatureMediaImg.bulkCreate(locationImgPayload);
        return newLocationImg;
    },
    async delete(idList) {
        await locationFeatureMediaImg.destroy({
            where: { id: idList },
        });
    },
};

export default locationService;
