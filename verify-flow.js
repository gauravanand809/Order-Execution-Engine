const WebSocket = require('ws');
const http = require('http');

const TOTAL_ORDERS = 5;
const COMPLETED_ORDERS = new Set();

function submitOrder(index) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      tokenIn: 'SOL',
      tokenOut: 'USDC',
      amount: index + 1
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/orders/execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Failed to submit order: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Connecting to WebSocket...');
  const ws = new WebSocket('ws://localhost:3000/api/orders/status');

  ws.on('open', async () => {
    console.log('WebSocket connected.');

    console.log(`Submitting ${TOTAL_ORDERS} orders simultaneously...`);
    
    try {
      const promises = [];
      for (let i = 0; i < TOTAL_ORDERS; i++) {
        promises.push(submitOrder(i));
      }

      const results = await Promise.all(promises);
      
      results.forEach((res, index) => {
        const orderId = res.orderId;
        console.log(`Order ${index + 1} submitted. ID: ${orderId}`);
        
        // Subscribe to updates
        ws.send(JSON.stringify({ orderId }));
      });

    } catch (err) {
      console.error('Error submitting orders:', err);
      process.exit(1);
    }
  });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      // We might not know which order this message is for if the message doesn't contain orderId.
      // Let's check the message structure from previous analysis.
      // The worker publishes: { status: '...', ... }
      // It does NOT seem to include orderId in the message body in worker.ts!
      // Wait, worker.ts:
      // await pub.publish(channel, JSON.stringify({ status: 'pending' }));
      // The channel is specific to the order, but the message itself doesn't have the ID.
      // But since we are using a SINGLE WebSocket connection for ALL orders (in this script), 
      // receiving messages without order ID will be confusing.
      // Ah, in app.js, it creates a NEW WebSocket for EACH order card.
      // "const ws = new WebSocket(wsUrl);" inside "subscribeToOrder".
      // My script tries to use ONE connection for all.
      // If the server implementation allows multiple subscriptions on one socket?
      // Let's check `src/routes/orders.ts`.
      
      // "connection.socket.on('message', (message: string) => { ... const sub = fastify.redis.duplicate(); sub.subscribe(channel) ... sub.on('message', ... connection.socket.send(msg)) })"
      
      // Yes, it creates a NEW redis subscriber for EACH message sent to the socket.
      // And it forwards the message to the SAME socket.
      // So if I subscribe to multiple orders on the same socket, I will get mixed messages without IDs.
      // This is a design flaw in the backend (or intended for one-socket-per-order).
      
      // To properly verify, I should verify one by one OR update the script to open multiple sockets OR just accept I can't distinguish them easily in logs but I can see the flow.
      
      // I will update this script to open a new socket for each order to be clean, 
      // OR just print the message and see the statuses flowing.
      // The user wants to see "Submit 3-5 orders simultaneously".
      // I'll assume opening 5 sockets is fine.
      
      console.log('Received update:', msg);
      
      if (msg.status === 'confirmed' || msg.status === 'failed') {
          // Ideally mark which order finished, but I can't verify which one it is without ID.
          // I'll just count completion.
          // Hack: I'll assume if I get 5 confirmed/failed messages, I'm done.
      }
    } catch (e) {
      console.log('Received raw:', data.toString());
    }
  });
}

// Since the single-socket approach is messy for logging specific orders, 
// let's rewrite the main function to use one socket per order.

async function runOrder(index) {
    const ws = new WebSocket('ws://localhost:3000/api/orders/status');
    
    await new Promise(resolve => ws.on('open', resolve));
    
    const { orderId } = await submitOrder(index);
    console.log(`[Order ${index+1}] Submitted: ${orderId}`);
    
    ws.send(JSON.stringify({ orderId }));
    
    ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        console.log(`[Order ${index+1} ${orderId}] Status: ${msg.status} ${msg.route ? '(Routing: '+msg.route.dex+')' : ''} ${msg.txHash ? '(Tx: '+msg.txHash+')' : ''}`);
        
        if (msg.status === 'confirmed' || msg.status === 'failed') {
            ws.close();
            COMPLETED_ORDERS.add(orderId);
            if (COMPLETED_ORDERS.size === TOTAL_ORDERS) {
                console.log('All orders processed.');
                process.exit(0);
            }
        }
    });
}

async function runParallel() {
    console.log(`Starting ${TOTAL_ORDERS} orders in parallel...`);
    const promises = [];
    for(let i=0; i<TOTAL_ORDERS; i++) {
        promises.push(runOrder(i));
    }
    await Promise.all(promises);
}

runParallel().catch(err => console.error(err));
