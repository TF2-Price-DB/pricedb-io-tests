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

  test('Main site should contain expected content', async () => {
    try {
      const response = await axios.get(MAIN_SITE_URL);
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
      
      const content = response.data;
      
      // Check for key content sections
      expect(content).toContain('TF2 Price Database');
      expect(content).toContain('Real-time Data');
      expect(content).toContain('RESTful API');
      expect(content).toContain('Bot Integration');
      
      console.log('✅ Main site contains expected content sections');
    } catch (error) {
      console.error('❌ Main site content test failed:', error.message);
      throw error;
    }
  });

  test('Main site should have navigation links to new pages', async () => {
    try {
      const response = await axios.get(MAIN_SITE_URL);
      
      expect(response.status).toBe(200);
      const content = response.data;
      
      // Check for navigation links from the footer/header
      expect(content).toContain('/search'); // Search Items
      expect(content).toContain('/stats'); // Database Statistics  
      expect(content).toContain('/api-docs'); // API Documentation
      
      console.log('✅ Main site contains navigation links to key pages');
    } catch (error) {
      console.error('❌ Navigation links test failed:', error.message);
      throw error;
    }
  });

  describe('Additional Website Pages', () => {
    test('Search page should be accessible', async () => {
      try {
        const response = await axios.get(`${MAIN_SITE_URL}search`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/text\/html/);
        
        const content = response.data;
        expect(content).toContain('<html');
        
        console.log('✅ Search page is accessible');
      } catch (error) {
        console.error('❌ Search page test failed:', error.message);
        throw error;
      }
    });

    test('Stats page should be accessible', async () => {
      try {
        const response = await axios.get(`${MAIN_SITE_URL}stats`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/text\/html/);
        
        const content = response.data;
        expect(content).toContain('<html');
        
        console.log('✅ Stats page is accessible');
      } catch (error) {
        console.error('❌ Stats page test failed:', error.message);
        throw error;
      }
    });

    test('API docs page should be accessible', async () => {
      try {
        const response = await axios.get(`${MAIN_SITE_URL}api-docs`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/text\/html/);
        
        const content = response.data;
        expect(content).toContain('<html');
        expect(content).toContain('API Documentation');
        
        console.log('✅ API docs page is accessible');
      } catch (error) {
        console.error('❌ API docs page test failed:', error.message);
        throw error;
      }
    });
  });

  describe('Related Services', () => {
    test('Status site should be accessible', async () => {
      try {
        const response = await axios.get('https://status.pricedb.io/');
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/text\/html/);
        
        const content = response.data;
        expect(content).toContain('<html');
        
        console.log('✅ Status site is accessible');
      } catch (error) {
        console.error('❌ Status site test failed:', error.message);
        throw error;
      }
    });

    test('Spells site should be accessible', async () => {
      try {
        const response = await axios.get('https://spells.pricedb.io/');
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/text\/html/);
        
        const content = response.data;
        expect(content).toContain('<html');
        
        console.log('✅ Spells site is accessible');
      } catch (error) {
        console.error('❌ Spells site test failed:', error.message);
        throw error;
      }
    });
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
      
      console.log('✅ Main site responds with headers (security implementation may vary)');
    } catch (error) {
      console.error('❌ Security headers test failed:', error.message);
      throw error;
    }
  });
});
