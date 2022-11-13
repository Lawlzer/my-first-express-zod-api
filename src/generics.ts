import { Dictionary } from '@lawlzer/helpers';
import { Request, Response, Router } from 'express';
import { z } from 'zod';

import app from '~/runServer';
import { ValidMethod, validMethods } from '~/utils/router';

export const ResponseErrorZod = z.object({
	statusCode: z.number(),
	message: z.string(), // todo this should be a { [key: string]: string }
});

export const ResponseZod = z.object({
	statusCode: z.number(),
	data: z.unknown(),
});

// Responses should also extend statusCodes. #todo
export interface Middleware<InputZod extends z.AnyZodObject, OutputZod extends z.AnyZodObject, Responses extends z.AnyZodObject[]> {
	inputZod: InputZod;
	outputZod: OutputZod;
	responses: Responses;

	// sendResponse needs correct types
	func: (sendResponse: any, input: z.infer<InputZod>) => Promise<z.infer<OutputZod>>;
}

export function assertIsValidResponse<T extends z.infer<typeof ResponseErrorZod>>(response: T): asserts response is T {
	ResponseErrorZod.parse(response);
}

export interface Endpoint {
	middlewares: Middleware<any, any>[];
}

export async function parseRequestInput(req: Request) {
	const allData: { [key: string]: string } = {};

	Object.keys(req.body).forEach((key) => {
		allData[key] = String(req.body[key]);
	});
	Object.keys(req.query).forEach((key) => {
		allData[key] = String(req.query[key]);
	});
	Object.keys(req.params).forEach((key) => {
		allData[key] = String(req.params[key]);
	});

	Object.keys(req.headers).forEach((key) => {
		allData[key] = String(req.headers[key]);
	});

	return allData;
}

async function handleRequest(endpoint: Endpoint, req: Request, res: Response) {
	let responseSent = false;
	let responseZods: z.ZodTypeAny[] = [];

	async function sendErrorInvalidZod(zodError: z.SafeParseError<z.infer<any>>) {
		// console.log('zodError: ', zodError);
		// if (zodError.code === 'invalid_type') {
		// 	responseSent = true;
		// 	return await sendResponse({
		// 		statusCode: 400,
		// 	});
		// }
		// await sendResponse();
	}

	async function sendResponse(response: z.infer<typeof ResponseZod>) {
		console.log('sendResponse ---- response: ', response, 'responseZods: ', responseZods);
		for (const responseType of responseZods) {
			const parsedResponse = responseType.safeParse(response);
			if (parsedResponse.success) {
				responseSent = true;
				return res.status(parsedResponse.data.status).send(parsedResponse.data.data);
			}
		}
		// todo needs updated to use a shared/global error type
		responseSent = true;
		return res.status(500).send({ message: 'We attempted to send a response, but it was not valid.' });
	}

	try {
		const { middlewares } = endpoint;

		// With default Zod behaviour, it will "strip" unknown keys from each Zod object
		// Which will remove keys -> we will not have them for *future* requests
		let sharedData: Dictionary<unknown> = {};

		for await (const middleware of middlewares) {
			const { inputZod, outputZod, responses, func } = middleware;
			const inputParsed = inputZod.safeParse(sharedData);
			responseZods.push(...responses);
			if (!inputParsed.success) return await sendErrorInvalidZod(inputParsed);
			const output = await func(sendResponse, inputParsed.data);
			if (responseSent) return;

			console.log('inputParsed: ', inputParsed);

			const outputParsed = outputZod.safeParse(output);
			if (responseSent) return;

			// add outputParsed to sharedData
			sharedData = { ...sharedData, ...outputParsed };
		}
	} catch (e) {
		console.log('we received a real error but caught it: ', e);
	}
}

export async function initializeRoute(endpoint: Endpoint, routePath: string, method: ValidMethod, router: Router) {
	router[method](`/${routePath}`, async (req: Request, res: Response) => {
		await handleRequest(endpoint, req, res);
	});

	app.use(`/`, router);
}
