import {
    SimulationClockState,
} from "../../clock/simulation-clock.types";

import {
    TradingAccountState,
    TradingAssetType,
    TradingExecutionResult,
    TradingInput,
    TradingOrder,
    TradingOrderType,
    TradingPosition,
    TradingQuote,
    TradingSide,
    TradingSnapshot,
} from "./trading-engine.types";

const CURRENCY_PAIRS = [
    "EUR/USD",
    "GBP/USD",
    "USD/JPY",
    "USD/CHF",
    "AUD/USD",
    "USD/CAD",
    "NZD/USD",
    "USD/CNY",
    "USD/INR",
    "USD/NPR",
] as const;

const MARKET_INDICES = [
    "SP500",
    "NASDAQ",
    "DOW",
    "FTSE100",
    "DAX",
    "CAC40",
    "NIKKEI225",
    "HANGSENG",
    "NIFTY50",
    "ASX200",
] as const;

const NEPAL_STOCKS = [
    "NABIL",
    "NLIC",
    "SHIVM",
    "F1",
] as const;

interface SpreadConfig {
    spreadBps: number;

    slippageBps: number;
}

const SPREAD_CONFIG:
    Record<
        TradingAssetType,
        SpreadConfig
    > = {
    currency: {
        spreadBps: 1.5,
        slippageBps: 0.8,
    },

    index: {
        spreadBps: 3,
        slippageBps: 1.5,
    },

    stock: {
        spreadBps: 5,
        slippageBps: 2.5,
    },

    nepalIndex: {
        spreadBps: 8,
        slippageBps: 4,
    },

    nepalStock: {
        spreadBps: 10,
        slippageBps: 5,
    },
};

export class TradingEngine {
    private state:
        TradingAccountState;

    private history:
        Map<number, TradingSnapshot>;

    private currentSimulationTime: number;

    private orderSequence = 0;

    constructor(
        initialTime: number,
        initialBalance = 100_000
    ) {
        this.currentSimulationTime =
            initialTime;

        this.state =
            this.createInitialState(
                initialBalance
            );

        this.history =
            new Map();

        this.saveSnapshot(
            initialTime
        );
    }

    /**
     * Update quotes, pending orders,
     * positions and P&L.
     */
    // update(
    //     clock: SimulationClockState,
    //     input: TradingInput
    // ): void {
    //     const targetTime =
    //         clock.currentTime;

    //     if (
    //         targetTime ===
    //         this.currentSimulationTime
    //     ) {
    //         return;
    //     }

    //     if (
    //         targetTime <
    //         this.currentSimulationTime
    //     ) {
    //         this.processBackward(
    //             targetTime
    //         );

    //         this.currentSimulationTime =
    //             targetTime;

    //         return;
    //     }

    //     this.processForward(
    //         targetTime,
    //         input
    //     );

    //     this.currentSimulationTime =
    //         targetTime;
    // }

    update(
        clock: SimulationClockState,
        input: TradingInput
    ): void {
        const targetTime =
            clock.currentTime;

        /*
         * The trading engine starts with an
         * empty quote book. Build the initial
         * quotes even when the simulation time
         * has not moved yet.
         */
        if (
            Object.keys(
                this.state.quotes
            ).length === 0
        ) {
            this.updateQuotes(
                targetTime,
                input
            );

            this.markPositionsToMarket();

            this.updateAccountMetrics();

            this.currentSimulationTime =
                targetTime;

            this.saveSnapshot(
                targetTime
            );

            return;
        }

        if (
            targetTime ===
            this.currentSimulationTime
        ) {
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

        this.processForward(
            targetTime,
            input
        );

        this.currentSimulationTime =
            targetTime;
    }

    /**
     * Main forward update.
     */
    private processForward(
        targetTime: number,
        input: TradingInput
    ): void {
        /*
         * Build the latest market quotes.
         */
        this.updateQuotes(
            targetTime,
            input
        );

        /*
         * Execute limit and stop orders.
         */
        this.processPendingOrders(
            targetTime
        );

        /*
         * Mark positions to market.
         */
        this.markPositionsToMarket();

        /*
         * Calculate account equity.
         */
        this.updateAccountMetrics();

        this.saveSnapshot(
            targetTime
        );
    }

    /**
     * Build bid/ask quotes.
     */
    private updateQuotes(
        timestamp: number,
        input: TradingInput
    ): void {
        /*
         * --------------------------------
         * CURRENCIES
         * --------------------------------
         */
        for (
            const pair of CURRENCY_PAIRS
        ) {
            const asset =
                input.pricing
                    .currencies[
                pair
                ];

            if (!asset) {
                continue;
            }

            this.setQuote(
                pair,
                "currency",
                asset.price,
                timestamp
            );
        }

        /*
         * --------------------------------
         * INTERNATIONAL INDICES
         * --------------------------------
         */
        for (
            const symbol of MARKET_INDICES
        ) {
            const asset =
                input.markets
                    .indices[
                symbol
                ];

            if (!asset) {
                continue;
            }

            this.setQuote(
                symbol,
                "index",
                asset.value,
                timestamp
            );
        }

        /*
         * --------------------------------
         * INTERNATIONAL COMPANIES
         * --------------------------------
         */
        for (
            const company of
            input.markets.companies
        ) {
            this.setQuote(
                company.id,
                "stock",
                company.value,
                timestamp
            );
        }

        /*
         * --------------------------------
         * NEPSE
         * --------------------------------
         */
        this.setQuote(
            "NEPSE",
            "nepalIndex",
            input.nepal
                .nepseIndex,
            timestamp
        );

        /*
         * --------------------------------
         * NEPAL STOCKS
         * --------------------------------
         */
        for (
            const companyId of
            NEPAL_STOCKS
        ) {
            const company =
                input.nepal
                    .companies
                    .find(
                        item =>
                            item.id ===
                            companyId
                    );

            if (!company) {
                continue;
            }

            this.setQuote(
                company.id,
                "nepalStock",
                company.value,
                timestamp
            );
        }
    }

    /**
     * Create bid/ask quote.
     */
    private setQuote(
        symbol: string,
        assetType:
            TradingAssetType,
        mid: number,
        timestamp: number
    ): void {
        if (
            !Number.isFinite(mid) ||
            mid <= 0
        ) {
            return;
        }

        const config =
            SPREAD_CONFIG[
            assetType
            ];

        /*
         * Tiny deterministic spread noise.
         *
         * This stops every asset from
         * having exactly the same spread
         * forever.
         */
        const noise =
            this.seededRandom(
                timestamp,
                symbol.length
            );

        const adjustedSpreadBps =
            config.spreadBps *
            (
                0.85 +
                noise * 0.30
            );

        const spread =
            mid *
            adjustedSpreadBps /
            10_000;

        this.state.quotes[
            symbol
        ] = {
            symbol,

            assetType,

            timestamp,

            mid,

            bid:
                mid -
                spread / 2,

            ask:
                mid +
                spread / 2,

            spread,

            spreadBps:
                adjustedSpreadBps,
        };
    }

    /**
     * Market order.
     */
    placeMarketOrder(
        symbol: string,
        side: TradingSide,
        quantity: number
    ): TradingExecutionResult {
        if (
            quantity <= 0 ||
            !Number.isFinite(
                quantity
            )
        ) {
            return {
                success: false,
                order: null,
                message:
                    "Invalid quantity.",
            };
        }

        const quote =
            this.state.quotes[
            symbol
            ];

        if (!quote) {
            return {
                success: false,
                order: null,
                message:
                    "No market quote available.",
            };
        }

        const order =
            this.createOrder(
                symbol,
                quote.assetType,
                side,
                "market",
                quantity
            );

        const fillPrice =
            this.getMarketExecutionPrice(
                quote,
                side,
                quantity
            );

        this.executeOrder(
            order,
            fillPrice,
            this.currentSimulationTime
        );

        return {
            success: true,
            order: {
                ...order,
            },
            message:
                `${side.toUpperCase()} market order filled.`,
        };
    }

    /**
     * Limit order.
     *
     * Buy:
     *     executes when ASK <= limit
     *
     * Sell:
     *     executes when BID >= limit
     */
    placeLimitOrder(
        symbol: string,
        side: TradingSide,
        quantity: number,
        limitPrice: number
    ): TradingExecutionResult {
        if (
            quantity <= 0 ||
            !Number.isFinite(
                quantity
            )
        ) {
            return {
                success: false,
                order: null,
                message:
                    "Invalid quantity.",
            };
        }

        if (
            limitPrice <= 0 ||
            !Number.isFinite(
                limitPrice
            )
        ) {
            return {
                success: false,
                order: null,
                message:
                    "Invalid limit price.",
            };
        }

        const quote =
            this.state.quotes[
            symbol
            ];

        if (!quote) {
            return {
                success: false,
                order: null,
                message:
                    "No market quote available.",
            };
        }

        const order =
            this.createOrder(
                symbol,
                quote.assetType,
                side,
                "limit",
                quantity,
                limitPrice
            );

        if (
            this.isLimitTriggered(
                quote,
                side,
                limitPrice
            )
        ) {
            /*
             * Limit orders receive the
             * available market price, capped
             * at the user's limit.
             */
            const marketPrice =
                side === "buy"
                    ? quote.ask
                    : quote.bid;

            const fillPrice =
                side === "buy"
                    ? Math.min(
                        marketPrice,
                        limitPrice
                    )
                    : Math.max(
                        marketPrice,
                        limitPrice
                    );

            this.executeOrder(
                order,
                fillPrice,
                this.currentSimulationTime
            );
        } else {
            this.state.orders.push(
                order
            );
        }

        return {
            success: true,
            order: {
                ...order,
            },
            message:
                order.status ===
                    "filled"
                    ? "Limit order filled."
                    : "Limit order placed.",
        };
    }

    /**
     * Stop order.
     *
     * Once triggered, it becomes
     * a market order.
     */
    placeStopOrder(
        symbol: string,
        side: TradingSide,
        quantity: number,
        stopPrice: number
    ): TradingExecutionResult {
        if (
            quantity <= 0 ||
            !Number.isFinite(
                quantity
            )
        ) {
            return {
                success: false,
                order: null,
                message:
                    "Invalid quantity.",
            };
        }

        if (
            stopPrice <= 0 ||
            !Number.isFinite(
                stopPrice
            )
        ) {
            return {
                success: false,
                order: null,
                message:
                    "Invalid stop price.",
            };
        }

        const quote =
            this.state.quotes[
            symbol
            ];

        if (!quote) {
            return {
                success: false,
                order: null,
                message:
                    "No market quote available.",
            };
        }

        const order =
            this.createOrder(
                symbol,
                quote.assetType,
                side,
                "stop",
                quantity,
                undefined,
                stopPrice
            );

        if (
            this.isStopTriggered(
                quote,
                side,
                stopPrice
            )
        ) {
            const fillPrice =
                this.getMarketExecutionPrice(
                    quote,
                    side,
                    quantity
                );

            this.executeOrder(
                order,
                fillPrice,
                this.currentSimulationTime
            );
        } else {
            this.state.orders.push(
                order
            );
        }

        return {
            success: true,
            order: {
                ...order,
            },
            message:
                order.status ===
                    "filled"
                    ? "Stop order triggered."
                    : "Stop order placed.",
        };
    }

    /**
     * Cancel pending order.
     */
    cancelOrder(
        orderId: string
    ): boolean {
        const order =
            this.state.orders.find(
                item =>
                    item.id ===
                    orderId
            );

        if (
            !order ||
            order.status !==
            "pending"
        ) {
            return false;
        }

        order.status =
            "cancelled";

        return true;
    }

    /**
     * Close an entire position.
     */
    closePosition(
        symbol: string
    ): TradingExecutionResult {
        const position =
            this.state.positions[
            symbol
            ];

        if (
            !position ||
            position.quantity === 0
        ) {
            return {
                success: false,
                order: null,
                message:
                    "No open position.",
            };
        }

        const side:
            TradingSide =
            position.quantity > 0
                ? "sell"
                : "buy";

        return this.placeMarketOrder(
            symbol,
            side,
            Math.abs(
                position.quantity
            )
        );
    }

    /**
     * Execute filled order.
     */
    private executeOrder(
        order: TradingOrder,
        fillPrice: number,
        timestamp: number
    ): void {
        order.status =
            "filled";

        order.filledPrice =
            fillPrice;

        order.filledQuantity =
            order.quantity;

        order.filledAt =
            timestamp;

        this.applyFillToPosition(
            order,
            fillPrice
        );

        /*
         * Persist filled orders.
         */
        this.state.orders.push(
            order
        );
    }

    /**
     * Apply fill to a net position.
     *
     * Positive position = long.
     * Negative position = short.
     */
    private applyFillToPosition(
        order: TradingOrder,
        fillPrice: number
    ): void {
        const signedQuantity =
            order.side === "buy"
                ? order.quantity
                : -order.quantity;

        const existing =
            this.state.positions[
            order.symbol
            ];

        if (!existing) {
            this.state.positions[
                order.symbol
            ] = {
                symbol:
                    order.symbol,

                assetType:
                    order.assetType,

                quantity:
                    signedQuantity,

                averageEntryPrice:
                    fillPrice,

                currentPrice:
                    fillPrice,

                marketValue:
                    signedQuantity *
                    fillPrice,

                unrealizedPnL:
                    0,

                realizedPnL:
                    0,
            };

            this.state.cash -=
                signedQuantity *
                fillPrice;

            return;
        }

        const currentQuantity =
            existing.quantity;

        /*
         * Same direction:
         *
         * Increase position and
         * calculate weighted average.
         */
        if (
            currentQuantity === 0 ||
            Math.sign(
                currentQuantity
            ) ===
            Math.sign(
                signedQuantity
            )
        ) {
            const newQuantity =
                currentQuantity +
                signedQuantity;

            const currentAbs =
                Math.abs(
                    currentQuantity
                );

            const fillAbs =
                Math.abs(
                    signedQuantity
                );

            const totalCost =
                currentAbs *
                existing
                    .averageEntryPrice +
                fillAbs *
                fillPrice;

            existing.quantity =
                newQuantity;

            existing.averageEntryPrice =
                totalCost /
                Math.abs(
                    newQuantity
                );

            this.state.cash -=
                signedQuantity *
                fillPrice;

            return;
        }

        /*
         * Opposite direction:
         *
         * Part or all of the existing
         * position is being closed.
         */
        const closingQuantity =
            Math.min(
                Math.abs(
                    currentQuantity
                ),
                Math.abs(
                    signedQuantity
                )
            );

        const direction =
            Math.sign(
                currentQuantity
            );

        const realized =
            (
                fillPrice -
                existing
                    .averageEntryPrice
            ) *
            closingQuantity *
            direction;

        existing.realizedPnL +=
            realized;

        this.state.realizedPnL +=
            realized;

        this.state.cash -=
            signedQuantity *
            fillPrice;

        const remaining =
            currentQuantity +
            signedQuantity;

        if (
            remaining === 0
        ) {
            existing.quantity =
                0;

            existing.averageEntryPrice =
                0;

            existing.marketValue =
                0;

            existing.unrealizedPnL =
                0;

            return;
        }

        /*
         * Position flipped direction.
         *
         * Remaining quantity is a new
         * position at the fill price.
         */
        if (
            Math.sign(
                remaining
            ) !==
            Math.sign(
                currentQuantity
            )
        ) {
            existing.quantity =
                remaining;

            existing.averageEntryPrice =
                fillPrice;

            existing.unrealizedPnL =
                0;

            return;
        }

        existing.quantity =
            remaining;
    }

    /**
     * Execute pending limit/stop orders.
     */
    private processPendingOrders(
        timestamp: number
    ): void {
        for (
            const order of
            this.state.orders
        ) {
            if (
                order.status !==
                "pending"
            ) {
                continue;
            }

            const quote =
                this.state.quotes[
                order.symbol
                ];

            if (!quote) {
                continue;
            }

            if (
                order.type ===
                "limit" &&
                order.price !==
                undefined
            ) {
                if (
                    this.isLimitTriggered(
                        quote,
                        order.side,
                        order.price
                    )
                ) {
                    const fillPrice =
                        order.side ===
                            "buy"
                            ? Math.min(
                                quote.ask,
                                order.price
                            )
                            : Math.max(
                                quote.bid,
                                order.price
                            );

                    this.executePendingOrder(
                        order,
                        fillPrice,
                        timestamp
                    );
                }
            }

            if (
                order.type ===
                "stop" &&
                order.stopPrice !==
                undefined
            ) {
                if (
                    this.isStopTriggered(
                        quote,
                        order.side,
                        order.stopPrice
                    )
                ) {
                    const fillPrice =
                        this.getMarketExecutionPrice(
                            quote,
                            order.side,
                            order.quantity
                        );

                    this.executePendingOrder(
                        order,
                        fillPrice,
                        timestamp
                    );
                }
            }
        }
    }

    /**
     * Execute an existing pending order
     * without adding a duplicate order.
     */
    private executePendingOrder(
        order: TradingOrder,
        fillPrice: number,
        timestamp: number
    ): void {
        order.status =
            "filled";

        order.filledPrice =
            fillPrice;

        order.filledQuantity =
            order.quantity;

        order.filledAt =
            timestamp;

        this.applyFillToPosition(
            order,
            fillPrice
        );
    }

    private isLimitTriggered(
        quote: TradingQuote,
        side: TradingSide,
        limitPrice: number
    ): boolean {
        return side === "buy"
            ? quote.ask <=
            limitPrice
            : quote.bid >=
            limitPrice;
    }

    private isStopTriggered(
        quote: TradingQuote,
        side: TradingSide,
        stopPrice: number
    ): boolean {
        return side === "buy"
            ? quote.ask >=
            stopPrice
            : quote.bid <=
            stopPrice;
    }

    /**
     * Market execution includes slippage.
     */
    private getMarketExecutionPrice(
        quote: TradingQuote,
        side: TradingSide,
        quantity: number
    ): number {
        const config =
            SPREAD_CONFIG[
            quote.assetType
            ];

        /*
         * Larger trades experience
         * slightly more slippage.
         */
        const sizeImpact =
            Math.min(
                3,
                Math.sqrt(
                    Math.max(
                        quantity,
                        1
                    )
                ) *
                0.02
            );

        const slippageBps =
            config.slippageBps +
            sizeImpact;

        const slippage =
            quote.mid *
            slippageBps /
            10_000;

        return side === "buy"
            ? quote.ask +
            slippage
            : quote.bid -
            slippage;
    }

    private createOrder(
        symbol: string,
        assetType:
            TradingAssetType,
        side: TradingSide,
        type: TradingOrderType,
        quantity: number,
        price?: number,
        stopPrice?: number
    ): TradingOrder {
        this.orderSequence++;

        return {
            id:
                `order-${this.orderSequence}`,

            symbol,

            assetType,

            side,

            type,

            quantity,

            status:
                "pending",

            price,

            stopPrice,

            filledPrice:
                null,

            filledQuantity:
                0,

            createdAt:
                this.currentSimulationTime,

            filledAt:
                null,
        };
    }

    /**
     * Mark all open positions to current
     * mid market price.
     */
    private markPositionsToMarket(): void {
        let totalUnrealized = 0;

        for (
            const position of
            Object.values(
                this.state.positions
            )
        ) {
            const quote =
                this.state.quotes[
                position.symbol
                ];

            if (!quote) {
                continue;
            }

            position.currentPrice =
                quote.mid;

            position.marketValue =
                position.quantity *
                quote.mid;

            position.unrealizedPnL =
                (
                    quote.mid -
                    position
                        .averageEntryPrice
                ) *
                position.quantity;

            totalUnrealized +=
                position.unrealizedPnL;
        }

        this.state.unrealizedPnL =
            totalUnrealized;
    }

    /**
     * Account equity.
     */
    private updateAccountMetrics(): void {
        let positionValue = 0;

        for (
            const position of
            Object.values(
                this.state.positions
            )
        ) {
            positionValue +=
                position.marketValue;
        }

        this.state.equity =
            this.state.cash +
            positionValue;

        this.state.totalPnL =
            this.state.realizedPnL +
            this.state.unrealizedPnL;
    }

    private createInitialState(
        initialBalance: number
    ): TradingAccountState {
        return {
            initialBalance,

            cash:
                initialBalance,

            equity:
                initialBalance,

            realizedPnL: 0,

            unrealizedPnL: 0,

            totalPnL: 0,

            positions: {},

            orders: [],

            quotes: {},
        };
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
    ): TradingSnapshot | null {
        let result:
            | TradingSnapshot
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

    private cloneState(
        state: TradingAccountState
    ): TradingAccountState {
        const positions:
            Record<
                string,
                TradingPosition
            > = {};

        for (
            const [
                symbol,
                position,
            ] of Object.entries(
                state.positions
            )
        ) {
            positions[symbol] = {
                ...position,
            };
        }

        const orders =
            state.orders.map(
                order => ({
                    ...order,
                })
            );

        const quotes:
            Record<
                string,
                TradingQuote
            > = {};

        for (
            const [
                symbol,
                quote,
            ] of Object.entries(
                state.quotes
            )
        ) {
            quotes[symbol] = {
                ...quote,
            };
        }

        return {
            initialBalance:
                state.initialBalance,

            cash:
                state.cash,

            equity:
                state.equity,

            realizedPnL:
                state.realizedPnL,

            unrealizedPnL:
                state.unrealizedPnL,

            totalPnL:
                state.totalPnL,

            positions,

            orders,

            quotes,
        };
    }

    private seededRandom(
        timestamp: number,
        salt: number
    ): number {
        const seed =
            Math.floor(
                timestamp /
                1_000
            ) *
            1009 +
            salt *
            7919 +
            73;

        const value =
            Math.sin(
                seed *
                12.9898
            ) *
            43758.5453;

        return (
            value -
            Math.floor(value)
        );
    }

    getState():
        TradingAccountState {
        return this.cloneState(
            this.state
        );
    }

    getHistory():
        TradingSnapshot[] {
        return Array.from(
            this.history.values()
        ).sort(
            (a, b) =>
                a.timestamp -
                b.timestamp
        );
    }
}