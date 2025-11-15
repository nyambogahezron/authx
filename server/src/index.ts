import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import passport from 'passport';
import ConnectDB from './config/database';
import cookieParser from './middleware/CookieParser';
import { configureOAuth } from './config/passport.config';

const app: Express = express();

// CORS configuration (must be before routes)
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

//routes
import AuthRoutes from './routes/Auth.routes';
import UserRoutes from './routes/User.routes';
import MFARoutes from './routes/MFA.routes';
import OAuthRoutes from './routes/OAuth.routes';
import PasswordlessRoutes from './routes/Passwordless.routes';
import SessionRoutes from './routes/Session.routes';
import AdminRoutes from './routes/Admin.routes';
import WebhookRoutes from './routes/Webhook.routes';

//middlewares
import ErrorHandlerMiddleware from './middleware/ErrorsHandler';
import NotFoundHandler from './middleware/NotFound';
import {
  helmetMiddleware,
  mongoSanitizeMiddleware,
  hppMiddleware,
} from './middleware/SecurityMiddleware';
import { apiLimiter } from './middleware/RateLimiter';

// Security middleware
app.use(helmetMiddleware);
app.use(mongoSanitizeMiddleware);
app.use(hppMiddleware);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}
app.use(cookieParser({ secret: process.env.JWT_SECRET }));

// Passport initialization
app.use(passport.initialize());
configureOAuth();

// Rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/auth', OAuthRoutes);
app.use('/api/v1/auth', PasswordlessRoutes);
app.use('/api/v1/users', UserRoutes);
app.use('/api/v1/mfa', MFARoutes);
app.use('/api/v1/sessions', SessionRoutes);
app.use('/api/v1/admin', AdminRoutes);
app.use('/api/v1/webhooks', WebhookRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('AuthX API - Comprehensive Authentication System');
});

app.use(ErrorHandlerMiddleware as unknown as express.ErrorRequestHandler);
app.use(NotFoundHandler);

async function StartApp() {
  const port = process.env.PORT || 3000;

  try {
    await ConnectDB(process.env.MONGO_URI);

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

StartApp();
