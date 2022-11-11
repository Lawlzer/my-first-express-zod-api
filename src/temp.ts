function combineObjects<input1 extends object, input2 extends object>(input1: input1, input2: input2): input1 & input2 {
	return { ...input1, ...input2 };
}

// middlewares is an array of combineObject calls
const middlewares = [{ one: 'true' }, { two: 'true' }, { three: 'true' }];

const outputObject = combineObjects({ name: 'nou' }, { id: '123' });

let currentObject = { hi: true };
for (const middlewareObject of middlewares) {
	currentObject = combineObjects(middlewareObject, currentObject);
}
console.log(currentObject);

export {};
