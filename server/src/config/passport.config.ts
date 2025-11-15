import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import User from '../models/User.model';
import OAuthAccount from '../models/OAuthAccount.model';
import AuditLog from '../models/AuditLog.model';

/**
 * Configure Passport OAuth strategies
 */
export function configureOAuth() {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${process.env.SERVER_URL}/api/v1/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if OAuth account exists
            let oauthAccount = await OAuthAccount.findOne({
              provider: 'google',
              providerId: profile.id,
            });

            let user;

            if (oauthAccount) {
              // Update existing account
              oauthAccount.accessToken = accessToken;
              oauthAccount.refreshToken = refreshToken;
              oauthAccount.providerProfile = profile._json;
              await oauthAccount.save();

              user = await User.findById(oauthAccount.user);
            } else {
              // Find user by email or create new user
              const email = profile.emails?.[0]?.value;
              if (!email) {
                return done(new Error('No email provided by Google'), undefined);
              }

              user = await User.findOne({ email });

              if (!user) {
                // Create new user
                user = await User.create({
                  name: profile.displayName,
                  email,
                  isVerified: true,
                  avatar: profile.photos?.[0]?.value || 'default.jpg',
                  preferredLoginMethod: 'oauth',
                });
              }

              // Create OAuth account
              oauthAccount = await OAuthAccount.create({
                user: user._id,
                provider: 'google',
                providerId: profile.id,
                providerEmail: email,
                providerProfile: profile._json,
                accessToken,
                refreshToken,
              });

              // Log event
              await AuditLog.create({
                user: user._id,
                event: 'oauth.linked',
                metadata: { provider: 'google' },
                status: 'success',
              });
            }

            return done(null, user || undefined);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: `${process.env.SERVER_URL}/api/v1/auth/facebook/callback`,
          profileFields: ['id', 'displayName', 'photos', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let oauthAccount = await OAuthAccount.findOne({
              provider: 'facebook',
              providerId: profile.id,
            });

            let user;

            if (oauthAccount) {
              oauthAccount.accessToken = accessToken;
              oauthAccount.refreshToken = refreshToken;
              oauthAccount.providerProfile = profile._json;
              await oauthAccount.save();

              user = await User.findById(oauthAccount.user);
            } else {
              const email = profile.emails?.[0]?.value;
              if (!email) {
                return done(new Error('No email provided by Facebook'), undefined);
              }

              user = await User.findOne({ email });

              if (!user) {
                user = await User.create({
                  name: profile.displayName,
                  email,
                  isVerified: true,
                  avatar: profile.photos?.[0]?.value || 'default.jpg',
                  preferredLoginMethod: 'oauth',
                });
              }

              oauthAccount = await OAuthAccount.create({
                user: user._id,
                provider: 'facebook',
                providerId: profile.id,
                providerEmail: email,
                providerProfile: profile._json,
                accessToken,
                refreshToken,
              });

              await AuditLog.create({
                user: user._id,
                event: 'oauth.linked',
                metadata: { provider: 'facebook' },
                status: 'success',
              });
            }

            return done(null, user || undefined);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );
  }

  // GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: `${process.env.SERVER_URL}/api/v1/auth/github/callback`,
          scope: ['user:email'],
        },
        async (
          accessToken: string,
          refreshToken: string,
          profile: any,
          done: any
        ) => {
          try {
            let oauthAccount = await OAuthAccount.findOne({
              provider: 'github',
              providerId: profile.id,
            });

            let user;

            if (oauthAccount) {
              oauthAccount.accessToken = accessToken;
              oauthAccount.refreshToken = refreshToken;
              oauthAccount.providerProfile = profile._json;
              await oauthAccount.save();

              user = await User.findById(oauthAccount.user);
            } else {
              const email = profile.emails?.[0]?.value;
              if (!email) {
                return done(new Error('No email provided by GitHub'), undefined);
              }

              user = await User.findOne({ email });

              if (!user) {
                user = await User.create({
                  name: profile.displayName || profile.username,
                  email,
                  isVerified: true,
                  avatar: profile.photos?.[0]?.value || 'default.jpg',
                  preferredLoginMethod: 'oauth',
                });
              }

              oauthAccount = await OAuthAccount.create({
                user: user._id,
                provider: 'github',
                providerId: profile.id,
                providerEmail: email,
                providerProfile: profile._json,
                accessToken,
                refreshToken,
              });

              await AuditLog.create({
                user: user._id,
                event: 'oauth.linked',
                metadata: { provider: 'github' },
                status: 'success',
              });
            }

            return done(null, user || undefined);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );
  }

  // LinkedIn OAuth Strategy
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(
      new LinkedInStrategy(
        {
          clientID: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          callbackURL: `${process.env.SERVER_URL}/api/v1/auth/linkedin/callback`,
          scope: ['r_emailaddress', 'r_liteprofile'],
        },
        async (
          accessToken: string,
          refreshToken: string,
          profile: any,
          done: any
        ) => {
          try {
            let oauthAccount = await OAuthAccount.findOne({
              provider: 'linkedin',
              providerId: profile.id,
            });

            let user;

            if (oauthAccount) {
              oauthAccount.accessToken = accessToken;
              oauthAccount.refreshToken = refreshToken;
              oauthAccount.providerProfile = profile._json;
              await oauthAccount.save();

              user = await User.findById(oauthAccount.user);
            } else {
              const email = profile.emails?.[0]?.value;
              if (!email) {
                return done(new Error('No email provided by LinkedIn'), undefined);
              }

              user = await User.findOne({ email });

              if (!user) {
                user = await User.create({
                  name: profile.displayName,
                  email,
                  isVerified: true,
                  avatar: profile.photos?.[0]?.value || 'default.jpg',
                  preferredLoginMethod: 'oauth',
                });
              }

              oauthAccount = await OAuthAccount.create({
                user: user._id,
                provider: 'linkedin',
                providerId: profile.id,
                providerEmail: email,
                providerProfile: profile._json,
                accessToken,
                refreshToken,
              });

              await AuditLog.create({
                user: user._id,
                event: 'oauth.linked',
                metadata: { provider: 'linkedin' },
                status: 'success',
              });
            }

            return done(null, user || undefined);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );
  }

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}
