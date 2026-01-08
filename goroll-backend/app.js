import express from 'express';

import session from 'express-session';
import passport from 'passport';
import './config/passport.js';

//route
import userRoute from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import userStatusRoutes from './routes/userStatus.route.js';
import roleRoutes from './routes/role.route.js';
import locationRoutes from './routes/location.route.js';
import accessLevelRoutes from './routes/accessLevel.route.js';
import locationCategoryRoutes from './routes/locationCategory.route.js';
import obstacleRoutes from './routes/obstacle.route.js';
import obstacleStatusRoutes from './routes/obstacleStatus.route.js';
import obstacleCategoryRoutes from './routes/obstacleCategory.route.js';
import obstacleSubCategoryRoutes from './routes/obstacleSubCategory.route.js';
import recordedRouteRoutes from './routes/recordedRoute.route.js';
import postCategoryRoutes from './routes/postCategory.route.js';
import postStatusRoutes from './routes/postStatus.route.js';
import postRoutes from './routes/post.route.js';
import dashboard from './routes/dashbord.route.js';
import uploadRoute from './routes/upload.route.js';
import errorMiddleware from './middlewares/error.middleware.js';
import globalSearchRoutes from './routes/globalSearch.route.js';

const app = express();

app.use(express.json({ limit: '200mb' }));

app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// cors
app.use((req, res, next) => {
    (res.header('Access-Control-Allow-Origin', '*'),
        res.header('Access-Control-Expose-Headers', 'Content-Disposition'),
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requestd-With, Content-Type, Accept, Authorization'),
        res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE'),
        next());
});

app.use((req, res, next) => {
    const defaultLimit = 50;
    const defaultPage = 1;
    let limit = parseInt(req.query.limit);
    let page = parseInt(req.query.page);
    req.pagination = {
        limit: Number.isNaN(limit) ? defaultLimit : limit,
        page: Number.isNaN(page) ? defaultPage : page,
    };
    req.pagination.offset = (req.pagination.page - 1) * req.pagination.limit;

    req.timezone = req.headers['time-zone'] ?? 'Asia/Bangkok';
    next();
});

app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

        if (res.statusCode >= 500) {
            console.error(message);
        } else if (res.statusCode >= 400) {
            console.warn(message);
        } else {
            console.log(message);
        }
    });

    next();
});

app.get('/', (req, res) => {
    res.send('Welcome to Goroll Backend');
});

app.use('/users', userRoute);
app.use('/auth', authRoutes);
app.use('/userStatus', userStatusRoutes);
app.use('/role', roleRoutes);
app.use('/location', locationRoutes);
app.use('/accessLevel', accessLevelRoutes);
app.use('/locationCategory', locationCategoryRoutes);
app.use('/obstacle', obstacleRoutes);
app.use('/obstacleStatus', obstacleStatusRoutes);
app.use('/obstacleCategory', obstacleCategoryRoutes);
app.use('/obstacleSubcategory', obstacleSubCategoryRoutes);
app.use('/recordedRoute', recordedRouteRoutes);
app.use('/post', postRoutes);
app.use('/postCategory', postCategoryRoutes);
app.use('/postStatus', postStatusRoutes);
app.use('/global', globalSearchRoutes);
app.use('/dashboard', dashboard);
app.use('/upload', uploadRoute);

app.all('*', (req, res, next) => {
    next({
        status: 404,
        code: 'NOT_FOUND',
        message: `Route: ${req.originalUrl} does not exist on this server`,
    });
});

app.use(errorMiddleware);

export default app;
