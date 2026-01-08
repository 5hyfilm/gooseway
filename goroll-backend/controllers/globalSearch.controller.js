import globalSearchService from '../services/globalSearch.service.js';
import { criteriaConverter } from '../utils/helper.js';

const globalSearchController = {
    async findAll(req, res, next) {
        console.log('Start GlobalSearch findAll');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const data = await globalSearchService.findAll(queryOptions, criteria);
            res.send(data);
            console.log('End GlobalSearch findAll');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default globalSearchController;
