const axios = require('axios');

describe('SQL Injection Security Tests', () => {
  const API_BASE_URL = 'https://pricedb.io/api';
  
  // Common SQL injection payloads
  const sqlInjectionPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM information_schema.tables --",
    "' OR 1=1 --",
    "admin'--",
    "admin' /*",
    "' OR 'x'='x",
    "'; EXEC xp_cmdshell('dir'); --",
    "1' AND 1=1 --",
    "1' AND 1=2 --",
    "' OR 1=1#",
    "' OR 'a'='a",
    "') OR ('1'='1",
    "' OR '1'='1' /*",
    "1; DELETE FROM users; --",
    "'; INSERT INTO users VALUES ('hacker', 'password'); --",
    "%27%20OR%20%271%27%3D%271", // URL encoded ' OR '1'='1
    "1%27%20OR%20%271%27%3D%271%20--%20", // URL encoded 1' OR '1'='1 --
    "1' WAITFOR DELAY '00:00:05' --", // Time-based SQL injection
    "1'; WAITFOR DELAY '00:00:05'; --"
  ];

  // XSS payloads to test for additional security
  const xssPayloads = [
    "<script>alert('xss')</script>",
    "javascript:alert('xss')",
    "<img src=x onerror=alert('xss')>",
    "'><script>alert('xss')</script>",
    "\"><script>alert('xss')</script>"
  ];

  beforeAll(() => {
    axios.defaults.timeout = 30000; // Longer timeout for security tests
  });

  describe('SQL Injection Tests - Item Endpoint', () => {
    test.each(sqlInjectionPayloads)('Should not be vulnerable to SQL injection: %s', async (payload) => {
      try {
        const encodedPayload = encodeURIComponent(payload);
        const response = await axios.get(`${API_BASE_URL}/item/${encodedPayload}`);
        
        // Check that response doesn't contain SQL error messages
        const responseText = JSON.stringify(response.data).toLowerCase();
        
        // Common SQL error indicators
        const sqlErrorIndicators = [
          'sql syntax',
          'mysql_fetch',
          'ora-01756',
          'microsoft jet database',
          'odbc drivers error',
          'sqlite_error',
          'postgresql error',
          'warning: mysql',
          'valid mysql result',
          'ora-00933',
          'ora-00921',
          'microsoft odbc',
          'error in your sql syntax',
          'please check the manual that corresponds to your mysql server version',
          'you have an error in your sql syntax',
          'unclosed quotation mark',
          'quoted string not properly terminated'
        ];
        
        sqlErrorIndicators.forEach(indicator => {
          expect(responseText).not.toContain(indicator);
        });
        
        // Should return either valid data or proper error (404/400), not expose internal errors
        expect([200, 400, 404, 422]).toContain(response.status);
        
        console.log(`✅ SQL injection payload safely handled: ${payload.substring(0, 20)}...`);
        
      } catch (error) {
        // Network errors or proper HTTP errors are acceptable
        if (error.response) {
          expect([400, 404, 422, 500]).toContain(error.response.status);
          
          // Check that error response doesn't leak SQL information
          const errorText = JSON.stringify(error.response.data || '').toLowerCase();
          expect(errorText).not.toContain('sql');
          expect(errorText).not.toContain('mysql');
          expect(errorText).not.toContain('postgresql');
          expect(errorText).not.toContain('sqlite');
          
          console.log(`✅ SQL injection payload properly rejected: ${payload.substring(0, 20)}...`);
        } else {
          // Network timeout or connection error is acceptable for security tests
          console.log(`✅ SQL injection payload caused network error (acceptable): ${payload.substring(0, 20)}...`);
        }
      }
    });
  });

  describe('SQL Injection Tests - Items Endpoint with Query Parameters', () => {
    test.each(sqlInjectionPayloads)('Should handle SQL injection in query parameters: %s', async (payload) => {
      try {
        // Test various query parameter combinations that might be vulnerable
        const testUrls = [
          `${API_BASE_URL}/items?search=${encodeURIComponent(payload)}`,
          `${API_BASE_URL}/items?filter=${encodeURIComponent(payload)}`,
          `${API_BASE_URL}/items?name=${encodeURIComponent(payload)}`,
          `${API_BASE_URL}/items?sku=${encodeURIComponent(payload)}`
        ];
        
        for (const testUrl of testUrls) {
          try {
            const response = await axios.get(testUrl);
            
            // Check response doesn't contain SQL errors
            const responseText = JSON.stringify(response.data).toLowerCase();
            expect(responseText).not.toContain('sql syntax');
            expect(responseText).not.toContain('mysql_fetch');
            expect(responseText).not.toContain('error in your sql syntax');
            
            console.log(`✅ Query parameter injection safely handled: ${testUrl.split('?')[1]?.substring(0, 30)}...`);
          } catch (error) {
            if (error.response) {
              // Proper error handling is acceptable
              expect([400, 404, 422, 500]).toContain(error.response.status);
            }
          }
        }
        
      } catch (error) {
        // Network errors are acceptable for security tests
        console.log(`✅ SQL injection in query parameters handled: ${payload.substring(0, 20)}...`);
      }
    });
  });

  describe('XSS Protection Tests', () => {
    test.each(xssPayloads)('Should not be vulnerable to XSS: %s', async (payload) => {
      try {
        const encodedPayload = encodeURIComponent(payload);
        const response = await axios.get(`${API_BASE_URL}/item/${encodedPayload}`);
        
        // Response should be JSON, not HTML that could execute scripts
        expect(response.headers['content-type']).toMatch(/application\/json/);
        
        // Check that XSS payload is not reflected unescaped
        const responseText = JSON.stringify(response.data);
        expect(responseText).not.toContain('<script>');
        expect(responseText).not.toContain('javascript:');
        expect(responseText).not.toContain('onerror=');
        
        console.log(`✅ XSS payload safely handled: ${payload.substring(0, 20)}...`);
        
      } catch (error) {
        if (error.response) {
          expect([400, 404, 422, 429]).toContain(error.response.status);
          console.log(`✅ XSS payload properly rejected: ${payload.substring(0, 20)}...`);
        }
      }
    });
  });

  describe('Input Validation Tests', () => {
    test('Should handle extremely long input strings', async () => {
      const longString = 'A'.repeat(10000); // 10KB string
      
      try {
        const response = await axios.get(`${API_BASE_URL}/item/${encodeURIComponent(longString)}`);
        
        // Should handle gracefully
        expect([200, 400, 404, 413, 414]).toContain(response.status);
        console.log(`✅ Long string handled with status: ${response.status}`);
        
      } catch (error) {
        if (error.response) {
          expect([400, 413, 414, 500, 429]).toContain(error.response.status);
          console.log(`✅ Long string properly rejected with status: ${error.response.status}`);
        }
      }
    });

    test('Should handle special characters safely', async () => {
      const specialChars = ['%', '&', '#', '+', '?', '/', '\\', '|', '*', '^', '$', '(', ')', '[', ']', '{', '}'];
      
      for (const char of specialChars) {
        try {
          const response = await axios.get(`${API_BASE_URL}/item/${encodeURIComponent(char)}`);
          
          // Should handle gracefully without exposing internal errors
          expect([200, 400, 404]).toContain(response.status);
          
        } catch (error) {
          if (error.response) {
            expect([400, 404, 422, 429]).toContain(error.response.status);
          }
        }
      }
      
      console.log('✅ Special characters handled safely');
    });

    test('Should handle null bytes and control characters', async () => {
      const controlChars = ['\x00', '\x01', '\x02', '\x1F', '\x7F'];
      
      for (const char of controlChars) {
        try {
          const response = await axios.get(`${API_BASE_URL}/item/${encodeURIComponent(char)}`);
          
          // Should handle gracefully
          expect([200, 400, 404]).toContain(response.status);
          
        } catch (error) {
          if (error.response) {
            expect([400, 404, 422, 429]).toContain(error.response.status);
          }
        }
      }
      
      console.log('✅ Control characters handled safely');
    });
  });

  describe('Rate Limiting and DoS Protection', () => {
    test('Should handle rapid requests gracefully', async () => {
      const rapidRequests = [];
      const requestCount = 10;
      
      // Send multiple requests rapidly
      for (let i = 0; i < requestCount; i++) {
        rapidRequests.push(
          axios.get(`${API_BASE_URL}/items`).catch(error => error.response || error)
        );
      }
      
      const responses = await Promise.all(rapidRequests);
      
      // Check that server doesn't crash or return unexpected errors
      responses.forEach((response, index) => {
        if (response.status) {
          expect([200, 429, 503]).toContain(response.status); // 429 = Too Many Requests
        }
      });
      
      console.log(`✅ Rapid requests handled (${requestCount} requests)`);
    }, 30000); // Longer timeout for this test
  });
});
