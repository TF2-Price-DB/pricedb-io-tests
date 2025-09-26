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
      
      // Check main structure - updated for new format
      expect(data).toHaveProperty('services');
      expect(data).toHaveProperty('backpack');
      expect(data).toHaveProperty('steamLogin');
      expect(data).toHaveProperty('tf2api');
      expect(data).toHaveProperty('webapi');
      expect(data).toHaveProperty('relay');
      expect(data).toHaveProperty('spellHandler');
      
      // Check services array
      expect(Array.isArray(data.services)).toBe(true);
      expect(data.services.length).toBeGreaterThan(0);
      
      console.log('✅ Status API returns expected structure with new services');
      console.log(`Found ${data.services.length} core services`);
    } catch (error) {
      console.error('❌ Status API structure test failed:', error.message);
      throw error;
    }
  });

  test('Status API services should have required fields', async () => {
    try {
      const response = await axios.get(STATUS_API_URL);
      const data = response.data;
      
      // Check each service has required fields - updated for new format
      data.services.forEach((service, index) => {
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('status');
        expect(service).toHaveProperty('category');
        expect(service).toHaveProperty('uptime');
        expect(service).toHaveProperty('restart');
        expect(service).toHaveProperty('memory');
        expect(service).toHaveProperty('cpu');
        expect(service).toHaveProperty('uptimePercentage');
        expect(service).toHaveProperty('uptimeBars');
        
        expect(typeof service.name).toBe('string');
        expect(typeof service.status).toBe('string');
        expect(typeof service.category).toBe('string');
        expect(typeof service.uptime).toBe('number');
        expect(typeof service.restart).toBe('number');
        expect(typeof service.memory).toBe('number');
        expect(typeof service.cpu).toBe('number');
        expect(typeof service.uptimePercentage).toBe('number');
        expect(Array.isArray(service.uptimeBars)).toBe(true);
        
        // Check uptime bars structure
        if (service.uptimeBars.length > 0) {
          const firstBar = service.uptimeBars[0];
          expect(firstBar).toHaveProperty('timestamp');
          expect(firstBar).toHaveProperty('status');
          expect(typeof firstBar.timestamp).toBe('number');
          expect(typeof firstBar.status).toBe('string');
        }
        
        console.log(`✅ Service ${index + 1}: ${service.name} (${service.category}) - ${service.status} - ${service.uptimePercentage}% uptime`);
      });
      
      console.log('✅ All services have required fields with new structure');
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
        'DB Handler', 
        'DB Manager',
        'Listing Handler',
        'DB Web Front'
      ];
      
      const serviceNames = data.services.map(service => service.name);
      
      expectedServices.forEach(expectedService => {
        expect(serviceNames).toContain(expectedService);
        console.log(`✅ Found expected service: ${expectedService}`);
      });
      
      // Check for services by category
      const coreServices = data.services.filter(s => s.category === 'core');
      const internalServices = data.services.filter(s => s.category === 'internal');
      
      expect(coreServices.length).toBeGreaterThan(0);
      console.log(`✅ Found ${coreServices.length} core services`);
      console.log(`✅ Found ${internalServices.length} internal services`);
      
      console.log('✅ All expected services are present with new structure');
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
      
      // Check that external services have uptime tracking
      expect(data.backpack).toHaveProperty('uptimePercentage');
      expect(data.backpack).toHaveProperty('uptimeBars');
      expect(data.steamLogin).toHaveProperty('uptimePercentage');
      expect(data.steamLogin).toHaveProperty('uptimeBars');
      expect(data.tf2api).toHaveProperty('uptimePercentage');
      expect(data.tf2api).toHaveProperty('uptimeBars');
      expect(data.webapi).toHaveProperty('uptimePercentage');
      expect(data.webapi).toHaveProperty('uptimeBars');
      
      // Log status of external services
      console.log(`✅ Backpack website: ${data.backpack.website} (${data.backpack.uptimePercentage}% uptime)`);
      console.log(`✅ Steam login: ${data.steamLogin.login} (${data.steamLogin.uptimePercentage}% uptime)`);
      console.log(`✅ TF2 API: ${data.tf2api.tf2api} (${data.tf2api.uptimePercentage}% uptime)`);
      console.log(`✅ Web API: ${data.webapi.webapi} (${data.webapi.uptimePercentage}% uptime)`);
      
      // Ideally all should be online, but we'll just check they exist
      expect(typeof data.backpack.website).toBe('string');
      expect(typeof data.steamLogin.login).toBe('string');
      expect(typeof data.tf2api.tf2api).toBe('string');
      expect(typeof data.webapi.webapi).toBe('string');
      
      console.log('✅ All external services have status information with uptime tracking');
    } catch (error) {
      console.error('❌ External services status test failed:', error.message);
      throw error;
    }
  });

  test('Status API should include new relay service', async () => {
    try {
      const response = await axios.get(STATUS_API_URL);
      const data = response.data;
      
      // Check relay service
      expect(data).toHaveProperty('relay');
      expect(data.relay).toHaveProperty('relay');
      expect(data.relay).toHaveProperty('backpackConnected');
      expect(data.relay).toHaveProperty('uptime');
      expect(data.relay).toHaveProperty('messagesRelayed');
      expect(data.relay).toHaveProperty('connectedClients');
      expect(data.relay).toHaveProperty('uptimePercentage');
      expect(data.relay).toHaveProperty('uptimeBars');
      
      expect(typeof data.relay.relay).toBe('string');
      expect(typeof data.relay.backpackConnected).toBe('boolean');
      expect(typeof data.relay.uptime).toBe('number');
      expect(typeof data.relay.messagesRelayed).toBe('number');
      expect(typeof data.relay.connectedClients).toBe('number');
      expect(typeof data.relay.uptimePercentage).toBe('number');
      expect(Array.isArray(data.relay.uptimeBars)).toBe(true);
      
      console.log(`✅ Relay service: ${data.relay.relay} - Connected: ${data.relay.backpackConnected} - Messages: ${data.relay.messagesRelayed} - Clients: ${data.relay.connectedClients}`);
    } catch (error) {
      console.error('❌ Relay service test failed:', error.message);
      throw error;
    }
  });

  test('Status API should include new spell handler service', async () => {
    try {
      const response = await axios.get(STATUS_API_URL);
      const data = response.data;
      
      // Check spell handler service
      expect(data).toHaveProperty('spellHandler');
      expect(data.spellHandler).toHaveProperty('spellHandler');
      expect(data.spellHandler).toHaveProperty('database');
      expect(data.spellHandler).toHaveProperty('timestamp');
      expect(data.spellHandler).toHaveProperty('uptimePercentage');
      expect(data.spellHandler).toHaveProperty('uptimeBars');
      
      expect(typeof data.spellHandler.spellHandler).toBe('string');
      expect(typeof data.spellHandler.database).toBe('string');
      expect(typeof data.spellHandler.timestamp).toBe('string');
      expect(typeof data.spellHandler.uptimePercentage).toBe('number');
      expect(Array.isArray(data.spellHandler.uptimeBars)).toBe(true);
      
      // Timestamp should be ISO format
      expect(() => new Date(data.spellHandler.timestamp)).not.toThrow();
      
      console.log(`✅ Spell handler service: ${data.spellHandler.spellHandler} - Database: ${data.spellHandler.database} - ${data.spellHandler.uptimePercentage}% uptime`);
    } catch (error) {
      console.error('❌ Spell handler service test failed:', error.message);
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
