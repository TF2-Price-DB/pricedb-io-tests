# PriceDB.io Test Suite

A comprehensive Jest test suite for testing the pricedb.io services and APIs.

## What's Tested

### 1. Main Website (https://pricedb.io/)
- Site reachability and response times
- Basic security headers
- HTML content validation

### 2. WebSocket Service (ws.pricedb.io:5500)
- Connection establishment
- Ping/pong functionality
- Connection stability
- Multiple concurrent connections

### 3. Status API (https://status.pricedb.io/api/status)
- API reachability and JSON response
- Service structure validation
- Expected services presence
- External services status
- Response time performance

### 4. Main API (https://pricedb.io/api)
- **Health Check** (`/api/`) - Returns `{"status":"ok","db":"ok"}`
- **Items List** (`/api/items`) - Returns all unique items with name and SKU
- **Latest Prices** (`/api/latest-prices`) - Returns latest price entry for each SKU
- **Individual Item** (`/api/item/<sku>`) - Returns latest price for specific item
- Error handling for invalid endpoints and malformed requests

### 5. Security Testing
- **SQL Injection Protection** - Tests all API endpoints against common SQL injection payloads
- **XSS Protection** - Validates proper handling of cross-site scripting attempts
- **Input Validation** - Tests handling of special characters, long strings, and control characters
- **Rate Limiting** - Checks protection against rapid request attacks

## Installation

```bash
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

## Test Structure

```
tests/
├── website.test.js      # Main website tests
├── websocket.test.js    # WebSocket connectivity tests
├── status-api.test.js   # Status API functionality tests
├── api.test.js          # Main API endpoint tests
└── security.test.js     # Security and SQL injection tests
```

## Expected Responses

### Health Check (`/api/`)
```json
{
  "status": "ok",
  "db": "ok"
}
```

### Items List (`/api/items`)
```json
[
  {
    "name": "Strange Professional Killstreak Backburner",
    "sku": "40;11;kt-3"
  }
]
```

### Latest Prices (`/api/latest-prices`)
```json
[
  {
    "name": "Strange Professional Killstreak Backburner",
    "sku": "40;11;kt-3",
    "source": "bptf",
    "time": 1748874425,
    "buy": { "keys": 4, "metal": 11.33 },
    "sell": { "keys": 4, "metal": 69.22 }
  }
]
```

### Individual Item (`/api/item/<sku>`)
```json
{
  "name": "Strange Professional Killstreak Backburner",
  "sku": "40;11;kt-3",
  "source": "bptf",
  "time": 1748874425,
  "buy": { "keys": 4, "metal": 11.33 },
  "sell": { "keys": 4, "metal": 69.22 }
}
```

### Status API (`/api/status`)
```json
{
  "services": [
    {
      "name": "Item Pricer",
      "pm2Name": "bptf-autopricer",
      "status": "online",
      "uptime": 37241649,
      "restart": 23,
      "memory": 0,
      "cpu": 0
    }
  ],
  "backpack": { "website": "online" },
  "steamLogin": { "login": "online" },
  "tf2api": { "tf2api": "online" },
  "webapi": { "webapi": "online" }
}
```

## Security Testing

The test suite includes comprehensive security testing to ensure the API is protected against:

- **SQL Injection**: Tests 20+ common SQL injection payloads
- **XSS Attacks**: Validates proper escaping of user input
- **Input Validation**: Tests handling of special characters and malformed input
- **DoS Protection**: Checks rate limiting and rapid request handling

## Test Configuration

- **Timeout**: 30 seconds for network requests
- **Environment**: Node.js
- **Coverage**: Full coverage reporting enabled
- **Retry Logic**: Automatic retry for network-related failures

## Troubleshooting

### Common Issues

1. **Connection Timeouts**: Increase timeout in jest.config.js if services are slow
2. **WebSocket Failures**: Check if ws.pricedb.io:5500 is accessible from your network
3. **API Errors**: Verify API endpoints are live and accessible

### Debug Mode

Run tests with verbose logging:
```bash
npm run test:verbose
```

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Add appropriate error handling
3. Include both positive and negative test cases
4. Update this README with new test descriptions
