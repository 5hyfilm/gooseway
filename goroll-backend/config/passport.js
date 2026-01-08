import passport from 'passport';
import config from './config.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(
    new GoogleStrategy(
        {
            clientID: config.google_client_id,
            clientSecret: config.google_client_secret,
            callbackURL: '/auth/oauth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log('Google profile:', profile);
            const user = {
                id: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos?.[0].value,
                refreshToken,
                accessToken,
            };
            return done(null, user);
        },
    ),
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    done(null, { id });
});
