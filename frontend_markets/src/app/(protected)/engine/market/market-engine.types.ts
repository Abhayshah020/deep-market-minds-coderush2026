export type MarketCandleTimeframe =
    | "minute"
    | "hour"
    | "day";

export type StockIndexCode =
    | "SP500"
    | "NASDAQ"
    | "DOW"
    | "FTSE100"
    | "DAX"
    | "CAC40"
    | "NIKKEI225"
    | "HANGSENG"
    | "NIFTY50"
    | "ASX200";

export type CommodityCode =
    | "GOLD"
    | "OIL"
    | "COPPER";

export type MarketAssetCode =
    | StockIndexCode
    | CommodityCode;

export interface OHLC {
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface MarketCandle {
    timestamp: number;
    ohlc: OHLC;
}

export interface MarketAssetState {
    code: MarketAssetCode;
    name: string;

    value: number;

    ohlc: OHLC;

    supply: number;
    demand: number;
}

export interface CompanyState {
    id: string;
    name: string;

    revenue: number;
    earnings: number;

    supply: number;
    demand: number;

    value: number;

    ohlc: OHLC;
}

export interface MarketState {
    indices: Record<
        StockIndexCode,
        MarketAssetState
    >;

    commodities: Record<
        CommodityCode,
        MarketAssetState
    >;

    companies: CompanyState[];
}

export interface MarketSnapshot {
    timestamp: number;

    state: MarketState;
}

export interface MarketHistory {
    timestamp: number;

    indices: Record<
        StockIndexCode,
        MarketCandle[]
    >;

    commodities: Record<
        CommodityCode,
        MarketCandle[]
    >;

    companies: Record<
        string,
        MarketCandle[]
    >;
}