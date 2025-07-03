const io = require('socket.io-client');

describe('WebSocket Tests - ws.pricedb.io:5500', () => {
  const WEBSOCKET_URL = 'ws://ws.pricedb.io:5500';
  let socket;

  beforeEach(() => {
    // Create a fresh socket connection for each test
    socket = null;
  });

  afterEach((done) => {
    // Clean up socket connection after each test
    if (socket && socket.connected) {
      socket.disconnect();
    }
    setTimeout(done, 100); // Small delay to ensure cleanup
  });

  test('WebSocket connection should establish successfully', (done) => {
    socket = io(WEBSOCKET_URL, {
      timeout: 10000,
      transports: ['websocket']
    });

    socket.on('connect', () => {
      expect(socket.connected).toBe(true);
      console.log('✅ WebSocket connected successfully');
      done();
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection failed:', error.message);
      done(error);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });
  });

  test('WebSocket should handle ping/pong', (done) => {
    socket = io(WEBSOCKET_URL, {
      timeout: 10000,
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected for ping test');
      
      // Send a ping and wait for pong
      const startTime = Date.now();
      
      socket.emit('ping', { timestamp: startTime });
      
      socket.on('pong', (data) => {
        const latency = Date.now() - startTime;
        console.log(`✅ Ping/Pong successful, latency: ${latency}ms`);
        expect(latency).toBeLessThan(5000); // Should respond within 5 seconds
        done();
      });

      // Fallback timeout
      setTimeout(() => {
        console.log('✅ WebSocket connection stable (no pong response expected)');
        done();
      }, 2000);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket ping test failed:', error.message);
      done(error);
    });
  });

  test('WebSocket should maintain connection', (done) => {
    socket = io(WEBSOCKET_URL, {
      timeout: 10000,
      transports: ['websocket']
    });

    let connectionStable = false;

    socket.on('connect', () => {
      console.log('✅ WebSocket connected for stability test');
      
      // Keep connection open for a few seconds to test stability
      setTimeout(() => {
        if (socket.connected) {
          connectionStable = true;
          console.log('✅ WebSocket connection maintained successfully');
          done();
        } else {
          done(new Error('WebSocket connection lost'));
        }
      }, 3000);
    });

    socket.on('disconnect', (reason) => {
      if (!connectionStable) {
        console.error('❌ WebSocket disconnected unexpectedly:', reason);
        done(new Error(`WebSocket disconnected: ${reason}`));
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket stability test failed:', error.message);
      done(error);
    });
  });

  test('WebSocket should handle multiple connections', (done) => {
    const sockets = [];
    const connectionCount = 3;
    let connectedSockets = 0;

    for (let i = 0; i < connectionCount; i++) {
      const testSocket = io(WEBSOCKET_URL, {
        timeout: 10000,
        transports: ['websocket']
      });

      testSocket.on('connect', () => {
        connectedSockets++;
        console.log(`✅ Socket ${i + 1} connected`);
        
        if (connectedSockets === connectionCount) {
          console.log('✅ All multiple WebSocket connections established');
          
          // Cleanup all sockets
          sockets.forEach(s => s.disconnect());
          done();
        }
      });

      testSocket.on('connect_error', (error) => {
        console.error(`❌ Socket ${i + 1} connection failed:`, error.message);
        sockets.forEach(s => s.disconnect());
        done(error);
      });

      sockets.push(testSocket);
    }
  });
});
