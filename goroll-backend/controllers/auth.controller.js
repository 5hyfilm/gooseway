import passport from 'passport';
import userService from '../services/user.service.js';
import authProviderService from '../services/authProvider.service.js';
import passwordResetService from '../services/passwordReset.service.js';
import db from '../models/database.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import transporter from '../config/mailer.js';
import { logActivity } from '../utils/logActivity.js';
import config from '../config/config.js';

const { sequelize } = db;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '30d';

export const validatePassword = password => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@#$%^&*(),.?":{}|<>]/.test(password);
    const isValidLength = password.length >= 8 && password.length <= 20;

    const typesCount = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;

    const isValid = isValidLength && typesCount >= 2;

    return {
        isValid,
        isValidLength,
        hasUppercase,
        hasLowercase,
        hasNumber,
        hasSpecialChar,
        typesCount,
    };
};

const authController = {
    loginGoogle: async (req, res, next) => {
        console.log('Start loginGoogle');
        try {
            await passport.authenticate('google', {
                scope: ['profile', 'email'],
                accessType: 'offline',
                prompt: 'consent',
            })(req, res, next);
            console.log('End loginGoogle');
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    callback: async (req, res, next) => {
        console.log('Start callback');
        try {
            await passport.authenticate('google', async (err, user, info) => {
                if (err) {
                    console.error(err);
                    return next(err);
                }
                if (!user) {
                    return res.status(401).json({ message: 'Authentication failed' });
                }
                let oldUser = await userService.getUserByEmail(user.email);
                let newUser;

                console.log('user', user);

                await sequelize.transaction(async () => {
                    if (!oldUser) {
                        let payload = {
                            roleId: 1,
                            statusId: 1,
                            email: user.email,
                            fullName: user.displayName,
                            avatarUrl: user.avatar,
                        };
                        newUser = await userService.insert(payload);
                        let authProvider = {
                            userId: newUser?.id || oldUser?.id,
                            providerName: 'google',
                            providerId: user.id,
                            accessToken: user.accessToken,
                            refreshToken: user.refreshToken,
                        };
                        console.log('authProvider', authProvider);

                        await authProviderService.insert(authProvider);
                    }

                    const accessToken = jwt.sign(
                        {
                            id: newUser?.id || oldUser?.id,
                            email: newUser?.email || oldUser?.email,
                            fullName: newUser?.fullName || oldUser?.fullName,
                            role: newUser?.roleId || oldUser?.roleId,
                        },
                        JWT_SECRET,
                        {
                            expiresIn: JWT_EXPIRES_IN,
                        },
                    );

                    res.json({
                        message: 'Login successful',
                        accessToken: accessToken,
                        user: {
                            id: newUser?.id || oldUser?.id,
                            email: newUser?.email || oldUser?.email,
                            fullName: newUser?.fullName || oldUser?.fullName,
                            avatar: newUser?.avatarUrl || oldUser?.avatarUrl,
                        },
                    });

                    await logActivity({
                        userId: newUser?.id || oldUser?.id,
                        action: 'login',
                        entityType: 'user',
                        entityId: newUser?.id || oldUser?.id,
                        metadata: {
                            ip: req.ip,
                            userAgent: req.headers['user-agent'],
                        },
                    });
                });
                console.log('End callback');
            })(req, res, next);
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    callbackOauth: async (req, res, next) => {
        console.log('Start callbackOauth');
        try {
            const { idToken } = req.body;

            if (!idToken) {
                return res.status(400).json({ message: 'ID token is required' });
            }

            const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
            const user = response.data;

            console.log('verified user', user);

            if (!user.email || user.aud !== process.env.GOOGLE_CLIENT_ID) {
                return res.status(401).json({ message: 'Invalid ID token' });
            }

            let oldUser = await userService.getUserByEmail(user.email);
            let newUser;

            await sequelize.transaction(async () => {
                if (!oldUser) {
                    let payload = {
                        roleId: 1,
                        statusId: 1,
                        email: user.email,
                        fullName: user.name,
                        avatarUrl: user.picture,
                    };
                    newUser = await userService.insert(payload);

                    let authProvider = {
                        userId: newUser.id,
                        providerName: 'google',
                        providerId: user.sub, // Google user ID
                    };
                    console.log('authProvider', authProvider);
                    await authProviderService.insert(authProvider);
                }

                const accessToken = jwt.sign(
                    {
                        id: newUser?.id || oldUser?.id,
                        email: newUser?.email || oldUser?.email,
                        fullName: newUser?.fullName || oldUser?.fullName,
                        role: newUser?.roleId || oldUser?.roleId,
                    },
                    JWT_SECRET,
                    {
                        expiresIn: JWT_EXPIRES_IN,
                    },
                );

                res.json({
                    message: 'Login successful',
                    accessToken: accessToken,
                    user: {
                        id: newUser?.id || oldUser?.id,
                        email: newUser?.email || oldUser?.email,
                        fullName: newUser?.fullName || oldUser?.fullName,
                        avatar: newUser?.avatarUrl || oldUser?.avatarUrl,
                    },
                });

                await logActivity({
                    userId: newUser?.id || oldUser?.id,
                    action: 'login',
                    entityType: 'user',
                    entityId: newUser?.id || oldUser?.id,
                    metadata: {
                        ip: req.ip,
                        userAgent: req.headers['user-agent'],
                    },
                });
            });

            console.log('End callbackOauth');
        } catch (error) {
            console.error(error);
            if (error.response?.status === 400) {
                return res.status(401).json({ message: 'Invalid ID token' });
            }
            next(error);
        }
    },
    refreshAccessToken: async (req, res, next) => {
        console.log('Start refreshAccessToken');
        const { refreshToken } = req.body;
        try {
            const response = await axios.post('https://oauth2.googleapis.com/token', null, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                params: {
                    grant_type: 'refresh_token',
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    refresh_token: refreshToken,
                },
            });
            console.log('End refreshAccessToken');
            return response.data;
        } catch (error) {
            console.error('Error refreshing token:', error.response.data);
            throw error;
        }
    },
    register: async (req, res, next) => {
        console.log('Start register');
        const { email, password, fullName, phoneNumber } = req.body;
        try {
            const passWordIsvaild = validatePassword(password);

            if (!email || !password) {
                return res.status(400).json({ message: 'Username and password are required.' });
            }

            const existingUser = await userService.getUserByEmail(email);
            console.log('email =>', email);
            console.log('existingUser =>', existingUser);

            if (existingUser) {
                return res.status(409).json({ message: 'Email already exists.' });
            }

            if (!passWordIsvaild.isValid) {
                return res.status(400).json({ message: 'Password is not Valid.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const payload = {
                roleId: 1,
                statusId: 1,
                email: email,
                passwordHash: hashedPassword,
                fullName: fullName,
                phoneNumber: phoneNumber,
            };

            const newUser = await userService.insert(payload);
            console.log('newUser', newUser.id);

            const accessToken = jwt.sign(
                {
                    id: newUser.id,
                    email: newUser,
                    fullName: newUser.fullName,
                    role: newUser.roleId,
                },
                JWT_SECRET,
                {
                    expiresIn: JWT_EXPIRES_IN,
                },
            );
            await logActivity({
                userId: newUser.id,
                action: 'register',
                entityType: 'user',
                entityId: newUser.id,
                metadata: {
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                },
            });
            await logActivity({
                userId: newUser.id,
                action: 'login',
                entityType: 'user',
                entityId: newUser.id,
                metadata: {
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                },
            });
            console.log('End register');
            res.json({ newUser, accessToken });
        } catch (error) {
            next(error);
        }
    },
    login: async (req, res, next) => {
        console.log('Start login');
        try {
            const { email, password } = req.body;
            console.log(req.body);
            if (!email || !password) {
                return res.status(400).json({ message: 'Username and password are required.' });
            }

            const user = await userService.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'User Not Found.' });
            }

            const match = await bcrypt.compare(password, user.passwordHash);
            if (!match) {
                return res.status(401).json({ message: 'Invalid password.' });
            }

            const accessToken = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.roleId,
                },
                JWT_SECRET,
                {
                    expiresIn: JWT_EXPIRES_IN,
                },
            );
            await logActivity({
                userId: user.id,
                action: 'login',
                entityType: 'user',
                entityId: user.id,
                metadata: {
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                },
            });
            const decoded = jwt.decode(accessToken);
            console.log('decoded:', decoded);
            console.log('End login');
            res.json({
                message: 'Login successful',
                accessToken: accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    avatar: user.avatarUrl,
                },
            });
        } catch (error) {
            next(error);
        }
    },
    checkEmail: async (req, res, next) => {
        console.log('Start checkEmail');
        const { email } = req.body;
        try {
            const user = await userService.getUserByEmail(email);
            res.send(user);
            console.log('End checkEmail');
        } catch (error) {
            next(error);
        }
    },
    requestReset: async (req, res, next) => {
        console.log('Start requestReset');
        try {
            const { email } = req.body;
            const user = await userService.getUserByEmail(email);
            if (!user) {
                return res.status(404).json({ message: 'User Not Found.' });
            }
            if (!user.passwordHash) {
                return res.status(404).json({ message: 'User Third Party Login.' });
            }
            const token = uuidv4();

            const payload = {
                email: email,
                token,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 นาที
                isUsed: false,
            };

            await passwordResetService.insert(payload);

            const resetLink = `https://uat-admin-goroll.netlify.app/password/reset?token=${token}`;

            await transporter.sendMail({
                from: config.email_user,
                to: req.body.email,
                subject: 'Reset your password',
                html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        
                        <div style="text-align: center; margin-bottom: 20px;">
                            <img src="https://imagedelivery.net/Nl7mY5pRXUJvhiOJGHceFw/746fc483-bf6f-4c67-c873-093c77c83b00/public" alt="Company Logo" style="max-width: 150px;">
                        </div>

                        <h2 style="color: #333;">🔐 Password Reset Request</h2>
                        <p>Hello,</p>
                        <p>We received a request to reset your password. Please click the button below to proceed:</p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="background-color: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                                Reset Password
                            </a>
                        </div>

                        <p>If you didn’t request a password reset, you can safely ignore this email.</p>
                        <hr style="margin: 30px 0;">
                        <p style="font-size: 14px; color: #777;">
                            If you have any questions or need assistance, please contact our support team.<br>
                            📧 team@goroll.co
                        </p>
                        <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply directly to this email.</p>
                    </div>

                    `,
            });

            console.log('End requestReset');
            return res.json({ message: 'Reset link sent' });
        } catch (error) {
            next(error);
        }
    },
    resetPassword: async (req, res, next) => {
        console.log('Start resetPassword');
        try {
            const { token, newPassword } = req.body;

            const payload = {
                token,
                isUsed: false,
            };
            console.log('req.body', req.body);

            await db.sequelize.transaction(async () => {
                const resetRequest = await passwordResetService.find(payload);

                if (!resetRequest) return res.status(400).json({ message: 'Invalid or expired token' });

                const hashedPassword = await bcrypt.hash(newPassword, 10);
                const isUsed = true;

                await passwordResetService.update(resetRequest.id, isUsed);

                const user = {
                    email: resetRequest.email,
                    password: hashedPassword,
                };

                await userService.updateByEmail(user);
            });
            console.log('End resetPassword');
            return res.json({ message: 'Password has been reset' });
        } catch (error) {
            next(error);
        }
    },
};

export default authController;
