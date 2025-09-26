# PriceDB.io Test Suite

A comprehensive Jest test suite for testing the pricedb.io ecosystem services and APIs.

## What's Tested

### 1. Main Website (https://pricedb.io/)
- Site reachability and response times
- Content validation and key sections
- Navigation links to new pages (/search, /stats, /api-docs)
- Basic security headers

### 2. Main API (https://pricedb.io/api)
**Core Endpoints:**
- **Health Check** (`/api/`) - Returns service status and database connectivity
- **Items List** (`/api/items`) - Returns all unique items with name and SKU
- **Latest Prices** (`/api/latest-prices`) - Returns latest price entry for each SKU
- **All Prices** (`/api/prices`) - Returns complete price history
- **Individual Item** (`/api/item/<sku>`) - Returns latest price for specific item

**New Advanced Endpoints:**
- **Item History** (`/api/item-history/<sku>`) - Full price history for specific item with time filtering
- **Item Statistics** (`/api/item-stats/<sku>`) - Min/max/avg statistics for item prices
- **Price Chart** (`/api/graph/<sku>`) - HTML chart visualization (with header=false option)
- **Bulk Lookup** (`POST /api/items-bulk`) - Bulk item price lookup
- **Historical Snapshot** (`/api/snapshot/<timestamp>`) - Market snapshot at specific time

**Bot Integration Endpoints:**
- **Bot Pricelist** (`/api/autob/items`) - Full pricelist for TF2Autobot integration
- **Bot Single Item** (`/api/autob/items/<sku>`) - Single item for bot integration
- **Bot Price Check** (`POST /api/autob/items/<sku>`) - Price check endpoint

**Rate Limiting:** 180 requests per minute per IP

### 3. Spells API (https://spells.pricedb.io/api) - NEW SERVICE
**Service & Health:**
- **Health Check** (`/api/health`) - Service health with database status
- **Statistics** (`/api/stats`) - Live service stats (listings, spells, avg premium)

**Spell Data:**
- **All Spells** (`/api/spell/spells`) - List all available spells with IDs
- **Spell ID to Name** (`/api/spell/spell-id-to-name`) - Convert spell ID to readable name

**Analytics & Predictions:**
- **Spell Analytics** (`/api/spell/spell-analytics`) - Comprehensive spell combination analytics
- **Spell Value** (`/api/spell/spell-value`) - Premium calculations for spell combinations
- **Enhanced Prediction** (`/api/spell/predict`) - Advanced spell price predictions with market data
- **Item-Specific Premium** (`/api/spell/item-spell-premium`) - Calculate premium for specific items

**Rate Limiting:** 100 requests per minute per IP

### 4. Status API (https://status.pricedb.io/api/status) - UPDATED FORMAT
**Core Services Monitoring:**
- Service categories (core, internal)
- Uptime percentage and history bars
- Real-time metrics (memory, CPU, restarts)

**New Services Tracked:**
- **Relay Service** - WebSocket relay with connection metrics
- **Spell Handler** - Spell processing service with database status
- **Updated Service Structure** - Category-based organization

**External Services:**
- Backpack.tf connectivity with uptime tracking
- Steam login status with history
- TF2 API and Web API monitoring

### 5. WebSocket Service (ws.pricedb.io:5500)
- Connection establishment and stability
- Ping/pong functionality
- Multiple concurrent connections
- Real-time price update support

### 6. Security Testing - EXPANDED
**Comprehensive Security Coverage:**
- **SQL Injection Protection** - Tests all endpoints including new ones (bulk, history, snapshots, spells)
- **XSS Protection** - Validates proper input escaping across all services
- **Input Validation** - Special characters, long strings, control characters
- **Parameter Validation** - Timestamp validation, ID validation, malicious payloads
- **Rate Limiting** - DoS protection testing
- **Multi-Service Security** - Tests main API, spells API, and bot endpoints

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
├── website.test.js      # Main website and new pages tests
├── websocket.test.js    # WebSocket connectivity tests
├── status-api.test.js   # Status API with new service structure
├── api.test.js          # Main API with all new endpoints
├── spells-api.test.js   # New spells service API tests
└── security.test.js     # Comprehensive security tests for all services
```

## Expected Responses

### Main API Examples

#### Health Check (`/api/`)
```json
{
  "status": "ok",
  "db": "ok"
}
```

#### Items List (`/api/items`)
```json
[
  {
    "name": "Strange Professional Killstreak Backburner",
    "sku": "40;11;kt-3"
  }
]
```

#### Item Statistics (`/api/item-stats/<sku>`)
```json
{
  "buy": {
    "count": 12,
    "keys": { "min": 2, "max": 4, "avg": 3.1 },
    "metal": { "min": 11.33, "max": 69.22, "avg": 40.12 }
  },
  "sell": {
    "count": 12,
    "keys": { "min": 2, "max": 4, "avg": 3.1 },
    "metal": { "min": 11.33, "max": 69.22, "avg": 40.12 }
  }
}
```

#### Bulk Lookup (`POST /api/items-bulk`)
Request:
```json
{
  "skus": ["40;11;kt-3", "202;11;australium"]
}
```

Response:
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

### Spells API Examples

#### Spell Prediction (`/api/spell/predict`)
```json
{
  "item_name": "Strange Rocket Launcher",
  "spells": ["Exorcism"],
  "spell_ids": [2002],
  "base_price": {
    "total_ref": 65.99,
    "keys": 1,
    "metal": 8.44,
    "formatted": "1 keys, 8.4 ref"
  },
  "predictions": {
    "low": { "total_ref": 1315.39, "formatted": "22 keys, 49.9 ref" },
    "mid": { "total_ref": 1731.75, "formatted": "30 keys, 6.3 ref" },
    "high": { "total_ref": 2356.61, "formatted": "40 keys, 56.1 ref" }
  },
  "market_data": {
    "avg_flat_premium": 1665.76,
    "sample_size": 206,
    "confidence": "high"
  }
}
```

#### Spells List (`/api/spell/spells`)
```json
[
  { "id": 2003, "name": "Pumpkin Bombs" },
  { "id": 2002, "name": "Exorcism" }
]
```

### Status API (Updated Format)
```json
{
  "services": [
    {
      "name": "DB Handler",
      "status": "online",
      "category": "core",
      "uptime": 5578018,
      "restart": 0,
      "memory": 0,
      "cpu": 0,
      "uptimePercentage": 100,
      "uptimeBars": [...]
    }
  ],
  "backpack": { "website": "online", "uptimePercentage": 100 },
  "steamLogin": { "login": "online", "uptimePercentage": 100 },
  "relay": {
    "relay": "online",
    "backpackConnected": true,
    "uptime": 55576434,
    "messagesRelayed": 49633,
    "connectedClients": 2
  },
  "spellHandler": {
    "spellHandler": "online",
    "database": "online",
    "timestamp": "2025-09-26T00:16:54.571Z",
    "uptimePercentage": 98
  }
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
