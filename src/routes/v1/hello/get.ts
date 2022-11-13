import { defaultEndpointsFactory } from 'express-zod-api';
import { z } from 'zod';

import { Endpoint, initializeRoute, Middleware } from '~/generics';
import { GetUserFunction, middlewareGetUser } from '~/middlewares/getUser';

// const Input = z.object({
// 	name: z.string(),
// });
// type Input = z.infer<typeof Input>;

// const Output = z.object({
// 	name: z.string(),
// 	statusCode: z.number().refine((num) => num === 200),
// });
// type Output = z.infer<typeof Output>;

// function wholeExample(input: Input): Output {
// 	return { statusCode: 12, name: 'oh fuck' };
// }

// (async () => {
// 	const endpoint = await initializeRoute({
// 		middlewares: [middlewareGetUser],
// 	});
// })();
// // const name = z.string({
// // 	required_error: 'Name is require',
// // 	invalid_type_error: 'Name must be a string',
// // })

// // z.function().args(z.string(), z.number()).returns(z.boolean())
// // .implement()

// // const myString = z.string().refine((val) => val.length <= 255, {
// // 	message: 'String must be less than 255 characters.'
// // })

// // type of Zod schema -- function something<T extends z.ZodTypeAny>(schema: T) {}

// // const Input = z.object({
// // 	name: z.string(),
// // 	id: z.string(),
// // });
// // type Input = z.infer<typeof Input>;

// // .strict() // Do not allow unknown keys

// // something.safeParse(input)

// // if (!data.success) {
// // data.error.issues
// // }

const InputZod = z.object({
	name: z.string(),
});

const Output = z.object({
	password: z.string(),
});

const responses = z.array(z.union([z.object({ statusCode: z.literal(200) }), z.object({ statusCode: z.literal(400) })]));
const myFunction = async (sendResponse: (something: z.infer<typeof responses>) => {}, Input: z.infer<typeof InputZod>): Promise<z.infer<typeof Output>> => {
	sendResponse({ statusCode: 200 });
	return { password: '123' };
};

// const thisRouteMiddleware: Middleware<typeof InputZod, typeof Output> = {
// 	inputZod: InputZod,

// 	outputZod: Output,
// 	responses: [responses],

// 	func: myFunction,
// };
const thisRouteMiddleware: Middleware = {
	inputZod: z.object({
		name: z.string(),
	}),

	outputZod: z.object({
		hash: z.string(),
	}),
	responses: [
		z.object({
			statusCode: z.literal(200),
		}),
		z.object({
			statusCode: z.literal(400),
		}),
	],

	func: async (sendResponse, input) => {
		console.log(input);
	},
};
const endpoint: Endpoint = {
	middlewares: [middlewareGetUser, thisRouteMiddleware],
	// method: dynamically determined
	// path: dynamically determined
};

export default endpoint;
