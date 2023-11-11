module.exports = {
    roots: ['.'],
    setupFiles: ['<rootDir>/jest.setup.ts'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    }
}
