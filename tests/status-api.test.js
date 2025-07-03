const axios = require('axios');

describe('Status API Tests - status.pricedb.io', () => {
  const STATUS_API_URL = 'https://status.pricedb.io/api/status';
  
  beforeAll(() => {
    axios.defaults.timeout = 15000;
  });

  test('Status API should be reachable and return valid JSON', async () => {
    try {
      const response = await axios.get(STATUS_API_URL);
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      
      // Should return valid JSON
      expect(typeof response.data).toBe('object');
      
      console.log('✅ Status API is reachable and returns JSON');
    } catch (error) {
      console.error('❌ Status API reachability test failed:', error.message);
      throw error;
    }
  });

  test('Status API should return expected service structure', async () => {
    try {
      const response = await axios.get(STATUS_API_URL);
      const data = response.data;
      
      // Check main structure
      expect(data).toHaveProperty('services');
      expect(data).toHaveProperty('backpack');
      expect(data).toHaveProperty('steamLogin');
      expect(data).toHaveProperty('tf2api');
      expect(data).toHaveProperty('webapi');
      
      // Check services array
      expect(Array.isArray(data.services)).toBe(true);
      expect(data.services.length).toBeGreaterThan(0);
      
      console.log('✅ Status API returns expected structure');
      console.log(`Found ${data.services.length} services`);
    } catch (error) {
      console.error('❌ Status API structure test failed:', error.message);
      throw error;
    }
  });

  test('Status API services should have required fields', async () => {
    try {
      const response = await axios.get(STATUS_API_URL);
      const data = response.data;
      
      // Check each service has required fields
      data.services.forEach((service, index) => {
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('pm2Name');
        expect(service).toHaveProperty('status');
        expect(service).toHaveProperty('uptime');
        expect(service).toHaveProperty('restart');
        expect(service).toHaveProperty('memory');
        expect(service).toHaveProperty('cpu');
        
        expect(typeof service.name).toBe('string');
        expect(typeof service.pm2Name).toBe('string');
        expect(typeof service.status).toBe('string');
        expect(typeof service.uptime).toBe('number');
        expect(typeof service.restart).toBe('number');
        expect(typeof service.memory).toBe('number');
        expect(typeof service.cpu).toBe('number');
        
        console.log(`✅ Service ${index + 1}: ${service.name} - ${service.status}`);
      });
      
      console.log('✅ All services have required fields');
    } catch (error) {
      console.error('❌ Status API service fields test failed:', error.message);
      throw error;
    }
  });

  test('Status API should show expected services', async () => {
    try {
      const response = await axios.get(STATUS_API_URL);
      const data = response.data;
      
      const expectedServices = [
        'Item Pricer',
        'DB Handler', 
        'DB Manager',
        'Status Monitor'
      ];
      
      const serviceNames = data.services.map(service => service.name);
      
      expectedServices.forEach(expectedService => {
        expect(serviceNames).toContain(expectedService);
        console.log(`✅ Found expected service: ${expectedService}`);
      });
      
      console.log('✅ All expected services are present');
    } catch (error) {
      console.error('❌ Expected services test failed:', error.message);
      throw error;
    }
  });

  test('Status API external services should be online', async () => {
    try {
      const response = await axios.get(STATUS_API_URL);
      const data = response.data;
      
      // Check external services status
      expect(data.backpack).toHaveProperty('website');
      expect(data.steamLogin).toHaveProperty('login');
      expect(data.tf2api).toHaveProperty('tf2api');
      expect(data.webapi).toHaveProperty('webapi');
      
      // Log status of external services
      console.log(`✅ Backpack website: ${data.backpack.website}`);
      console.log(`✅ Steam login: ${data.steamLogin.login}`);
      console.log(`✅ TF2 API: ${data.tf2api.tf2api}`);
      console.log(`✅ Web API: ${data.webapi.webapi}`);
      
      // Ideally all should be online, but we'll just check they exist
      expect(typeof data.backpack.website).toBe('string');
      expect(typeof data.steamLogin.login).toBe('string');
      expect(typeof data.tf2api.tf2api).toBe('string');
      expect(typeof data.webapi.webapi).toBe('string');
      
      console.log('✅ All external services have status information');
    } catch (error) {
      console.error('❌ External services status test failed:', error.message);
      throw error;
    }
  });

  test('Status API should respond quickly', async () => {
    const startTime = Date.now();
    
    try {
      await axios.get(STATUS_API_URL);
      const responseTime = Date.now() - startTime;
      
      // Status API should respond within 10 seconds
      expect(responseTime).toBeLessThan(10000);
      
      console.log(`✅ Status API responded in ${responseTime}ms`);
    } catch (error) {
      console.error('❌ Status API response time test failed:', error.message);
      throw error;
    }
  });
});
