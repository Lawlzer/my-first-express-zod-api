import { defaultEndpointsFactory } from 'express-zod-api';
import { z } from 'zod';

import {} from '~/generics';

const Input = z.object({
	name: z.string(),
});
type Input = z.infer<typeof Input>;

const Output = z.object({
	name: z.string(),
	statusCode: z.number().refine((num) => num === 200),
});
type Output = z.infer<typeof Output>;

function wholeExample(input: Input): Output {
	return { statusCode: 12, name: 'oh fuck' };
}

// const name = z.string({
// 	required_error: 'Name is require',
// 	invalid_type_error: 'Name must be a string',
// })

// z.function().args(z.string(), z.number()).returns(z.boolean())
// .implement()

// const myString = z.string().refine((val) => val.length <= 255, {
// 	message: 'String must be less than 255 characters.'
// })

// type of Zod schema -- function something<T extends z.ZodTypeAny>(schema: T) {}

// const Input = z.object({
// 	name: z.string(),
// 	id: z.string(),
// });
// type Input = z.infer<typeof Input>;

// .strict() // Do not allow unknown keys

// something.safeParse(input)

// if (!data.success) {
// data.error.issues
// }

interface All {}
export {};
