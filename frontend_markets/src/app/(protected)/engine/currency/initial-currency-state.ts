import { randomAround, randomOHLC } from "@/app/(protected)/utils/random-initial";
import {
    CurrencyCode,
    CurrencyState,
} from "./currency-engine.types";



const BASE_INDEX: Record<
    CurrencyCode,
    number
> = {
    EUR: 100,
    USD: 100,
    CHF: 100,
    CNY: 100,
    INR: 100,
    NPR: 100,
    JPY: 100,
    NZD: 100,
    AUD: 100,
    CAD: 100,
    GBP: 100,
};

const VOLATILITY: Record<
    CurrencyCode,
    number
> = {
    EUR: 0.012,
    USD: 0.010,
    CHF: 0.009,
    CNY: 0.006,
    INR: 0.014,
    NPR: 0.018,
    JPY: 0.011,
    NZD: 0.016,
    AUD: 0.016,
    CAD: 0.014,
    GBP: 0.014,
};

function createCurrency(
    currency: CurrencyCode
) {
    const base =
        randomAround(
            BASE_INDEX[currency],
            0.05
        );

    const ohlc =
        randomOHLC(
            base,
            VOLATILITY[currency]
        );

    return {
        currency,

        /*
         * Strength starts around the
         * opening market level.
         */
        strength:
            ohlc.close,

        ohlc,
    };
}

export const INITIAL_CURRENCY_STATE:
    CurrencyState = {
    EUR:
        createCurrency("EUR"),

    USD:
        createCurrency("USD"),

    CHF:
        createCurrency("CHF"),

    CNY:
        createCurrency("CNY"),

    INR:
        createCurrency("INR"),

    NPR:
        createCurrency("NPR"),

    JPY:
        createCurrency("JPY"),

    NZD:
        createCurrency("NZD"),

    AUD:
        createCurrency("AUD"),

    CAD:
        createCurrency("CAD"),

    GBP:
        createCurrency("GBP"),
};