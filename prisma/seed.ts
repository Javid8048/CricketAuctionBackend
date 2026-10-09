import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SEED_TEAMS } from '../src/data/seed-teams';
import { SEED_PLAYERS } from '../src/data/seed-players';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning database ---');
  await prisma.bid.deleteMany();
  await prisma.teamPlayer.deleteMany();
  await prisma.auctionEvent.deleteMany();
  await prisma.auctionPlayer.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();

  console.log('--- Seeding teams (Purse: ₹15,000, Max Squad: 12) ---');
  const createdTeams = [];
  for (const teamData of SEED_TEAMS) {
    const team = await prisma.team.create({
      data: {
        name: teamData.name,
        shortName: teamData.shortName,
        ownerName: teamData.ownerName,
        phone: teamData.phone,
        address: teamData.address,
        primaryColor: teamData.primaryColor,
        secondaryColor: teamData.secondaryColor,
        logoText: teamData.logoText,
        totalPurse: teamData.totalPurse || 15000,
        remainingPurse: teamData.totalPurse || 15000,
        maxSquadSize: teamData.maxSquadSize || 12,
        maxOverseas: teamData.maxOverseas || 4,
      },
    });
    createdTeams.push(team);
    console.log(`Created team: ${team.name} (${team.shortName}) - Owner: ${team.ownerName}, Purse: ₹${team.totalPurse}`);
  }

  console.log('--- Seeding users ---');
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const teamPasswordHash = await bcrypt.hash('team123', 10);

  // 1. Primary Admin account: KhaderMeeran / Admin@123
  await prisma.user.create({
    data: {
      email: 'khadermeeran',
      username: 'KhaderMeeran',
      password: adminPasswordHash,
      name: 'KhaderMeeran',
      role: 'ADMIN',
    },
  });
  // Also create admin@demo.com with same Admin@123 for convenience
  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      username: 'admin',
      password: adminPasswordHash,
      name: 'KhaderMeeran (Admin)',
      role: 'ADMIN',
    },
  });
  console.log('Created Admin user: UserName: KhaderMeeran, Password: Admin@123');

  // 2. Team users (team1@demo.com through team8@demo.com)
  for (let i = 0; i < createdTeams.length; i++) {
    const t = createdTeams[i];
    await prisma.user.create({
      data: {
        email: `team${i + 1}@demo.com`,
        username: `team${i + 1}`,
        password: teamPasswordHash,
        name: `${t.name} Manager`,
        role: 'TEAM',
        teamId: t.id,
      },
    });
    console.log(`Created Team user: team${i + 1}@demo.com for ${t.name}`);
  }

  console.log('--- Seeding 50 players with S.No starting from 1 & Base Price ₹100 ---');
  const createdPlayers = [];
  for (let idx = 0; idx < SEED_PLAYERS.length; idx++) {
    const p = SEED_PLAYERS[idx];
    const sNo = idx + 1;
    const birthYear = 2026 - (p.age || 24);
    const dob = `${birthYear}-05-${String((idx % 28) + 1).padStart(2, '0')}`;
    const places = ['Chennai', 'Madurai', 'Coimbatore', 'Tirunelveli', 'Trichy', 'Salem', 'Bangalore', 'Mumbai'];
    const place = p.isOverseas ? p.country : places[idx % places.length];

    const player = await prisma.player.create({
      data: {
        sNo: sNo,
        name: p.name,
        profileImage: p.profileImage,
        country: p.country,
        isOverseas: p.isOverseas,
        age: p.age,
        dob: dob,
        place: place,
        phone: `+91 9840${String(10000 + idx)}`,
        role: p.role,
        battingStyle: p.battingStyle,
        bowlingStyle: p.bowlingStyle,
        basePrice: 100, // Starts at ₹100
        category: p.category,
        matches: p.matches,
        runs: p.runs,
        battingAvg: p.battingAvg,
        strikeRate: p.strikeRate,
        highestScore: p.highestScore,
        wickets: p.wickets,
        economy: p.economy,
        bowlingAvg: p.bowlingAvg,
        bestBowling: p.bestBowling,
        status: 'UPCOMING',
      },
    });
    createdPlayers.push(player);
  }
  console.log(`Created ${createdPlayers.length} players with S.No 1 to ${createdPlayers.length}.`);

  console.log('--- Creating initial Auction ---');
  const auction = await prisma.auction.create({
    data: {
      name: 'Premier Cricket Tournament Mega Auction 2026',
      status: 'IDLE',
      currentRound: 1,
      defaultTimerSec: 10,
      autoSell: true,
      timerEnabled: true,
      defaultPurse: 15000,
      defaultSquadLimit: 12,
      iconPlayerPrice: 2500,
      defaultBasePrice: 100,
    },
  });

  // Enqueue players into AuctionPlayer
  for (let i = 0; i < createdPlayers.length; i++) {
    await prisma.auctionPlayer.create({
      data: {
        auctionId: auction.id,
        playerId: createdPlayers[i].id,
        status: 'PENDING',
        round: 1,
        orderIndex: i + 1,
        basePrice: 100,
      },
    });
  }

  console.log(`Initialized auction "${auction.name}" with 50 queued players (Base price ₹100, Purse ₹15,000, Squad: 12).`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
