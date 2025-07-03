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
  });
});
