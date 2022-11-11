export const validMethods = <const>['get', 'post', 'put', 'delete', 'patch'];
export type ValidMethod = typeof validMethods[number];

export function isValidMethod(method: string): method is ValidMethod {
	return validMethods.includes(method as typeof validMethods[number]);
}
