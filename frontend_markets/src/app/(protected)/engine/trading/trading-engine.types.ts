export type TradingAssetType =
    | "currency"
    | "index"
    | "stock"
    | "nepalIndex"
    | "nepalStock";

export type TradingSide =
    | "buy"
    | "sell";

export type TradingOrderType =
    | "market"
    | "limit"
    | "stop";

export type TradingOrderStatus =
    | "pending"
    | "filled"
    | "cancelled";

export interface TradingQuote {
    symbol: string;

    assetType:
        TradingAssetType;

    timestamp: number;

    mid: number;

    bid: number;

    ask: number;

    spread: number;

    spreadBps: number;
}

export interface TradingOrder {
    id: string;

    symbol: string;

    assetType:
        TradingAssetType;

    side: TradingSide;

    type: TradingOrderType;

    quantity: number;

    status: TradingOrderStatus;

    price?: number;

    stopPrice?: number;

    filledPrice: number | null;

    filledQuantity: number;

    createdAt: number;

    filledAt: number | null;
}

export interface TradingPosition {
    symbol: string;

    assetType:
        TradingAssetType;

    /*
     * Positive = long
     * Negative = short
     */
    quantity: number;

    averageEntryPrice: number;

    currentPrice: number;

    marketValue: number;

    unrealizedPnL: number;

    realizedPnL: number;
}

export interface TradingAccountState {
    initialBalance: number;

    cash: number;

    equity: number;

    realizedPnL: number;

    unrealizedPnL: number;

    totalPnL: number;

    positions: Record<
        string,
        TradingPosition
    >;

    orders: TradingOrder[];

    quotes: Record<
        string,
        TradingQuote
    >;
}

export interface TradingSnapshot {
    timestamp: number;

    state: TradingAccountState;
}

export interface TradingExecutionResult {
    success: boolean;

    order:
        TradingOrder | null;

    message: string;
}

export interface TradingInput {
    pricing: PricingStateLike;

    markets: MarketStateLike;

    nepal: NepalMarketStateLike;
}

/*
 * These interfaces intentionally describe
 * only the fields TradingEngine consumes.
 *
 * This keeps TradingEngine loosely coupled
 * to the individual market engines.
 */
export interface PricingStateLike {
    currencies: Record<
        string,
        {
            price: number;
        }
    >;
}

export interface MarketStateLike {
    indices: Record<
        string,
        {
            value: number;
        }
    >;

    companies: Array<{
        id: string;
        value: number;
    }>;
}

export interface NepalMarketStateLike {
    nepseIndex: number;

    companies: Array<{
        id: string;
        value: number;
    }>;
}