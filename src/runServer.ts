import { getAllFiles, throwError } from '@lawlzer/helpers';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import session from 'express-session'; // Swap to cookie-session once it's updated (from MongoStore)
import slowDown from 'express-slow-down';
import mongoose from 'mongoose';
import morgan from 'morgan';
import ms from 'ms';
import passport from 'passport';
import path from 'path';
import { isValid } from 'zod';

import { initializeRoute } from '~/generics';
import { isValidMethod } from '~/utils/router';

const app = express();
const router = express.Router();

app.use(cookieParser()); // Allow us to use cookies

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// // Passport initialization
// app.use(
// 	session({
// 		secret: process.env.SESSION_SECRET,
// 		resave: false,
// 		saveUninitialized: false,
// 		cookie: { maxAge: config.auth.cookieTimeout },
// 		store: new MongoStore({
// 			client: mongoose.connection.getClient(),
// 			crypto: {
// 				secret: process.env.SESSION_SECRET,
// 			},
// 			ttl: config.auth.cookieTimeout,
// 		}),
// 	})
// );

// app.use(passport.initialize()); // Give Passport access to "express-session"
// app.use(passport.session()); // Force Passport to use the session

// app.enable('trust proxy');  // Should be used if we are behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)

// Slow down users who make a lot of requests
const speedLimiter = slowDown({
	windowMs: ms('1h'), // Every 60 minutes, reset
	delayAfter: 1000, // allow 1000 requests per windowMS
	delayMs: 500, // begin adding 500ms of delay per request above delayAfter
});
app.use(speedLimiter);

// Give us pretty logs <3
app.use(morgan('tiny')); // or: combined

app.use(cors({ origin: true, credentials: true }));

// Import every route recursively
async function initializeServer() {
	const badExtensions = ['.map', '.d.ts', '.test.ts'];
	function isBadExtension(filePath: string) {
		return badExtensions.some((extension) => filePath.endsWith(extension));
	}

	function normalizeFilePath(filePath: string) {
		return filePath.replaceAll('\\', '/').replaceAll('//', '/'); // Replace all \ with /, then remove double //
	}

	function getRoutePath(filePath: string) {
		const indexRoutes = filePath.indexOf('/routes/') + '/routes/'.length;
		const indexLastSlash = filePath.lastIndexOf('/');
		return filePath.substring(indexRoutes, indexLastSlash);
	}

	function parseRoutePathIntoQueryParams(filePath: string) {
		// Replace any [variable] with :variable
		const filePathArray = filePath.split('/');
		const parsedFilePathArray = filePathArray.map((pathPart) => {
			if (pathPart.startsWith('[') && pathPart.endsWith(']')) {
				return `:${pathPart.substring(1, pathPart.length - 1)}`;
			}
			return pathPart;
		});
		return parsedFilePathArray.join('/');
	}

	function getFileName(filePath: string) {
		const indexLastSlash = filePath.lastIndexOf('/');
		return filePath
			.substring(indexLastSlash + 1)
			.replace('.ts', '')
			.replace('.js', '');
	}

	const allRoutes = await getAllFiles(path.join(__dirname, 'routes'));

	for (const filePath of allRoutes) {
		if (isBadExtension(filePath)) {
			console.info(`Skipping automatically importing the file: ${filePath}`);
			continue;
		}

		const normalizedFilePath = normalizeFilePath(filePath);
		const routePath = parseRoutePathIntoQueryParams(getRoutePath(normalizedFilePath));
		const fileMethod = getFileName(normalizedFilePath);
		if (!isValidMethod(fileMethod)) throwError(`Invalid method name: ${fileMethod} for the filePath ${filePath}`);

		try {
			const routeCode = (await import(normalizedFilePath)).default;
			await initializeRoute(routeCode, routePath, fileMethod, router);
			console.info('We have successfully initialized the route: ', routePath);
		} catch (e) {
			throwError(`We errored when trying to import the file: ${normalizedFilePath}. Error: ${e}`);
		}
	}
}
initializeServer();

export default app; // Because we cannot app.listen() with Jest, we will export the app (imported in index.ts), and listen there.
