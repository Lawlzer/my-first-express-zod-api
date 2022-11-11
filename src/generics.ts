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

// export type Middleware<InputZod extends z.AnyZodObject, OutputZod extends z.AnyZodObject> = (inputZod: InputZod, outputZod: OutputZod) => Promise<z.infer<OutputZod>>;
export interface Middleware<InputZod extends z.AnyZodObject, OutputZod extends z.AnyZodObject> {
	inputZod: z.AnyZodObject;
	outputZod: z.AnyZodObject;
	responses: z.ZodArray<any>[]; // This should be updated to include statusCode
	func: (input: z.infer<InputZod>) => Promise<z.infer<OutputZod>>;
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

export class HandleRoute {
	private endpoint: Endpoint;
	private method: ValidMethod;
	private req: Request;
	private res: Response;

	private responseSent = false;
	private responseZods: z.ZodTypeAny[] = [];

	constructor(endpoint: Endpoint, req: Request, res: Response, method: ValidMethod) {
		this.method = method;
		this.endpoint = endpoint;
		this.req = req;
		this.res = res;

		this.handleRequest();
	}

	private handleRequest = async () => {
		try {
			const { middlewares } = this.endpoint;

			// With default Zod behaviour, it will "strip" unknown keys from each Zod object
			// Which will remove keys -> we will not have them for *future* requests
			let sharedData: Dictionary<unknown> = {};

			for await (const middleware of middlewares) {
				const { inputZod, outputZod, responses, func } = middleware;
				const inputParsed = inputZod.safeParse(sharedData);
				this.responseZods.push(...responses);
				if (!inputParsed.success) return await this.sendErrorInvalidZod(inputParsed);
				const output = await func(inputParsed.data);
				if (this.responseSent) return;

				console.log('inputParsed: ', inputParsed);

				const outputParsed = outputZod.safeParse(output);
				if (this.responseSent) return;

				// add outputParsed to sharedData
				sharedData = { ...sharedData, ...outputParsed };
			}
		} catch (e) {
			console.log('we received a real error but caught it: ', e);
		}
	};

	private sendErrorInvalidZod = async (zodError: z.SafeParseError<z.infer<any>>) => {
		// console.log('zodError: ', zodError);
		// if (zodError.code === 'invalid_type') {
		// 	this.responseSent = true;
		// 	return await this.sendResponse({
		// 		statusCode: 400,
		// 	});
		// }
		// await this.sendResponse();
	};

	private sendResponse = async (response: z.infer<typeof ResponseZod>) => {
		console.log('hi');
		console.log('response: ', response, 'this.responseZods: ', this.responseZods);
		for (const responseType of this.responseZods) {
			const parsedResponse = responseType.safeParse(response);
			if (parsedResponse.success) {
				this.responseSent = true;
				return this.res.status(parsedResponse.data.status).send(parsedResponse.data.data);
			}
		}
		// todo needs updated to use a shared/global error type
		this.responseSent = true;
		return this.res.status(500).send({ message: 'We attempted to send a response, but it was not valid.' });
	};
}

export async function initializeRoute(endpoint: Endpoint, routePath: string, method: ValidMethod, router: Router) {
	router[method](`/${routePath}`, async (req: Request, res: Response) => {
		new HandleRoute(endpoint, req, res, method);
		// await handleRequest(endpoint, req, res);
	});

	app.use(`/`, router);
}
