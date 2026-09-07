import {
    CorrelationState,
} from "./correlation-engine.types";

export const INITIAL_CORRELATION_STATE:
    CorrelationState = {

    economic: {
        bonds: 0,
        currencies: 0,
        markets: 0,
    },

    bonds: {
        currencies: 0,
    },

    sentiment: {
        stocks: 0,
        commodities: 0,
        currencies: 0,
        nepal: 0,
    },

    crossMarket: {
        stocks: 0,
        commodities: 0,
        currencies: 0,
        nepal: 0,
    },

    nepal: {
        nepse: 0,
    },

    aggregate: {
        stocks: 0,
        commodities: 0,
        currencies: 0,
        nepse: 0,
    },
};