import {
    EconomicState,
} from "../economy/economic-engine.types";

import {
    BondState,
} from "../bond/bond-engine.types";

import {
    CurrencyState,
} from "../currency/currency-engine.types";

import {
    MarketState,
} from "../market/market-engine.types";

import {
    NepalMarketState,
} from "../nepal/nepal-engine.types";

import {
    SentimentState,
} from "../sentiment/sentiment.types";

import {
    NewsEvent,
} from "../news-event/news-event.types";

/**
 * Normalized effect.
 *
 * -1 = strongly negative
 *  0 = neutral
 * +1 = strongly positive
 */
export type CorrelationEffect = number;

/**
 * Effect from one source to one target.
 */
export interface CorrelationRelationship {
    source: string;
    target: string;
    effect: CorrelationEffect;
}

/**
 * Economic effects.
 */
export interface EconomicCorrelationState {
    bonds: CorrelationEffect;
    currencies: CorrelationEffect;
    markets: CorrelationEffect;
}

/**
 * Bond effects.
 */
export interface BondCorrelationState {
    currencies: CorrelationEffect;
}

/**
 * Sentiment effects.
 */
export interface SentimentCorrelationState {
    stocks: CorrelationEffect;
    commodities: CorrelationEffect;
    currencies: CorrelationEffect;
    nepal: CorrelationEffect;
}

/**
 * Cross-market effects.
 */
export interface CrossMarketCorrelationState {
    stocks: CorrelationEffect;
    commodities: CorrelationEffect;
    currencies: CorrelationEffect;
    nepal: CorrelationEffect;
}

/**
 * Nepal-specific effects.
 */
export interface NepalCorrelationState {
    nepse: CorrelationEffect;
}

/**
 * Complete calculated correlation state.
 */
export interface CorrelationState {
    economic: EconomicCorrelationState;

    bonds: BondCorrelationState;

    sentiment: SentimentCorrelationState;

    crossMarket: CrossMarketCorrelationState;

    nepal: NepalCorrelationState;

    /**
     * Aggregate market pressures.
     */
    aggregate: {
        stocks: CorrelationEffect;
        commodities: CorrelationEffect;
        currencies: CorrelationEffect;
        nepse: CorrelationEffect;
    };
}

/**
 * Snapshot of the correlation engine.
 */
export interface CorrelationSnapshot {
    timestamp: number;

    state: CorrelationState;
}

/**
 * Input states required by the
 * correlation calculation layer.
 */
export interface CorrelationInput {
    economic: EconomicState;

    bonds: BondState;

    currencies: CurrencyState;

    markets: MarketState;

    nepal: NepalMarketState;

    sentiment: SentimentState;

    news: NewsEvent[];
}