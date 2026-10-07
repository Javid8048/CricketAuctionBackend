import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getPlayers(req: Request, res: Response) {
  try {
    const { role, country, category, status, search } = req.query;

    const where: any = {};

    if (role && role !== 'ALL') {
      where.role = String(role);
    }
    if (country && country !== 'ALL') {
      where.country = String(country);
    }
    if (category && category !== 'ALL') {
      where.category = String(category);
    }
    if (status && status !== 'ALL') {
      where.status = String(status);
    }
    if (search) {
      where.name = { contains: String(search) };
    }

    const players = await prisma.player.findMany({
      where,
      orderBy: [{ status: 'asc' }, { basePrice: 'desc' }, { name: 'asc' }],
      include: {
        teamPlayer: {
          include: {
            team: true,
          },
        },
      },
    });

    res.json(players);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch players.' });
  }
}

export async function getPlayerById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        teamPlayer: {
          include: {
            team: true,
          },
        },
        bids: {
          orderBy: { createdAt: 'desc' },
          include: {
            team: true,
          },
        },
        auctionPlayers: {
          orderBy: { createdAt: 'desc' },
          include: {
            winningTeam: true,
          },
        },
      },
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found.' });
    }

    res.json(player);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch player.' });
  }
}

export async function createPlayer(req: Request, res: Response) {
  try {
    const data = req.body;
    const player = await prisma.player.create({
      data: {
        name: data.name,
        profileImage: data.profileImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        country: data.country,
        isOverseas: data.country !== 'India',
        age: Number(data.age),
        role: data.role,
        battingStyle: data.battingStyle,
        bowlingStyle: data.bowlingStyle,
        basePrice: Number(data.basePrice),
        category: data.category,
        matches: Number(data.matches || 0),
        runs: Number(data.runs || 0),
        battingAvg: Number(data.battingAvg || 0),
        strikeRate: Number(data.strikeRate || 0),
        highestScore: Number(data.highestScore || 0),
        wickets: Number(data.wickets || 0),
        economy: Number(data.economy || 0),
        bowlingAvg: Number(data.bowlingAvg || 0),
        bestBowling: data.bestBowling || '0/0',
        status: 'UPCOMING',
      },
    });

    // Also add to the current auction if one exists
    const auction = await prisma.auction.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (auction) {
      const count = await prisma.auctionPlayer.count({ where: { auctionId: auction.id } });
      await prisma.auctionPlayer.create({
        data: {
          auctionId: auction.id,
          playerId: player.id,
          status: 'PENDING',
          orderIndex: count + 1,
          basePrice: player.basePrice,
        },
      });
    }

    res.status(201).json(player);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create player.' });
  }
}

export async function updatePlayer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;

    const player = await prisma.player.update({
      where: { id },
      data: {
        ...data,
        isOverseas: data.country ? data.country !== 'India' : undefined,
      },
    });

    res.json(player);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update player.' });
  }
}

export async function deletePlayer(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.player.delete({
      where: { id },
    });

    res.json({ message: 'Player deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete player.' });
  }
}
