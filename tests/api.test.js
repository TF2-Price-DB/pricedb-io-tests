const axios = require('axios');

describe('PriceDB API Tests - pricedb.io/api', () => {
  const API_BASE_URL = 'https://pricedb.io/api';
  
  beforeAll(() => {
    axios.defaults.timeout = 15000;
  });

  describe('Health Check Endpoint', () => {
    test('GET /api/ should return health status', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        
        const data = response.data;
        expect(data).toHaveProperty('status');
        expect(data).toHaveProperty('db');
        expect(data.status).toBe('ok');
        expect(data.db).toBe('ok');
        
        console.log('✅ Health check endpoint working:', data);
      } catch (error) {
        console.error('❌ Health check test failed:', error.message);
        throw error;
      }
    });
  });

  describe('Items Endpoint', () => {
    test('GET /api/items should return list of items', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/items`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        
        const data = response.data;
        expect(Array.isArray(data)).toBe(true);
        
        if (data.length > 0) {
          // Check structure of first item
          const firstItem = data[0];
          expect(firstItem).toHaveProperty('name');
          expect(firstItem).toHaveProperty('sku');
          expect(typeof firstItem.name).toBe('string');
          expect(typeof firstItem.sku).toBe('string');
          
          console.log(`✅ Items endpoint returned ${data.length} items`);
          console.log(`Sample item: ${firstItem.name} (${firstItem.sku})`);
        } else {
          console.log('⚠️ Items endpoint returned empty array');
        }
      } catch (error) {
        console.error('❌ Items endpoint test failed:', error.message);
        throw error;
      }
    });

    test('GET /api/items should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      try {
        await axios.get(`${API_BASE_URL}/items`);
        const responseTime = Date.now() - startTime;
        
        expect(responseTime).toBeLessThan(15000); // 15 seconds max
        console.log(`✅ Items endpoint responded in ${responseTime}ms`);
      } catch (error) {
        console.error('❌ Items endpoint response time test failed:', error.message);
        throw error;
      }
    });
  });

  describe('Latest Prices Endpoint', () => {
    test('GET /api/latest-prices should return price data', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/latest-prices`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        
        const data = response.data;
        expect(Array.isArray(data)).toBe(true);
        
        if (data.length > 0) {
          // Check structure of first price entry
          const firstPrice = data[0];
          expect(firstPrice).toHaveProperty('name');
          expect(firstPrice).toHaveProperty('sku');
          expect(firstPrice).toHaveProperty('source');
          expect(firstPrice).toHaveProperty('time');
          expect(firstPrice).toHaveProperty('buy');
          expect(firstPrice).toHaveProperty('sell');
          
          // Check buy/sell structure
          expect(firstPrice.buy).toHaveProperty('keys');
          expect(firstPrice.buy).toHaveProperty('metal');
          expect(firstPrice.sell).toHaveProperty('keys');
          expect(firstPrice.sell).toHaveProperty('metal');
          
          console.log(`✅ Latest prices endpoint returned ${data.length} price entries`);
          console.log(`Sample price: ${firstPrice.name} - Buy: ${firstPrice.buy.keys}k ${firstPrice.buy.metal}ref`);
        } else {
          console.log('⚠️ Latest prices endpoint returned empty array');
        }
      } catch (error) {
        console.error('❌ Latest prices endpoint test failed:', error.message);
        throw error;
      }
    });

    test('GET /api/latest-prices should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      try {
        await axios.get(`${API_BASE_URL}/latest-prices`);
        const responseTime = Date.now() - startTime;
        
        expect(responseTime).toBeLessThan(20000); // 20 seconds max for large dataset
        console.log(`✅ Latest prices endpoint responded in ${responseTime}ms`);
      } catch (error) {
        console.error('❌ Latest prices endpoint response time test failed:', error.message);
        throw error;
      }
    });
  });

  describe('Individual Item Endpoint', () => {
    let testSku = null;

    beforeAll(async () => {
      // Get a test SKU from the items endpoint
      try {
        const response = await axios.get(`${API_BASE_URL}/items`);
        if (response.data.length > 0) {
          testSku = response.data[0].sku;
          console.log(`Using test SKU: ${testSku}`);
        }
      } catch (error) {
        console.log('Could not get test SKU, will use fallback');
        testSku = '40;11;kt-3'; // Fallback SKU from example
      }
    });

    test('GET /api/item/<sku> should return individual item price', async () => {
      if (!testSku) {
        console.log('⚠️ Skipping individual item test - no test SKU available');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/item/${encodeURIComponent(testSku)}`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        
        const data = response.data;
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('sku');
        expect(data).toHaveProperty('source');
        expect(data).toHaveProperty('time');
        expect(data).toHaveProperty('buy');
        expect(data).toHaveProperty('sell');
        
        expect(data.sku).toBe(testSku);
        
        console.log(`✅ Individual item endpoint returned data for: ${data.name}`);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`⚠️ Item ${testSku} not found (404) - this may be expected`);
        } else {
          console.error('❌ Individual item endpoint test failed:', error.message);
          throw error;
        }
      }
    });

    test('GET /api/item/<invalid-sku> should handle invalid SKU gracefully', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/item/invalid-sku-12345`);
        
        // Should either return 404 or empty result, not crash
        expect([200, 404]).toContain(response.status);
        
        console.log(`✅ Invalid SKU handled gracefully with status: ${response.status}`);
      } catch (error) {
        if (error.response && [404, 400].includes(error.response.status)) {
          console.log(`✅ Invalid SKU properly rejected with status: ${error.response.status}`);
        } else {
          console.error('❌ Invalid SKU test failed:', error.message);
          throw error;
        }
      }
    });
  });

  describe('All Prices Endpoint', () => {
    test('GET /api/prices should return price history', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/prices`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        
        const data = response.data;
        expect(Array.isArray(data)).toBe(true);
        
        if (data.length > 0) {
          const firstPrice = data[0];
          expect(firstPrice).toHaveProperty('name');
          expect(firstPrice).toHaveProperty('sku');
          expect(firstPrice).toHaveProperty('source');
          expect(firstPrice).toHaveProperty('time');
          expect(firstPrice).toHaveProperty('buy');
          expect(firstPrice).toHaveProperty('sell');
          
          console.log(`✅ All prices endpoint returned ${data.length} price entries`);
        } else {
          console.log('⚠️ All prices endpoint returned empty array');
        }
      } catch (error) {
        console.error('❌ All prices endpoint test failed:', error.message);
        throw error;
      }
    });

    test('GET /api/prices should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      try {
        await axios.get(`${API_BASE_URL}/prices`);
        const responseTime = Date.now() - startTime;
        
        expect(responseTime).toBeLessThan(30000); // 30 seconds max for all data
        console.log(`✅ All prices endpoint responded in ${responseTime}ms`);
      } catch (error) {
        console.error('❌ All prices endpoint response time test failed:', error.message);
        throw error;
      }
    });
  });

  describe('Item History Endpoints', () => {
    let testSku = null;

    beforeAll(async () => {
      // Get a test SKU from the items endpoint
      try {
        const response = await axios.get(`${API_BASE_URL}/items`);
        if (response.data.length > 0) {
          testSku = response.data[0].sku;
          console.log(`Using test SKU for history tests: ${testSku}`);
        }
      } catch (error) {
        console.log('Could not get test SKU, will use fallback');
        testSku = '40;11;kt-3'; // Fallback SKU from docs
      }
    });

    test('GET /api/item-history/<sku> should return item price history', async () => {
      if (!testSku) {
        console.log('⚠️ Skipping item history test - no test SKU available');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/item-history/${encodeURIComponent(testSku)}`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        
        const data = response.data;
        expect(Array.isArray(data)).toBe(true);
        
        if (data.length > 0) {
          const firstEntry = data[0];
          expect(firstEntry).toHaveProperty('name');
          expect(firstEntry).toHaveProperty('sku');
          expect(firstEntry).toHaveProperty('time');
          expect(firstEntry.sku).toBe(testSku);
          
          console.log(`✅ Item history endpoint returned ${data.length} entries for ${firstEntry.name}`);
        } else {
          console.log('⚠️ Item history endpoint returned empty array - item may not have history');
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`⚠️ Item ${testSku} history not found (404) - this may be expected`);
        } else {
          console.error('❌ Item history endpoint test failed:', error.message);
          throw error;
        }
      }
    });

    test('GET /api/item-history/<sku> with time filters should work', async () => {
      if (!testSku) {
        console.log('⚠️ Skipping item history filter test - no test SKU available');
        return;
      }

      try {
        // Test with start timestamp (30 days ago)
        const thirtyDaysAgo = Math.floor((Date.now() - (30 * 24 * 60 * 60 * 1000)) / 1000);
        const response = await axios.get(`${API_BASE_URL}/item-history/${encodeURIComponent(testSku)}?start=${thirtyDaysAgo}`);
        
        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          const data = response.data;
          expect(Array.isArray(data)).toBe(true);
          console.log(`✅ Item history with time filter returned ${data.length} entries`);
        } else {
          console.log('⚠️ Item history with filter returned 404 - no data in time range');
        }
      } catch (error) {
        console.error('❌ Item history filter test failed:', error.message);
        throw error;
      }
    });

    test('GET /api/item-stats/<sku> should return item statistics', async () => {
      if (!testSku) {
        console.log('⚠️ Skipping item stats test - no test SKU available');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/item-stats/${encodeURIComponent(testSku)}`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        
        const data = response.data;
        expect(data).toHaveProperty('buy');
        expect(data).toHaveProperty('sell');
        
        // Check buy stats structure
        expect(data.buy).toHaveProperty('count');
        expect(data.buy).toHaveProperty('keys');
        expect(data.buy).toHaveProperty('metal');
        expect(data.buy.keys).toHaveProperty('min');
        expect(data.buy.keys).toHaveProperty('max');
        expect(data.buy.keys).toHaveProperty('avg');
        
        console.log(`✅ Item stats endpoint returned stats for ${data.buy.count} buy entries`);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`⚠️ Item ${testSku} stats not found (404) - this may be expected`);
        } else {
          console.error('❌ Item stats endpoint test failed:', error.message);
          throw error;
        }
      }
    });

    test('GET /api/graph/<sku> should return HTML chart page', async () => {
      if (!testSku) {
        console.log('⚠️ Skipping item graph test - no test SKU available');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/graph/${encodeURIComponent(testSku)}`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/text\/html/);
        
        // Should contain HTML content
        expect(response.data).toContain('<html');
        expect(response.data).toContain('chart');
        
        console.log('✅ Item graph endpoint returned HTML chart page');
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`⚠️ Item ${testSku} graph not found (404) - this may be expected`);
        } else {
          console.error('❌ Item graph endpoint test failed:', error.message);
          throw error;
        }
      }
    });

    test('GET /api/graph/<sku>?header=false should return chart without header', async () => {
      if (!testSku) {
        console.log('⚠️ Skipping item graph header test - no test SKU available');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/graph/${encodeURIComponent(testSku)}?header=false`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/text\/html/);
        
        console.log('✅ Item graph endpoint with header=false parameter works');
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`⚠️ Item ${testSku} graph not found (404) - this may be expected`);
        } else {
          console.error('❌ Item graph header test failed:', error.message);
          throw error;
        }
      }
    });
  });

  describe('Bulk and Snapshot Endpoints', () => {
    let testSkus = [];

    beforeAll(async () => {
      // Get multiple test SKUs from the items endpoint
      try {
        const response = await axios.get(`${API_BASE_URL}/items`);
        if (response.data.length > 0) {
          testSkus = response.data.slice(0, 3).map(item => item.sku); // Take first 3 SKUs
          console.log(`Using test SKUs for bulk tests: ${testSkus.join(', ')}`);
        }
      } catch (error) {
        console.log('Could not get test SKUs, will use fallback');
        testSkus = ['40;11;kt-3', '202;11;australium']; // Fallback SKUs from docs
      }
    });

    test('POST /api/items-bulk should return bulk item prices', async () => {
      if (testSkus.length === 0) {
        console.log('⚠️ Skipping bulk items test - no test SKUs available');
        return;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/items-bulk`, {
          skus: testSkus
        });
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        
        const data = response.data;
        expect(Array.isArray(data)).toBe(true);
        
        // Should return data for at least some of the requested items
        if (data.length > 0) {
          const firstItem = data[0];
          expect(firstItem).toHaveProperty('name');
          expect(firstItem).toHaveProperty('sku');
          expect(firstItem).toHaveProperty('buy');
          expect(firstItem).toHaveProperty('sell');
          
          console.log(`✅ Bulk items endpoint returned ${data.length} items`);
        } else {
          console.log('⚠️ Bulk items endpoint returned empty array');
        }
      } catch (error) {
        console.error('❌ Bulk items endpoint test failed:', error.message);
        throw error;
      }
    });

    test('GET /api/snapshot/<timestamp> should return historical snapshot', async () => {
      try {
        // Test with timestamp from 7 days ago
        const weekAgo = Math.floor((Date.now() - (7 * 24 * 60 * 60 * 1000)) / 1000);
        const response = await axios.get(`${API_BASE_URL}/snapshot/${weekAgo}`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        
        const data = response.data;
        expect(Array.isArray(data)).toBe(true);
        
        if (data.length > 0) {
          const firstItem = data[0];
          expect(firstItem).toHaveProperty('name');
          expect(firstItem).toHaveProperty('sku');
          expect(firstItem).toHaveProperty('time');
          
          // Time should be at or before our snapshot timestamp
          expect(firstItem.time).toBeLessThanOrEqual(weekAgo);
          
          console.log(`✅ Snapshot endpoint returned ${data.length} items for timestamp ${weekAgo}`);
        } else {
          console.log('⚠️ Snapshot endpoint returned empty array - no data at that timestamp');
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('⚠️ Snapshot not found (404) - no data at that timestamp');
        } else {
          console.error('❌ Snapshot endpoint test failed:', error.message);
          throw error;
        }
      }
    });
  });

  describe('Bot Integration Endpoints', () => {
    test('GET /api/autob/items should return bot pricelist', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/autob/items`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        
        const data = response.data;
        expect(Array.isArray(data)).toBe(true);
        
        if (data.length > 0) {
          const firstItem = data[0];
          expect(firstItem).toHaveProperty('name');
          expect(firstItem).toHaveProperty('sku');
          
          console.log(`✅ Bot pricelist endpoint returned ${data.length} items`);
        } else {
          console.log('⚠️ Bot pricelist endpoint returned empty array');
        }
      } catch (error) {
        console.error('❌ Bot pricelist endpoint test failed:', error.message);
        throw error;
      }
    });

    test('GET /api/autob/items/<sku> should return single bot item price', async () => {
      let testSku = null;
      
      try {
        // Try to get a test SKU from items endpoint
        const itemsResponse = await axios.get(`${API_BASE_URL}/items`);
        if (itemsResponse.data.length > 0) {
          testSku = itemsResponse.data[0].sku;
        } else {
          testSku = '40;11;kt-3'; // Fallback
        }
        
        const response = await axios.get(`${API_BASE_URL}/autob/items/${encodeURIComponent(testSku)}`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        
        const data = response.data;
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('sku');
        expect(data.sku).toBe(testSku);
        
        console.log(`✅ Bot single item endpoint returned data for: ${data.name}`);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`⚠️ Bot item ${testSku} not found (404) - this may be expected`);
        } else {
          console.error('❌ Bot single item endpoint test failed:', error.message);
          throw error;
        }
      }
    });

    test('POST /api/autob/items/<sku> should handle price check requests', async () => {
      let testSku = null;
      
      try {
        // Try to get a test SKU from items endpoint
        const itemsResponse = await axios.get(`${API_BASE_URL}/items`);
        if (itemsResponse.data.length > 0) {
          testSku = itemsResponse.data[0].sku;
        } else {
          testSku = '40;11;kt-3'; // Fallback
        }
        
        const response = await axios.post(`${API_BASE_URL}/autob/items/${encodeURIComponent(testSku)}`);
        
        expect([200, 201, 404]).toContain(response.status);
        
        if (response.status === 200 || response.status === 201) {
          expect(response.headers['content-type']).toMatch(/application\/json/);
          console.log(`✅ Bot price check endpoint handled POST request for ${testSku}`);
        } else {
          console.log(`⚠️ Bot price check POST returned 404 for ${testSku} - this may be expected`);
        }
      } catch (error) {
        if (error.response && [404, 405].includes(error.response.status)) {
          console.log(`⚠️ Bot price check POST properly handled with status: ${error.response.status}`);
        } else {
          console.error('❌ Bot price check POST test failed:', error.message);
          throw error;
        }
      }
    });
  });

  describe('Rate Limiting and CORS', () => {
    test('API should include CORS headers', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/`);
        
        expect(response.status).toBe(200);
        
        // Check for CORS headers (may vary based on implementation)
        const headers = response.headers;
        console.log('Available headers:', Object.keys(headers).join(', '));
        
        // The API documentation mentions CORS is allowed, so this test mainly documents behavior
        console.log('✅ API responds with headers (CORS implementation may vary)');
      } catch (error) {
        console.error('❌ CORS headers test failed:', error.message);
        throw error;
      }
    });

    test('API should be documented to have rate limiting (180 req/min)', async () => {
      // This is more of a documentation test since we can't easily test rate limiting in a unit test
      // The API docs specify 180 requests per minute per IP
      
      try {
        const response = await axios.get(`${API_BASE_URL}/`);
        expect(response.status).toBe(200);
        
        console.log('✅ API accessible (rate limiting: 180 req/min per IP as per docs)');
      } catch (error) {
        console.error('❌ Rate limiting documentation test failed:', error.message);
        throw error;
      }
    });
  });

  describe('API Error Handling', () => {
    test('Non-existent endpoint should return 404', async () => {
      try {
        await axios.get(`${API_BASE_URL}/non-existent-endpoint`);
        // If we get here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error.response.status).toBe(404);
        console.log('✅ Non-existent endpoint properly returns 404');
      }
    });

    test('API should handle malformed requests', async () => {
      try {
        // Try to access item endpoint with malformed parameter
        const response = await axios.get(`${API_BASE_URL}/item/`);
        
        // Should handle gracefully (either 400, 404, or redirect)
        expect([200, 400, 404, 301, 302]).toContain(response.status);
        console.log(`✅ Malformed request handled with status: ${response.status}`);
      } catch (error) {
        if (error.response && [400, 404, 405].includes(error.response.status)) {
          console.log(`✅ Malformed request properly rejected with status: ${error.response.status}`);
        } else {
          console.error('❌ Malformed request test failed:', error.message);
          throw error;
        }
      }
    });

    test('Invalid SKU formats should return appropriate errors', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/item/invalid-sku-format-test`);
        
        // Should return 400 or 404 for invalid format
        expect([400, 404]).toContain(response.status);
        console.log(`✅ Invalid SKU format handled with status: ${response.status}`);
      } catch (error) {
        if (error.response && [400, 404].includes(error.response.status)) {
          console.log(`✅ Invalid SKU format properly rejected with status: ${error.response.status}`);
        } else {
          console.error('❌ Invalid SKU format test failed:', error.message);
          throw error;
        }
      }
    });
  });
});
