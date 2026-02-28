/**
 * Setup file for Vitest tests
 * Configure global test environment
 */

// Mock console methods if needed
global.console = {
    ...console,
    // Suppress console.log during tests unless DEBUG_MODE is on
    log: process.env.DEBUG_MODE ? console.log : () => {},
};

// Setup DOM mocks if needed
if (typeof window !== 'undefined') {
    // Mock localStorage
    const localStorageMock = {
        getItem: (key) => null,
        setItem: (key, value) => {},
        removeItem: (key) => {},
        clear: () => {},
    };
    global.localStorage = localStorageMock;
}
