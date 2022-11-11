// import './init';
// import './generics'; // TEMP

// import { getAllFiles, throwError } from '@lawlzer/helpers';
// import { createConfig, createServer, OpenAPI, Routing } from 'express-zod-api';
// import path from 'path';

// const routing: Routing = {
// 	// v1: {
// 	// 	hello: helloWorldEndpoint,
// 	// },
// };

// const config = createConfig({
// 	cors: true, // ?
// 	// errorHandler: 'default', // ? todo
// 	logger: {
// 		level: 'debug',
// 		color: true,
// 	},
// 	server: {
// 		listen: process.env.PORT || throwError('No process.env.PORT'),
// 		upload: true,
// 	},
// 	// compression: {
// 	// 	// @see https://www.npmjs.com/package/compression#options
// 	// 	threshold: '100b',
// 	// },
// });

// // async function initializeServer() {
// // 	function normalizeFilePath(filePath: string) {
// // 		return filePath.replaceAll('\\', '/').replaceAll('//', '/');
// // 	}
// // 	function filePathToName(filePath: string) {
// // 		return normalizeFilePath(filePath).split('/').pop() || throwError('No filePath');
// // 	}
// // 	function isValidRoute(filePath: string) {
// // 		return filePath.endsWith('.ts') || filePath.endsWith('.js');
// // 	}

// // 	const allFilePaths = await getAllFiles(path.resolve(__dirname, 'routes'));
// // 	for await (const filePath of allFilePaths) {
// // 		const normalizedFilePath = normalizeFilePath(filePath);
// // 		const fileName = filePathToName(normalizedFilePath);
// // 		if (!isValidRoute(fileName)) {
// // 			console.debug('We are not importing the route:', normalizedFilePath);
// // 			continue;
// // 		}
// // 		// console.log('normalizedFilePath:', normalizedFilePath);
// // 	}
// // 	const someStuff = createServer(config, routing);
// // 	// console.log('server has been created :)');
// // }
// // initializeServer();

// const someStuff = createServer(config, routing);
// const yamlString = new OpenAPI({
// 	routing, // the same routing and config that you use to start the server
// 	config,
// 	version: '1.2.3',
// 	title: 'Example API',
// 	serverUrl: 'https://example.com',
// }).getSpecAsYaml();
// require('fs').writeFileSync('./temp/yamlString.yaml', yamlString);

// Jest does not allow us to use dotenv, mongoose, or app.listen() in tests -- So we move the general server code to ./run_server.ts, and run initialization code (dotenv, mongoose, app.listen()) here.
// Additionally, Babel ignores the order of "imports", and will run files that require process.env first, BEFORE running this file.
// So, we must move dotenv imports (and Mongo) there, which is ran FIRST.

import './init'; // Init will enable absolute paths, so we can't import it with an absolute path

import { throwError } from '@lawlzer/helpers';

import app from '~/runServer';

// If we listened in run_server, Jest wouldn't work properly. Instead, we will listen here.
// If you add a hostname, Docker will hate *you*.
app.listen(process.env.PORT || throwError('No process.env.PORT'), () => {
	console.info(`Server started on port ${process.env.PORT}`);
});
export {};
