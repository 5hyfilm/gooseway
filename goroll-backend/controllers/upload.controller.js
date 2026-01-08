import uploadImage from '../storage/index.js';

const roleController = {
    async uploadImage(req, res, next) {
        console.log('Start uploadImage');
        try {
            // const role = await roleService.findAll();
            const file = req.files.file;
            const img = await uploadImage(file.path, file.originalFilename);
            res.send(img);
            console.log('End uploadImage');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default roleController;
