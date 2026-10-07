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

  console.log('--- Seeding teams ---');
  const createdTeams = [];
  for (const teamData of SEED_TEAMS) {
    const team = await prisma.team.create({
      data: {
        name: teamData.name,
        shortName: teamData.shortName,
        primaryColor: teamData.primaryColor,
        secondaryColor: teamData.secondaryColor,
        logoText: teamData.logoText,
        totalPurse: teamData.totalPurse,
        remainingPurse: teamData.totalPurse,
        maxSquadSize: teamData.maxSquadSize,
        maxOverseas: teamData.maxOverseas,
      },
    });
    createdTeams.push(team);
    console.log(`Created team: ${team.name} (${team.shortName})`);
  }

  console.log('--- Seeding users ---');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const teamPasswordHash = await bcrypt.hash('team123', 10);

  // Admin account
  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: adminPasswordHash,
      name: 'Auction Commissioner',
      role: 'ADMIN',
    },
  });
  console.log('Created Admin user: admin@demo.com (password: admin123)');

  // Team users (team1@demo.com through team8@demo.com)
  for (let i = 0; i < createdTeams.length; i++) {
    const t = createdTeams[i];
    await prisma.user.create({
      data: {
        email: `team${i + 1}@demo.com`,
        password: teamPasswordHash,
        name: `${t.name} Manager`,
        role: 'TEAM',
        teamId: t.id,
      },
    });
    console.log(`Created Team user: team${i + 1}@demo.com for ${t.name} (password: team123)`);
  }

  console.log('--- Seeding 50 players ---');
  const createdPlayers = [];
  for (const p of SEED_PLAYERS) {
    const player = await prisma.player.create({
      data: {
        name: p.name,
        profileImage: p.profileImage,
        country: p.country,
        isOverseas: p.isOverseas,
        age: p.age,
        role: p.role,
        battingStyle: p.battingStyle,
        bowlingStyle: p.bowlingStyle,
        basePrice: p.basePrice,
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
  console.log(`Created ${createdPlayers.length} players.`);

  console.log('--- Creating initial Auction ---');
  const auction = await prisma.auction.create({
    data: {
      name: 'Premier Cricket Mega Auction 2026',
      status: 'IDLE',
      currentRound: 1,
      defaultTimerSec: 10,
    },
  });

  // Enqueue all players into AuctionPlayer
  for (let idx = 0; idx < createdPlayers.length; idx++) {
    const p = createdPlayers[idx];
    await prisma.auctionPlayer.create({
      data: {
        auctionId: auction.id,
        playerId: p.id,
        status: 'PENDING',
        round: 1,
        orderIndex: idx + 1,
        basePrice: p.basePrice,
      },
    });
  }

  console.log(`Initialized auction "${auction.name}" with ${createdPlayers.length} queued players.`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
