import dashboardService from '../services/dashboard.service.js';
import { criteriaConverter } from '../utils/helper.js';

const dashboardController = {
    async dashboard(req, res, next) {
        console.log('Start dashboard');
        try {
            const { day } = req.body;
            const dashboard = await dashboardService.dashboard(day);
            res.send(dashboard);
            console.log('End dashboard');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    async log(req, res, next) {
        console.log('Start activityLog');
        try {
            const criteria = req.body;
            const queryOptions = criteriaConverter(req.body);
            const log = await dashboardService.findLogAll(queryOptions, criteria);
            res.send(log);
            console.log('End activityLog');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
};

export default dashboardController;
