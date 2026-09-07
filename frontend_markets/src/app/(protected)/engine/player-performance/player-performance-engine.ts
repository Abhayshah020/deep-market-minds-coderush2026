import {
    SimulationClockState,
} from "../../clock/simulation-clock.types";

import {
    TradingAccountState,
    TradingOrder,
} from "../trading/trading-engine.types";

import {
    PlayerPerformanceSnapshot,
    PlayerPerformanceState,
    PerformanceTrade,
    PerformanceRiskLevel,
    TradingBehavior,
} from "./player-performance-engine.types";

import {
    INITIAL_PLAYER_PERFORMANCE_STATE,
} from "./initial-player-performance-state";

export class PlayerPerformanceEngine {
    private state:
        PlayerPerformanceState;

    private history:
        Map<
            number,
            PlayerPerformanceSnapshot
        >;

    private currentSimulationTime: number;

    /*
     * Orders already incorporated into
     * performance analysis.
     */
    private processedOrders:
        Set<string>;

    /*
     * Tracks equity history.
     */
    private equityHistory:
        {
            timestamp: number;
            equity: number;
        }[];

    constructor(
        initialTime: number,
        initialBalance = 100_000
    ) {
        this.currentSimulationTime =
            initialTime;

        this.state =
            this.cloneState(
                INITIAL_PLAYER_PERFORMANCE_STATE
            );

        this.state.initialBalance =
            initialBalance;

        this.state.currentEquity =
            initialBalance;

        this.state.peakEquity =
            initialBalance;

        this.history =
            new Map();

        this.processedOrders =
            new Set();

        this.equityHistory = [];

        this.saveSnapshot(
            initialTime
        );
    }

    /**
     * Update performance from the
     * latest TradingEngine state.
     */
    update(
        clock: SimulationClockState,
        tradingState: TradingAccountState
    ): void {
        const targetTime =
            clock.currentTime;

        if (
            targetTime ===
            this.currentSimulationTime
        ) {
            this.recalculate(
                targetTime,
                tradingState
            );

            return;
        }

        if (
            targetTime <
            this.currentSimulationTime
        ) {
            this.processBackward(
                targetTime
            );

            this.currentSimulationTime =
                targetTime;

            return;
        }

        this.recalculate(
            targetTime,
            tradingState
        );

        this.currentSimulationTime =
            targetTime;

        this.saveSnapshot(
            targetTime
        );
    }

    /**
     * Main performance calculation.
     */
    private recalculate(
        timestamp: number,
        tradingState: TradingAccountState
    ): void {
        this.state.realizedPnL =
            tradingState.realizedPnL;

        this.state.unrealizedPnL =
            tradingState.unrealizedPnL;

        this.state.totalPnL =
            tradingState.totalPnL;

        this.state.currentEquity =
            tradingState.equity;

        /*
         * Keep equity curve.
         */
        this.equityHistory.push({
            timestamp,

            equity:
                tradingState.equity,
        });

        this.updatePeakEquity();

        this.updateDrawdown();

        this.processNewOrders(
            tradingState
        );

        this.calculateTradeMetrics(
            timestamp
        );

        this.calculateRiskMetrics(
            tradingState
        );

        this.calculatePositionSizing(
            tradingState
        );

        this.calculateBehavior(
            timestamp,
            tradingState
        );

        this.calculateOverallScore();
    }

    /**
     * Detect newly filled orders.
     *
     * Performance is based primarily
     * on completed trades.
     */
    private processNewOrders(
        tradingState: TradingAccountState
    ): void {
        for (
            const order of
                tradingState.orders
        ) {
            if (
                order.status !==
                "filled"
            ) {
                continue;
            }

            if (
                this.processedOrders.has(
                    order.id
                )
            ) {
                continue;
            }

            this.processedOrders.add(
                order.id
            );

            /*
             * A full trade lifecycle is
             * reconstructed later from the
             * sequence of fills.
             */
        }

        this.rebuildClosedTrades(
            tradingState.orders
        );
    }

    /**
     * Reconstruct closed trades from
     * executed orders.
     *
     * This supports:
     *
     * long:
     * BUY -> SELL
     *
     * short:
     * SELL -> BUY
     */
    private rebuildClosedTrades(
        orders: TradingOrder[]
    ): void {
        const filled =
            orders
                .filter(
                    order =>
                        order.status ===
                        "filled" &&
                        order.filledPrice !==
                            null
                )
                .sort(
                    (a, b) =>
                        (
                            a.filledAt ??
                            a.createdAt
                        ) -
                        (
                            b.filledAt ??
                            b.createdAt
                        )
                );

        const openPositions:
            Record<
                string,
                {
                    side:
                        | "buy"
                        | "sell";

                    quantity: number;

                    entryPrice: number;

                    openedAt: number;

                    orderId: string;
                }[]
            > = {};

        const trades:
            PerformanceTrade[] = [];

        for (
            const order of filled
        ) {
            const symbol =
                order.symbol;

            if (
                !openPositions[
                    symbol
                ]
            ) {
                openPositions[
                    symbol
                ] = [];
            }

            let remaining =
                order.filledQuantity;

            /*
             * Opposite-side fills close
             * existing positions first.
             */
            while (
                remaining > 0 &&
                openPositions[
                    symbol
                ].length > 0 &&
                openPositions[
                    symbol
                ][0].side !==
                    order.side
            ) {
                const position =
                    openPositions[
                        symbol
                    ][0];

                const closingQuantity =
                    Math.min(
                        remaining,
                        position.quantity
                    );

                const entryPrice =
                    position.entryPrice;

                const exitPrice =
                    order.filledPrice!;

                const direction =
                    position.side ===
                    "buy"
                        ? 1
                        : -1;

                const pnl =
                    (
                        exitPrice -
                        entryPrice
                    ) *
                    closingQuantity *
                    direction;

                const closedAt =
                    order.filledAt ??
                    order.createdAt;

                trades.push({
                    orderId:
                        order.id,

                    symbol,

                    side:
                        position.side,

                    quantity:
                        closingQuantity,

                    entryPrice,

                    exitPrice,

                    realizedPnL:
                        pnl,

                    openedAt:
                        position.openedAt,

                    closedAt,

                    holdingTimeMs:
                        Math.max(
                            0,
                            closedAt -
                                position.openedAt
                        ),

                    riskPercent:
                        0,
                });

                position.quantity -=
                    closingQuantity;

                remaining -=
                    closingQuantity;

                if (
                    position.quantity <=
                    0
                ) {
                    openPositions[
                        symbol
                    ].shift();
                }
            }

            /*
             * Anything left after closing
             * becomes a new position.
             */
            if (
                remaining > 0
            ) {
                openPositions[
                    symbol
                ].push({
                    side:
                        order.side,

                    quantity:
                        remaining,

                    entryPrice:
                        order.filledPrice!,

                    openedAt:
                        order.filledAt ??
                        order.createdAt,

                    orderId:
                        order.id,
                });
            }
        }

        this.state.trades =
            trades;
    }

    /**
     * Trade statistics.
     */
    private calculateTradeMetrics(
        _timestamp: number
    ): void {
        const trades =
            this.state.trades;

        const total =
            trades.length;

        this.state.totalTrades =
            total;

        if (
            total === 0
        ) {
            this.state.winRate = 0;

            this.state.winningTrades =
                0;

            this.state.losingTrades =
                0;

            this.state.breakevenTrades =
                0;

            this.state.averageWin = 0;

            this.state.averageLoss = 0;

            this.state.profitFactor = 0;

            this.state.largestWin = 0;

            this.state.largestLoss = 0;

            this.state.expectancy = 0;

            this.state.riskRewardRatio = 0;

            return;
        }

        const wins =
            trades.filter(
                trade =>
                    trade.realizedPnL >
                    0
            );

        const losses =
            trades.filter(
                trade =>
                    trade.realizedPnL <
                    0
            );

        const breakeven =
            trades.filter(
                trade =>
                    trade.realizedPnL ===
                    0
            );

        this.state.winningTrades =
            wins.length;

        this.state.losingTrades =
            losses.length;

        this.state.breakevenTrades =
            breakeven.length;

        this.state.winRate =
            (
                wins.length /
                total
            ) *
            100;

        const grossProfit =
            wins.reduce(
                (
                    total,
                    trade
                ) =>
                    total +
                    trade.realizedPnL,
                0
            );

        const grossLoss =
            Math.abs(
                losses.reduce(
                    (
                        total,
                        trade
                    ) =>
                        total +
                        trade.realizedPnL,
                    0
                )
            );

        this.state.averageWin =
            wins.length > 0
                ? grossProfit /
                    wins.length
                : 0;

        this.state.averageLoss =
            losses.length > 0
                ? grossLoss /
                    losses.length
                : 0;

        this.state.profitFactor =
            grossLoss > 0
                ? grossProfit /
                    grossLoss
                : grossProfit >
                      0
                ? Infinity
                : 0;

        this.state.largestWin =
            wins.length > 0
                ? Math.max(
                    ...wins.map(
                        trade =>
                            trade.realizedPnL
                    )
                )
                : 0;

        this.state.largestLoss =
            losses.length > 0
                ? Math.min(
                    ...losses.map(
                        trade =>
                            trade.realizedPnL
                    )
                )
                : 0;

        this.state.expectancy =
            trades.reduce(
                (
                    total,
                    trade
                ) =>
                    total +
                    trade.realizedPnL,
                0
            ) /
            total;

        this.state.riskRewardRatio =
            this.state.averageLoss >
            0
                ? this.state.averageWin /
                    this.state.averageLoss
                : this.state.averageWin >
                    0
                ? Infinity
                : 0;

        this.state.returnPercent =
            this.state.initialBalance !==
            0
                ? (
                    this.state.totalPnL /
                    this.state.initialBalance
                ) *
                    100
                : 0;
    }

    /**
     * Equity peak.
     */
    private updatePeakEquity(): void {
        this.state.peakEquity =
            Math.max(
                this.state.peakEquity,
                this.state.currentEquity
            );
    }

    /**
     * Drawdown from equity peak.
     */
    private updateDrawdown(): void {
        this.state.currentDrawdown =
            Math.max(
                0,
                this.state.peakEquity -
                    this.state.currentEquity
            );

        this.state.drawdownPercent =
            this.state.peakEquity >
            0
                ? (
                    this.state.currentDrawdown /
                    this.state.peakEquity
                ) *
                    100
                : 0;

        this.state.maxDrawdown =
            Math.max(
                this.state.maxDrawdown,
                this.state.currentDrawdown
            );
    }

    /**
     * Risk management.
     *
     * Current demo thresholds:
     *
     * <= 1%  = low
     * <= 2%  = moderate
     * <= 5%  = high
     * > 5%   = critical
     */
    private calculateRiskMetrics(
        tradingState: TradingAccountState
    ): void {
        const trades =
            this.state.trades;

        if (
            trades.length === 0
        ) {
            return;
        }

        const accountEquity =
            Math.max(
                tradingState.equity,
                1
            );

        const riskValues =
            trades.map(
                trade => {
                    /*
                     * Approximate trade risk
                     * using loss size.
                     */
                    const risk =
                        Math.abs(
                            Math.min(
                                trade.realizedPnL,
                                0
                            )
                        );

                    return (
                        risk /
                        accountEquity
                    ) *
                    100;
                }
            );

        this.state.riskManagement
            .averageRiskPerTrade =
            this.average(
                riskValues
            );

        this.state.riskManagement
            .maxRiskPerTrade =
            Math.max(
                ...riskValues
            );

        this.state.riskManagement
            .riskViolations =
            riskValues.filter(
                risk =>
                    risk > 2
            ).length;

        this.state.riskManagement
            .riskLevel =
            this.getRiskLevel(
                this.state
                    .riskManagement
                    .maxRiskPerTrade
            );

        /*
         * Position concentration.
         */
        const positionValues =
            Object.values(
                tradingState.positions
            )
                .filter(
                    position =>
                        position.quantity !==
                        0
                )
                .map(
                    position =>
                        Math.abs(
                            position.marketValue
                        )
                );

        const totalPositionValue =
            positionValues.reduce(
                (
                    total,
                    value
                ) =>
                    total +
                    value,
                0
            );

        this.state.riskManagement
            .positionConcentration =
            totalPositionValue >
            0
                ? (
                    Math.max(
                        ...positionValues
                    ) /
                    totalPositionValue
                ) *
                    100
                : 0;
    }

    /**
     * Position sizing analysis.
     */
    private calculatePositionSizing(
        tradingState: TradingAccountState
    ): void {
        const trades =
            this.state.trades;

        if (
            trades.length === 0
        ) {
            return;
        }

        const sizes =
            trades.map(
                trade =>
                    Math.abs(
                        trade.quantity
                    )
            );

        const notionals =
            trades.map(
                trade =>
                    Math.abs(
                        trade.quantity *
                        trade.entryPrice
                    )
            );

        this.state.positionSizing
            .averagePositionSize =
            this.average(
                sizes
            );

        this.state.positionSizing
            .largestPositionSize =
            Math.max(
                ...sizes
            );

        this.state.positionSizing
            .averageNotional =
            this.average(
                notionals
            );

        this.state.positionSizing
            .largestNotional =
            Math.max(
                ...notionals
            );

        /*
         * Compare typical trade size
         * against account equity.
         */
        const equity =
            Math.max(
                tradingState.equity,
                1
            );

        const oversized =
            notionals.filter(
                notional =>
                    (
                        notional /
                        equity
                    ) >
                    2
            );

        this.state.positionSizing
            .oversizedPositionRate =
            (
                oversized.length /
                trades.length
            ) *
            100;

        /*
         * Lower variation means more
         * consistent sizing.
         */
        const average =
            this.state
                .positionSizing
                .averagePositionSize;

        if (
            average <= 0
        ) {
            this.state
                .positionSizing
                .sizingConsistency =
                100;

            return;
        }

        const deviation =
            this.standardDeviation(
                sizes
            );

        const coefficient =
            deviation /
            average;

        this.state.positionSizing
            .sizingConsistency =
            this.clamp(
                100 -
                    coefficient *
                        100,
                0,
                100
            );
    }

    /**
     * Trading behavior.
     */
    private calculateBehavior(
        timestamp: number,
        tradingState: TradingAccountState
    ): void {
        const trades =
            this.state.trades;

        if (
            trades.length ===
            0
        ) {
            this.state.behavior = {
                behavior: "inactive",

                tradesPerHour: 0,

                tradesPerDay: 0,

                consecutiveLosses: 0,

                consecutiveWins: 0,

                revengeTradingScore: 0,

                overtradingScore: 0,

                consistencyScore: 100,

                disciplineScore: 100,
            };

            return;
        }

        const firstTradeTime =
            Math.min(
                ...trades.map(
                    trade =>
                        trade.closedAt
                )
            );

        const elapsedMs =
            Math.max(
                1,
                timestamp -
                    firstTradeTime
            );

        const hours =
            elapsedMs /
            (60 * 60 * 1000);

        const days =
            elapsedMs /
            (24 * 60 * 60 * 1000);

        const tradesPerHour =
            trades.length /
            Math.max(
                hours,
                1 / 60
            );

        const tradesPerDay =
            trades.length /
            Math.max(
                days,
                1 / 24
            );

        const consecutiveLosses =
            this.getCurrentStreak(
                trades,
                false
            );

        const consecutiveWins =
            this.getCurrentStreak(
                trades,
                true
            );

        const overtradingScore =
            this.calculateOvertradingScore(
                tradesPerHour,
                tradesPerDay
            );

        const revengeTradingScore =
            this.calculateRevengeTradingScore(
                trades
            );

        const consistencyScore =
            this.calculateConsistencyScore(
                trades
            );

        const disciplineScore =
            this.clamp(
                100 -
                    overtradingScore *
                        0.35 -
                    revengeTradingScore *
                        0.40 +
                    consistencyScore *
                        0.20,
                0,
                100
            );

        let behavior:
            TradingBehavior =
            "disciplined";

        if (
            revengeTradingScore >=
            70
        ) {
            behavior =
                "revengeTrading";
        } else if (
            overtradingScore >=
            70
        ) {
            behavior =
                "overtrading";
        } else if (
            consistencyScore <
            45
        ) {
            behavior =
                "inconsistent";
        } else if (
            disciplineScore <
            55
        ) {
            behavior =
                "aggressive";
        }

        this.state.behavior = {
            behavior,

            tradesPerHour,

            tradesPerDay,

            consecutiveLosses,

            consecutiveWins,

            revengeTradingScore,

            overtradingScore,

            consistencyScore,

            disciplineScore,
        };

        /*
         * Keep the active positions involved
         * in the analysis so the compiler
         * doesn't discard the dependency.
         */
        void tradingState;
    }

    /**
     * Overtrading heuristic.
     */
    private calculateOvertradingScore(
        tradesPerHour: number,
        tradesPerDay: number
    ): number {
        /*
         * Demo thresholds:
         *
         * < 1 trade/hour = healthy
         * 1-3 = elevated
         * 3+ = overtrading
         */
        const hourlyScore =
            this.clamp(
                (
                    tradesPerHour -
                    1
                ) /
                    3 *
                    100,
                0,
                100
            );

        const dailyScore =
            this.clamp(
                (
                    tradesPerDay -
                    10
                ) /
                    20 *
                    100,
                0,
                100
            );

        return this.clamp(
            hourlyScore *
                0.70 +
                dailyScore *
                0.30,
            0,
            100
        );
    }

    /**
     * Revenge trading heuristic.
     *
     * Looks for:
     *
     * loss
     * ↓
     * unusually quick next trade
     * ↓
     * larger position
     */
    private calculateRevengeTradingScore(
        trades: PerformanceTrade[]
    ): number {
        if (
            trades.length <
            2
        ) {
            return 0;
        }

        let signals = 0;

        let opportunities = 0;

        for (
            let i = 1;
            i < trades.length;
            i++
        ) {
            const previous =
                trades[i - 1];

            const current =
                trades[i];

            if (
                previous.realizedPnL >=
                0
            ) {
                continue;
            }

            opportunities++;

            const timeBetween =
                current.openedAt -
                previous.closedAt;

            const previousNotional =
                Math.abs(
                    previous.quantity *
                        previous.entryPrice
                );

            const currentNotional =
                Math.abs(
                    current.quantity *
                        current.entryPrice
                );

            const rapidReentry =
                timeBetween <=
                15 *
                    60 *
                    1000;

            const largerSize =
                currentNotional >
                previousNotional *
                    1.25;

            if (
                rapidReentry &&
                largerSize
            ) {
                signals++;
            }
        }

        if (
            opportunities === 0
        ) {
            return 0;
        }

        return this.clamp(
            (
                signals /
                opportunities
            ) *
                100,
            0,
            100
        );
    }

    /**
     * Consistency is based on variation
     * in trade outcomes and position size.
     */
    private calculateConsistencyScore(
        trades: PerformanceTrade[]
    ): number {
        if (
            trades.length <
            2
        ) {
            return 100;
        }

        const outcomes =
            trades.map(
                trade =>
                    trade.realizedPnL
            );

        const outcomeMean =
            this.average(
                outcomes
            );

        const outcomeDeviation =
            this.standardDeviation(
                outcomes
            );

        const sizing =
            trades.map(
                trade =>
                    Math.abs(
                        trade.quantity *
                            trade.entryPrice
                    )
            );

        const sizingMean =
            this.average(
                sizing
            );

        const sizingDeviation =
            this.standardDeviation(
                sizing
            );

        const outcomeVariation =
            Math.abs(
                outcomeMean
            ) > 0
                ? outcomeDeviation /
                    Math.abs(
                        outcomeMean
                    )
                : 1;

        const sizeVariation =
            sizingMean > 0
                ? sizingDeviation /
                    sizingMean
                : 1;

        return this.clamp(
            100 -
                (
                    outcomeVariation *
                        25 +
                    sizeVariation *
                        50
                ),
            0,
            100
        );
    }

    /**
     * Overall player score.
     */
    private calculateOverallScore(): void {
        /*
         * Profitability.
         *
         * Capped so P&L doesn't completely
         * dominate behavioral factors.
         */
        const profitabilityScore =
            this.clamp(
                50 +
                    this.state
                        .returnPercent *
                        2,
                0,
                100
            );

        const winRateScore =
            this.clamp(
                this.state.winRate,
                0,
                100
            );

        const drawdownScore =
            this.clamp(
                100 -
                    this.state
                        .drawdownPercent *
                        10,
                0,
                100
            );

        const riskScore =
            this.getRiskScore();

        const sizingScore =
            this.clamp(
                this.state
                    .positionSizing
                    .sizingConsistency,
                0,
                100
            );

        const behaviorScore =
            this.state.behavior
                .disciplineScore;

        const consistencyScore =
            this.state.behavior
                .consistencyScore;

        /*
         * Trading performance weighting.
         */
        this.state
            .overallPerformanceScore =
            Math.round(
                profitabilityScore *
                    0.25 +
                    winRateScore *
                    0.15 +
                    drawdownScore *
                    0.15 +
                    riskScore *
                    0.15 +
                    sizingScore *
                    0.10 +
                    behaviorScore *
                    0.10 +
                    consistencyScore *
                    0.10
            );

        this.state
            .performanceGrade =
            this.getGrade(
                this.state
                    .overallPerformanceScore
            );
    }

    private getRiskScore(): number {
        const risk =
            this.state
                .riskManagement
                .riskLevel;

        switch (risk) {
            case "low":
                return 100;

            case "moderate":
                return 80;

            case "high":
                return 50;

            case "critical":
                return 20;
        }
    }

    private getRiskLevel(
        maxRisk: number
    ): PerformanceRiskLevel {
        if (
            maxRisk <= 1
        ) {
            return "low";
        }

        if (
            maxRisk <= 2
        ) {
            return "moderate";
        }

        if (
            maxRisk <= 5
        ) {
            return "high";
        }

        return "critical";
    }

    private getGrade(
        score: number
    ):
        | "A"
        | "B"
        | "C"
        | "D"
        | "F" {
        if (
            score >= 90
        ) {
            return "A";
        }

        if (
            score >= 80
        ) {
            return "B";
        }

        if (
            score >= 70
        ) {
            return "C";
        }

        if (
            score >= 60
        ) {
            return "D";
        }

        return "F";
    }

    private getCurrentStreak(
        trades: PerformanceTrade[],
        winning: boolean
    ): number {
        let streak = 0;

        for (
            let i =
                trades.length - 1;
            i >= 0;
            i--
        ) {
            const isWin =
                trades[i]
                    .realizedPnL >
                0;

            const isLoss =
                trades[i]
                    .realizedPnL <
                0;

            if (
                winning &&
                isWin
            ) {
                streak++;
                continue;
            }

            if (
                !winning &&
                isLoss
            ) {
                streak++;
                continue;
            }

            break;
        }

        return streak;
    }

    private processBackward(
        targetTime: number
    ): void {
        const snapshot =
            this.findSnapshotAtOrBefore(
                targetTime
            );

        if (!snapshot) {
            return;
        }

        this.state =
            this.cloneState(
                snapshot.state
            );

        /*
         * Rebuild order-processing state
         * from the restored trade history.
         */
        this.processedOrders =
            new Set(
                this.state.trades.map(
                    trade =>
                        trade.orderId
                )
            );
    }

    private saveSnapshot(
        timestamp: number
    ): void {
        this.history.set(
            timestamp,
            {
                timestamp,

                state:
                    this.cloneState(
                        this.state
                    ),
            }
        );
    }

    private findSnapshotAtOrBefore(
        timestamp: number
    ):
        | PlayerPerformanceSnapshot
        | null {
        let result:
            | PlayerPerformanceSnapshot
            | null = null;

        for (
            const snapshot of
                this.history.values()
        ) {
            if (
                snapshot.timestamp <=
                timestamp
            ) {
                if (
                    result === null ||
                    snapshot.timestamp >
                        result.timestamp
                ) {
                    result =
                        snapshot;
                }
            }
        }

        return result;
    }

    private average(
        values: number[]
    ): number {
        if (
            values.length === 0
        ) {
            return 0;
        }

        return (
            values.reduce(
                (
                    total,
                    value
                ) =>
                    total + value,
                0
            ) /
            values.length
        );
    }

    private standardDeviation(
        values: number[]
    ): number {
        if (
            values.length < 2
        ) {
            return 0;
        }

        const mean =
            this.average(
                values
            );

        const variance =
            this.average(
                values.map(
                    value =>
                        Math.pow(
                            value -
                                mean,
                            2
                        )
                )
            );

        return Math.sqrt(
            variance
        );
    }

    private clamp(
        value: number,
        min: number,
        max: number
    ): number {
        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );
    }

    private cloneState(
        state: PlayerPerformanceState
    ): PlayerPerformanceState {
        return {
            ...state,

            riskManagement: {
                ...state.riskManagement,
            },

            positionSizing: {
                ...state.positionSizing,
            },

            behavior: {
                ...state.behavior,
            },

            trades:
                state.trades.map(
                    trade => ({
                        ...trade,
                    })
                ),
        };
    }

    getState():
        PlayerPerformanceState {
        return this.cloneState(
            this.state
        );
    }

    getHistory():
        PlayerPerformanceSnapshot[] {
        return Array.from(
            this.history.values()
        ).sort(
            (a, b) =>
                a.timestamp -
                b.timestamp
        );
    }
}