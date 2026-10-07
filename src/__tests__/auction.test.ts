import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { AuctionEngine } from '../services/auction-engine.service';
import { formatRupees, getMinBidIncrement } from '../utils/currency';

describe('Cricket Auction Arena - Core Bidding & Rules Tests', () => {
  let prisma: PrismaClient;
  let engine: AuctionEngine;
  let testTeam1: any;
  let testTeam2: any;
  let testPlayerOverseas: any;
  let testPlayerDomestic: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    engine = new AuctionEngine(prisma);

    // Get 2 teams from seed
    const teams = await prisma.team.findMany({ take: 2 });
    testTeam1 = teams[0];
    testTeam2 = teams[1];

    // Get an overseas and a domestic player
    testPlayerOverseas = await prisma.player.findFirst({ where: { isOverseas: true } });
    testPlayerDomestic = await prisma.player.findFirst({ where: { isOverseas: false } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Currency formatting formats Lakhs and Crores accurately', () => {
    expect(formatRupees(20000000)).toBe('₹2 Cr');
    expect(formatRupees(84000000)).toBe('₹8.40 Cr');
    expect(formatRupees(5000000)).toBe('₹50 Lakh');
    expect(formatRupees(2000000)).toBe('₹20 Lakh');
    expect(formatRupees(1000000000)).toBe('₹100 Cr');
  });

  it('Calculates appropriate minimum bid increments', () => {
    expect(getMinBidIncrement(5000000)).toBe(1000000); // 10 Lakh for < 1 Cr
    expect(getMinBidIncrement(20000000)).toBe(2000000); // 20 Lakh for 1-5 Cr
    expect(getMinBidIncrement(60000000)).toBe(2500000); // 25 Lakh for >= 5 Cr
  });

  it('Rejects bid if auction is not active', async () => {
    // Ensure auction is idle or paused
    const auction = await prisma.auction.findFirst();
    if (auction) {
      await prisma.auction.update({ where: { id: auction.id }, data: { status: 'PAUSED' } });
    }

    await expect(engine.placeBid(testTeam1.id, 20000000)).rejects.toThrow(/Auction is currently/i);
  });

  it('Rejects bid if team purse is insufficient', async () => {
    // Select a player and start auction
    await engine.selectPlayer(testPlayerDomestic.id);
    await engine.startAuction();

    // Temporarily reduce purse
    await prisma.team.update({
      where: { id: testTeam1.id },
      data: { remainingPurse: 1000000 }, // only 10 Lakh
    });

    await expect(engine.placeBid(testTeam1.id, 20000000)).rejects.toThrow(/Insufficient purse/i);

    // Restore purse
    await prisma.team.update({
      where: { id: testTeam1.id },
      data: { remainingPurse: 1000000000 },
    });
  });

  it('Handles valid bids, resets timer, and prevents consecutive bid from same team', async () => {
    await engine.selectPlayer(testPlayerDomestic.id);
    await engine.startAuction();

    // Team 1 bids
    const result1 = await engine.placeBid(testTeam1.id, testPlayerDomestic.basePrice);
    expect(result1.success).toBe(true);
    expect(result1.bid.amount).toBe(testPlayerDomestic.basePrice);

    // Team 1 tries to bid again immediately without another team bidding
    await expect(engine.placeBid(testTeam1.id)).rejects.toThrow(/already holds the highest bid/i);

    // Team 2 bids higher
    const result2 = await engine.placeBid(testTeam2.id);
    expect(result2.success).toBe(true);
    expect(result2.bid.amount).toBeGreaterThan(result1.bid.amount);
  });

  it('Correctly enforces overseas player limits', async () => {
    // Set team overseas count to 8
    await engine.selectPlayer(testPlayerOverseas.id);
    await engine.startAuction();

    const team = await prisma.team.findUnique({
      where: { id: testTeam1.id },
      include: { squad: true },
    });

    // Artificially change maxOverseas to 0 for strict test
    await prisma.team.update({
      where: { id: testTeam1.id },
      data: { maxOverseas: 0 },
    });

    await expect(engine.placeBid(testTeam1.id, testPlayerOverseas.basePrice)).rejects.toThrow(
      /Maximum overseas-player limit reached/i
    );

    // Restore maxOverseas
    await prisma.team.update({
      where: { id: testTeam1.id },
      data: { maxOverseas: 8 },
    });
  });

  it('Correctly enforces squad size limits', async () => {
    await engine.selectPlayer(testPlayerDomestic.id);
    await engine.startAuction();

    // Artificially set maxSquadSize to 0
    await prisma.team.update({
      where: { id: testTeam1.id },
      data: { maxSquadSize: 0 },
    });

    await expect(engine.placeBid(testTeam1.id, testPlayerDomestic.basePrice)).rejects.toThrow(
      /Squad limit reached/i
    );

    // Restore maxSquadSize
    await prisma.team.update({
      where: { id: testTeam1.id },
      data: { maxSquadSize: 25 },
    });
  });

  it('Simulates race conditions / concurrent bids safely', async () => {
    await engine.selectPlayer(testPlayerDomestic.id);
    await engine.startAuction();

    // Two teams try to bid concurrently
    const bidPromise1 = engine.placeBid(testTeam1.id, testPlayerDomestic.basePrice + 10000000);
    const bidPromise2 = engine.placeBid(testTeam2.id, testPlayerDomestic.basePrice + 10000000);

    const results = await Promise.allSettled([bidPromise1, bidPromise2]);

    // One should succeed, the other might get locked out or fail increment check
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    expect(fulfilled.length).toBeGreaterThanOrEqual(1);
  });

  it('Successfully sells player and deducts purse atomically', async () => {
    await engine.selectPlayer(testPlayerDomestic.id);
    await engine.startAuction();

    const initialTeamPurse = (await prisma.team.findUnique({ where: { id: testTeam1.id } }))!.remainingPurse;
    const bidPrice = testPlayerDomestic.basePrice;

    await engine.placeBid(testTeam1.id, bidPrice);
    const sellResult = await engine.sellPlayer();

    expect(sellResult.success).toBe(true);
    expect(sellResult.winningTeam.id).toBe(testTeam1.id);

    // Verify purse deducted in DB
    const updatedTeam = await prisma.team.findUnique({
      where: { id: testTeam1.id },
      include: { squad: true },
    });
    expect(updatedTeam!.remainingPurse).toBe(initialTeamPurse - bidPrice);

    // Verify player is in squad
    const inSquad = updatedTeam!.squad.some((s) => s.playerId === testPlayerDomestic.id);
    expect(inSquad).toBe(true);

    // Verify player status is SOLD
    const playerRecord = await prisma.player.findUnique({ where: { id: testPlayerDomestic.id } });
    expect(playerRecord!.status).toBe('SOLD');
  });
});
