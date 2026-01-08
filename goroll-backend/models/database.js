import { Sequelize } from 'sequelize';
import cls from 'cls-hooked';

const namespace = cls.createNamespace('goroll');
Sequelize.useCLS(namespace);

import config from '../config/config.js';

const env = process.env.PROJECT_ENV ? process.env.PROJECT_ENV : 'development';

console.log('this is the environment: ', env);

/** @type {*} */
const database_env = {
    pool: {
        max: config.max_pool,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    dialectOptions: {
        ssl: {
            require: false,
            rejectUnauthorized: false,
        },
    },
    dialect: config.dialect,
    logging: false,
    host: config.host,
    port: config.port_db,
};

const sequelize = new Sequelize(config.database, config.username, config.password, database_env);

export async function SyncDatabase() {
    try {
        await db.sequelize.authenticate();
    } catch (err) {
        console.error('Unable to connect to the database:');
        throw err;
    }

    console.log('successfully connect to database');

    if (!config.ignore_database_sync) {
        try {
            await db.sequelize.sync({ alter: true, drop: false });
        } catch (err) {
            console.error('Unable sync the database:');
            throw err;
        }
        console.log('successfully sync to database');
    }
}

const db = {};

import userModel from './userModel.js';
import roleModel from './roleModel.js';
import userStatusModel from './userStatusModel.js';
import authProviderModel from './authProviderModel.js';
import wheelchairModel from './wheelchairModel.js';
import locationModel from './locationModel.js';
import locationCategoryModel from './locationCategoryModel.js';
import accessLevelModel from './accessLevelModel.js';
import locationFeatureModel from './locationFeatureModel.js';
import locationFeatureMediaModel from './locationFeatureMediaModel.js';
import locationReviewModel from './locationReviewModel.js';
import locationFeatureMediaImgModel from './locationFeatureMediaImgModel.js';
import locationImgModel from './locationImgModel.js';
import passwordResetModel from './passwordResetModel.js';
import obstacleCategoryModel from './obstacleCategoryModel.js';
import obstacleSubcategoryModel from './obstacleSubcategoryModel.js';
import obstacleModel from './obstacleModel.js';
import obstacleImgModel from './obstacleImgModel.js';
import obstacleConfirmationModel from './obstacleConfirmationModel.js';
import obstacleStatusModel from './obstacleStatusModel.js';
import recordedRouteModel from './recordedRouteModel.js';
import postCategoryModel from './postCategoryModel.js';
import postImgModel from './postImgModel.js';
import postModel from './postModel.js';
import postStatusModel from './postStatusModel.js';
import postTagModel from './postTagModel.js';
import likePostModel from './likePostModel.js';
import commentPostModel from './commentPostModel.js';
import userFollowerModel from './userFollowerModel.js';
import activityLogModel from './activityLogModel.js';
import postBookmarkModel from './postBookmarkModel.js';

db.user = userModel(sequelize);
db.role = roleModel(sequelize);
db.userStatus = userStatusModel(sequelize);
db.authProvider = authProviderModel(sequelize);
db.wheelChair = wheelchairModel(sequelize);
db.location = locationModel(sequelize);
db.locationCategory = locationCategoryModel(sequelize);
db.accessLevel = accessLevelModel(sequelize);
db.locationFeature = locationFeatureModel(sequelize);
db.locationFeatureMedia = locationFeatureMediaModel(sequelize);
db.locationReview = locationReviewModel(sequelize);
db.locationFeatureMediaImg = locationFeatureMediaImgModel(sequelize);
db.locationImg = locationImgModel(sequelize);
db.passwordReset = passwordResetModel(sequelize);
db.obstacleCategory = obstacleCategoryModel(sequelize);
db.obstacleSubcategory = obstacleSubcategoryModel(sequelize);
db.obstacle = obstacleModel(sequelize);
db.obstacleImg = obstacleImgModel(sequelize);
db.obstacleConfirmation = obstacleConfirmationModel(sequelize);
db.obstacleStatus = obstacleStatusModel(sequelize);
db.recordRoute = recordedRouteModel(sequelize);

db.postImg = postImgModel(sequelize);
db.postCategory = postCategoryModel(sequelize);
db.post = postModel(sequelize);
db.postStatus = postStatusModel(sequelize);
db.postTag = postTagModel(sequelize);
db.likePost = likePostModel(sequelize);
db.commentPost = commentPostModel(sequelize);
db.postBookmark = postBookmarkModel(sequelize);

db.userFollower = userFollowerModel(sequelize);

db.activityLog = activityLogModel(sequelize);

Object.entries(db).forEach(([_, model]) => {
    if (model.association) {
        model.association(db);
    }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

export default db;
