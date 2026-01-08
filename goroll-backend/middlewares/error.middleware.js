const errorMiddleware = (error, req, res, next) => {
    try {
        const statusCode = error.status || 500;
        const code = error.code || 'SERVER_ERROR';
        const message = error.message || 'Something went wrong';
        res.status(statusCode).json({ code, message });
    } catch (error) {
        next(error);
    }
};

export default errorMiddleware;
