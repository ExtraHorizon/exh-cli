import { runtimeChoices } from "../../src/constants.mjs"

export const simpleVariableConfig = {
	name: "$TESTNAME",
	description: "$TESTDESCRIPTION"
}

export const noNameConfig = {
	entryPoint: 'build/index',
	runtime: runtimeChoices[0],
}

export const noEntryPointConfig = {
	name: 'testname',
	runtime: runtimeChoices[0],
}

export const noRuntimeConfig = {
	name: 'testname',
	entryPoint: 'build/index',
}

export const wrongPathConfig = {
	name: 'testname',
	entryPoint: 'build/index',
	runtime: runtimeChoices[0],
	path: '/this/wrong/path/here'
}

export const noPathConfig = {
	name: 'testname',
	entryPoint: 'build/index',
	runtime: runtimeChoices[0],
}

export const validFullConfig = {
	name: 'testname',
	entryPoint: 'build/index',
	runtime: runtimeChoices[0],
	path: '/path/here',
	timeLimit: 300,
	memoryLimit: 2048,
	environment: { 
		myvar: "123"
	}
}

