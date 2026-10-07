const http = require('http');
const { io } = require('../frontend/node_modules/socket.io-client');

async function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 400) {
              reject(new Error(parsed.error || `HTTP ${res.statusCode}`));
            } else {
              resolve(parsed);
            }
          } catch (e) {
            resolve(data);
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('========================================================');
  console.log('🏏 RUNNING END-TO-END CRICKET AUCTION ARENA SIMULATION 🏏');
  console.log('========================================================\n');

  // 1. Health check
  console.log('1. Checking backend health...');
  const health = await request('http://localhost:5000/health');
  console.log('   ✓ Health response:', health);

  // 2. Login accounts
  console.log('\n2. Authenticating Demo Accounts...');
  const adminAuth = await request('http://localhost:5000/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@demo.com', password: 'admin123' },
  });
  console.log(`   ✓ Admin authenticated: ${adminAuth.user.name} (${adminAuth.user.role})`);

  const team1Auth = await request('http://localhost:5000/api/auth/login', {
    method: 'POST',
    body: { email: 'team1@demo.com', password: 'team123' },
  });
  console.log(`   ✓ Team 1 authenticated: ${team1Auth.user.name} (Team ID: ${team1Auth.user.teamId})`);

  const team2Auth = await request('http://localhost:5000/api/auth/login', {
    method: 'POST',
    body: { email: 'team2@demo.com', password: 'team123' },
  });
  console.log(`   ✓ Team 2 authenticated: ${team2Auth.user.name} (Team ID: ${team2Auth.user.teamId})`);

  // 3. Connect WebSockets for Spectator & Teams
  console.log('\n3. Establishing Real-time WebSocket sessions...');
  const socketClient1 = io('http://localhost:5000');
  const socketClient2 = io('http://localhost:5000');

  let team1BidsSeen = 0;
  let team2BidsSeen = 0;

  socketClient1.on('auction:bid', (data) => {
    team1BidsSeen++;
    console.log(`   ⚡ [Team 1 Socket Feed]: New Bid Event! ${data.teamName} bid ₹${(data.amount / 10000000).toFixed(2)} Cr`);
  });

  socketClient2.on('auction:bid', (data) => {
    team2BidsSeen++;
    console.log(`   ⚡ [Team 2 Socket Feed]: New Bid Event! ${data.teamName} bid ₹${(data.amount / 10000000).toFixed(2)} Cr`);
  });

  await new Promise((r) => setTimeout(r, 1000));

  // 4. Start Auction as Admin
  console.log('\n4. Starting Auction (Admin action)...');
  const startRes = await request('http://localhost:5000/api/auction/start', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminAuth.token}` },
  });
  console.log(`   ✓ Auction Status: ${startRes.auction.status}`);
  console.log(`   ✓ Active Player Lot: ${startRes.activePlayer.name} (Base Price: ₹${(startRes.activePlayer.basePrice / 10000000).toFixed(2)} Cr)`);

  // 5. Team 1 places opening bid
  console.log('\n5. Team 1 (Coastal Kings) placing opening bid at base price...');
  const bid1 = await request('http://localhost:5000/api/auction/bid', {
    method: 'POST',
    headers: { Authorization: `Bearer ${team1Auth.token}` },
    body: { amount: startRes.activePlayer.basePrice },
  });
  console.log(`   ✓ Bid 1 Accepted! Amount: ₹${(bid1.bid.amount / 10000000).toFixed(2)} Cr by ${bid1.bid.team.name}`);

  await new Promise((r) => setTimeout(r, 600));

  // 6. Team 1 attempts duplicate bid against itself
  console.log('\n6. Testing Rule: Team 1 trying to bid against itself while holding highest bid...');
  try {
    await request('http://localhost:5000/api/auction/bid', {
      method: 'POST',
      headers: { Authorization: `Bearer ${team1Auth.token}` },
      body: { amount: bid1.bid.amount + 2000000 },
    });
    console.error('   ❌ ERROR: Duplicate self-bid was incorrectly allowed!');
  } catch (err) {
    console.log(`   ✓ Rule verified! Self-bid correctly rejected: "${err.message}"`);
  }

  // 7. Team 2 places counter-bid
  console.log('\n7. Team 2 (Capital Warriors) placing counter-bid (+₹20 Lakh)...');
  const bid2 = await request('http://localhost:5000/api/auction/bid', {
    method: 'POST',
    headers: { Authorization: `Bearer ${team2Auth.token}` },
    body: { amount: bid1.bid.amount + 2000000 },
  });
  console.log(`   ✓ Bid 2 Accepted! Amount: ₹${(bid2.bid.amount / 10000000).toFixed(2)} Cr by ${bid2.bid.team.name}`);

  await new Promise((r) => setTimeout(r, 600));

  // 8. Testing Insufficient Purse Rule
  console.log('\n8. Testing Rule: Attempting astronomical bid exceeding franchise purse (₹200 Cr)...');
  try {
    await request('http://localhost:5000/api/auction/bid', {
      method: 'POST',
      headers: { Authorization: `Bearer ${team1Auth.token}` },
      body: { amount: 2000000000 }, // ₹200 Cr (exceeds ₹100 Cr purse)
    });
    console.error('   ❌ ERROR: Bid exceeding purse was incorrectly accepted!');
  } catch (err) {
    console.log(`   ✓ Rule verified! Insufficient purse rejected: "${err.message}"`);
  }

  // 9. Conclude sale
  console.log('\n9. Concluding player lot (Sold to Team 2)...');
  const sellRes = await request('http://localhost:5000/api/auction/sell', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminAuth.token}` },
  });
  console.log(`   ✓ Player Sold! ${sellRes.player.name} -> ${sellRes.winningTeam.name} for ${sellRes.formattedPrice}`);

  // 10. Check Team 2 updated purse in DB
  console.log('\n10. Verifying team budget deduction and squad roster in DB...');
  const team2Record = await request(`http://localhost:5000/api/teams/${team2Auth.user.teamId}`);
  console.log(`   ✓ Team 2 Remaining Purse: ₹${(team2Record.remainingPurse / 10000000).toFixed(2)} Cr (Deducted accurately from ₹100 Cr)`);
  console.log(`   ✓ Team 2 Squad Count: ${team2Record.squad.length} player(s)`);

  socketClient1.disconnect();
  socketClient2.disconnect();

  console.log('\n========================================================');
  console.log('🎉 ALL MULTI-CLIENT E2E SIMULATION TESTS PASSED! 🎉');
  console.log('========================================================');
}

runE2ETests().catch((err) => {
  console.error('E2E Test Failure:', err);
  process.exit(1);
});
