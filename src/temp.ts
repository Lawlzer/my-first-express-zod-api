function combineObjects<input1 extends object, input2 extends object>(input1: input1, input2: input2): input1 & input2 {
	return { ...input1, ...input2 };
}

const outputObject = combineObjects({ name: 'nou' }, { id: '123' });

export {};
