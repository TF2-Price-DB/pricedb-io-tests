// Global test setup
global.console = {
  ...console,
  // Suppress console.log during tests unless explicitly needed
  log: jest.fn(),
};

// Set longer timeout for network requests
jest.setTimeout(30000);
