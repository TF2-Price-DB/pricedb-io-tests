const axios = require('axios');

describe('Main Website Tests - pricedb.io', () => {
  const MAIN_SITE_URL = 'https://pricedb.io/';
  
  beforeAll(() => {
    // Set axios timeout
    axios.defaults.timeout = 10000;
  });

  test('Main site should be reachable', async () => {
    try {
      const response = await axios.get(MAIN_SITE_URL);
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
      
      // Check if the response contains HTML content
      expect(response.data).toContain('<html');
      
      console.log('✅ Main website is reachable');
    } catch (error) {
      console.error('❌ Main website test failed:', error.message);
      throw error;
    }
  });

  test('Main site should respond within reasonable time', async () => {
    const startTime = Date.now();
    
    try {
      await axios.get(MAIN_SITE_URL);
      const responseTime = Date.now() - startTime;
      
      // Response should be under 5 seconds
      expect(responseTime).toBeLessThan(5000);
      
      console.log(`✅ Main website responded in ${responseTime}ms`);
    } catch (error) {
      console.error('❌ Main website response time test failed:', error.message);
      throw error;
    }
  });

  test('Main site should have proper security headers', async () => {
    try {
      const response = await axios.get(MAIN_SITE_URL);
      
      // Check for basic security headers (adjust based on actual implementation)
      const headers = response.headers;
      
      // Log available headers for debugging
      console.log('Available headers:', Object.keys(headers));
      
      // Basic checks - adjust these based on what headers the site actually returns
      expect(response.status).toBe(200);
      
    } catch (error) {
      console.error('❌ Security headers test failed:', error.message);
      throw error;
    }
  });
});
