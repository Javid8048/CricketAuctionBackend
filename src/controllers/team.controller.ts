import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getTeams(req: Request, res: Response) {
  try {
    const teams = await prisma.team.findMany({
      include: {
        squad: {
          include: {
            player: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = teams.map((t) => {
      const overseasCount = t.squad.filter((sp) => sp.player.isOverseas).length;
      const batters = t.squad.filter((sp) => sp.player.role === 'Batter').length;
      const bowlers = t.squad.filter((sp) => sp.player.role === 'Bowler').length;
      const allRounders = t.squad.filter((sp) => sp.player.role === 'All-Rounder').length;
      const wicketkeepers = t.squad.filter((sp) => sp.player.role === 'Wicketkeeper').length;
      const totalSpent = t.totalPurse - t.remainingPurse;

      return {
        ...t,
        squadSize: t.squad.length,
        overseasCount,
        batters,
        bowlers,
        allRounders,
        wicketkeepers,
        totalSpent,
      };
    });

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch teams.' });
  }
}

export async function getTeamById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        squad: {
          include: {
            player: true,
          },
        },
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 30,
          include: {
            player: true,
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    const overseasCount = team.squad.filter((sp) => sp.player.isOverseas).length;
    const batters = team.squad.filter((sp) => sp.player.role === 'Batter').length;
    const bowlers = team.squad.filter((sp) => sp.player.role === 'Bowler').length;
    const allRounders = team.squad.filter((sp) => sp.player.role === 'All-Rounder').length;
    const wicketkeepers = team.squad.filter((sp) => sp.player.role === 'Wicketkeeper').length;
    const totalSpent = team.totalPurse - team.remainingPurse;
    const avgPlayerPrice = team.squad.length > 0 ? totalSpent / team.squad.length : 0;
    const highestPurchase = team.squad.reduce((max, curr) => (curr.price > max ? curr.price : max), 0);

    res.json({
      ...team,
      squadSize: team.squad.length,
      overseasCount,
      batters,
      bowlers,
      allRounders,
      wicketkeepers,
      totalSpent,
      avgPlayerPrice,
      highestPurchase,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch team.' });
  }
}

export async function createTeam(req: Request, res: Response) {
  try {
    const data = req.body;
    const team = await prisma.team.create({
      data: {
        name: data.name,
        shortName: data.shortName,
        primaryColor: data.primaryColor || '#3B82F6',
        secondaryColor: data.secondaryColor || '#1E40AF',
        logoText: data.shortName || data.name.substring(0, 2).toUpperCase(),
        totalPurse: Number(data.totalPurse || 1000000000),
        remainingPurse: Number(data.totalPurse || 1000000000),
        maxSquadSize: Number(data.maxSquadSize || 25),
        maxOverseas: Number(data.maxOverseas || 8),
      },
    });

    res.status(201).json(team);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create team.' });
  }
}

export async function updateTeam(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;

    const team = await prisma.team.update({
      where: { id },
      data: {
        name: data.name,
        shortName: data.shortName,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        logoText: data.logoText,
        totalPurse: data.totalPurse ? Number(data.totalPurse) : undefined,
        remainingPurse: data.remainingPurse ? Number(data.remainingPurse) : undefined,
        maxSquadSize: data.maxSquadSize ? Number(data.maxSquadSize) : undefined,
        maxOverseas: data.maxOverseas ? Number(data.maxOverseas) : undefined,
      },
    });

    res.json(team);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update team.' });
  }
}
