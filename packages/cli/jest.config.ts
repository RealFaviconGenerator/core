import { pathsToModuleNameMapper, JestConfigWithTsJest } from "ts-jest"
import type { Config } from 'jest'
import path from "path";

const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: pathsToModuleNameMapper({
        "@/*": ["./*.ts"]
    }),
};

export default config
