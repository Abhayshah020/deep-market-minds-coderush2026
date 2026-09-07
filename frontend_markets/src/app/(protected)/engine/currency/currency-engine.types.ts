export type CurrencyCode =
    | "EUR"
    | "USD"
    | "CHF"
    | "CNY"
    | "INR"
    | "NPR"
    | "JPY"
    | "NZD"
    | "AUD"
    | "CAD"
    | "GBP";

export interface CurrencyOHLC {
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface CurrencyIndexState {
    currency: CurrencyCode;

    strength: number;

    ohlc: CurrencyOHLC;
}

export type CurrencyState =
    Record<
        CurrencyCode,
        CurrencyIndexState
    >;

export interface CurrencySnapshot {
    timestamp: number;

    state: CurrencyState;
}