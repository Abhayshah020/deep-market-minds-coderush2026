import {
    PlayerPerformanceState,
} from "./player-performance-engine.types";

export const INITIAL_PLAYER_PERFORMANCE_STATE:
    PlayerPerformanceState = {
    initialBalance: 100_000,

    currentEquity: 100_000,

    peakEquity: 100_000,

    totalPnL: 0,

    realizedPnL: 0,

    unrealizedPnL: 0,

    returnPercent: 0,

    winRate: 0,

    winningTrades: 0,

    losingTrades: 0,

    breakevenTrades: 0,

    totalTrades: 0,

    averageWin: 0,

    averageLoss: 0,

    profitFactor: 0,

    largestWin: 0,

    largestLoss: 0,

    expectancy: 0,

    maxDrawdown: 0,

    currentDrawdown: 0,

    drawdownPercent: 0,

    riskRewardRatio: 0,

    riskManagement: {
        riskLevel: "low",

        averageRiskPerTrade: 0,

        maxRiskPerTrade: 0,

        riskViolations: 0,

        oversizedTrades: 0,

        stopLossUsage: 0,

        positionConcentration: 0,
    },

    positionSizing: {
        averagePositionSize: 0,

        largestPositionSize: 0,

        averageNotional: 0,

        largestNotional: 0,

        sizingConsistency: 100,

        oversizedPositionRate: 0,
    },

    behavior: {
        behavior: "inactive",

        tradesPerHour: 0,

        tradesPerDay: 0,

        consecutiveLosses: 0,

        consecutiveWins: 0,

        revengeTradingScore: 0,

        overtradingScore: 0,

        consistencyScore: 100,

        disciplineScore: 100,
    },

    overallPerformanceScore: 0,

    performanceGrade: "F",

    trades: [],
};