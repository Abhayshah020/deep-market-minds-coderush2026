import {
    CurrencyCode,
} from "../currency/currency-engine.types";

export type CurrencyPair =
    | "EUR/USD"
    | "GBP/USD"
    | "USD/JPY"
    | "USD/CHF"
    | "AUD/USD"
    | "USD/CAD"
    | "NZD/USD"
    | "USD/CNY"
    | "USD/INR"
    | "USD/NPR";

export type PricingAssetType =
    | "currencyPair"
    | "bond"
    | "sentiment"
    | "nepse"
    | "remittance";

export interface PricingOHLC {
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface CurrencyPairPrice {
    pair: CurrencyPair;

    baseCurrency: CurrencyCode;

    quoteCurrency: CurrencyCode;

    price: number;

    ohlc: PricingOHLC;
}

export interface BondPrice {
    us2yYield: number;

    us10yYield: number;

    yieldSpread: number;
}

export interface SentimentPrice {
    value: number;

    premium: number;
}

export interface NepalPricingState {
    nepse: number;

    remittance: number;
}

export interface PricingState {
    currencies: Record<
        CurrencyPair,
        CurrencyPairPrice
    >;

    bonds: BondPrice;

    sentiment: SentimentPrice;

    nepal: NepalPricingState;
}

export interface PricingSnapshot {
    timestamp: number;

    state: PricingState;
}