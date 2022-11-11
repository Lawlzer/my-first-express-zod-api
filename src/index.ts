import './init';
import './generics'; // TEMP

import { getAllFiles, throwError } from '@lawlzer/helpers';
import { createConfig, createServer, OpenAPI, Routing } from 'express-zod-api';
import path from 'path';

const routing: Routing = {
	// v1: {
	// 	hello: helloWorldEndpoint,
	// },
};

const config = createConfig({
	cors: true, // ?
	// errorHandler: 'default', // ? todo
	logger: {
		level: 'debug',
		color: true,
	},
	server: {
		listen: process.env.PORT || throwError('No process.env.PORT'),
		upload: true,
	},
	// compression: {
	// 	// @see https://www.npmjs.com/package/compression#options
	// 	threshold: '100b',
	// },
});

// async function initializeServer() {
// 	function normalizeFilePath(filePath: string) {
// 		return filePath.replaceAll('\\', '/').replaceAll('//', '/');
// 	}
// 	function filePathToName(filePath: string) {
// 		return normalizeFilePath(filePath).split('/').pop() || throwError('No filePath');
// 	}
// 	function isValidRoute(filePath: string) {
// 		return filePath.endsWith('.ts') || filePath.endsWith('.js');
// 	}

// 	const allFilePaths = await getAllFiles(path.resolve(__dirname, 'routes'));
// 	for await (const filePath of allFilePaths) {
// 		const normalizedFilePath = normalizeFilePath(filePath);
// 		const fileName = filePathToName(normalizedFilePath);
// 		if (!isValidRoute(fileName)) {
// 			console.debug('We are not importing the route:', normalizedFilePath);
// 			continue;
// 		}
// 		// console.log('normalizedFilePath:', normalizedFilePath);
// 	}
// 	const someStuff = createServer(config, routing);
// 	// console.log('server has been created :)');
// }
// initializeServer();

const someStuff = createServer(config, routing);
const yamlString = new OpenAPI({
	routing, // the same routing and config that you use to start the server
	config,
	version: '1.2.3',
	title: 'Example API',
	serverUrl: 'https://example.com',
}).getSpecAsYaml();
require('fs').writeFileSync('./temp/yamlString.yaml', yamlString);
