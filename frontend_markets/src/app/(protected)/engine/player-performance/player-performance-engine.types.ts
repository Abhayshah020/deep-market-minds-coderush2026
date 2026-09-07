export type PerformanceRiskLevel =
    | "low"
    | "moderate"
    | "high"
    | "critical";

export type TradingBehavior =
    | "disciplined"
    | "aggressive"
    | "overtrading"
    | "revengeTrading"
    | "inconsistent"
    | "inactive";

export interface PerformanceTrade {
    orderId: string;

    symbol: string;

    side: "buy" | "sell";

    quantity: number;

    entryPrice: number;

    exitPrice: number;

    realizedPnL: number;

    openedAt: number;

    closedAt: number;

    holdingTimeMs: number;

    riskPercent: number;
}

export interface RiskManagementMetrics {
    riskLevel:
        PerformanceRiskLevel;

    averageRiskPerTrade: number;

    maxRiskPerTrade: number;

    riskViolations: number;

    oversizedTrades: number;

    stopLossUsage: number;

    positionConcentration: number;
}

export interface PositionSizingMetrics {
    averagePositionSize: number;

    largestPositionSize: number;

    averageNotional: number;

    largestNotional: number;

    sizingConsistency: number;

    oversizedPositionRate: number;
}

export interface TradingBehaviorMetrics {
    behavior: TradingBehavior;

    tradesPerHour: number;

    tradesPerDay: number;

    consecutiveLosses: number;

    consecutiveWins: number;

    revengeTradingScore: number;

    overtradingScore: number;

    consistencyScore: number;

    disciplineScore: number;
}

export interface PlayerPerformanceState {
    initialBalance: number;

    currentEquity: number;

    peakEquity: number;

    totalPnL: number;

    realizedPnL: number;

    unrealizedPnL: number;

    returnPercent: number;

    winRate: number;

    winningTrades: number;

    losingTrades: number;

    breakevenTrades: number;

    totalTrades: number;

    averageWin: number;

    averageLoss: number;

    profitFactor: number;

    largestWin: number;

    largestLoss: number;

    expectancy: number;

    maxDrawdown: number;

    currentDrawdown: number;

    drawdownPercent: number;

    riskRewardRatio: number;

    riskManagement:
        RiskManagementMetrics;

    positionSizing:
        PositionSizingMetrics;

    behavior:
        TradingBehaviorMetrics;

    overallPerformanceScore: number;

    performanceGrade:
        "A"
        | "B"
        | "C"
        | "D"
        | "F";

    trades:
        PerformanceTrade[];
}

export interface PlayerPerformanceSnapshot {
    timestamp: number;

    state: PlayerPerformanceState;
}