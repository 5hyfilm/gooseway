import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET || 'your-secret-key';

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token.' });
            }

            req.user = decoded;
            next();
        });
    } else {
        res.status(401).json({ message: 'Authorization header missing or malformed.' });
    }
};

export const checkAdminRole = (req, res, next) => {
    try {
        const adminId = 2;
        if (req.user && req.user.role === adminId) {
            return next();
        }

        return res.status(403).json({ message: 'Forbidden: Admins only' });
    } catch (error) {
        next(error);
    }
};
