import {
    SimulationClockState,
} from "../../clock/simulation-clock.types";

import {
    BondState,
} from "../bond/bond-engine.types";

import {
    CurrencyCode,
    CurrencyState,
} from "../currency/currency-engine.types";

import {
    NepalMarketState,
} from "../nepal/nepal-engine.types";

import {
    SentimentState,
} from "../sentiment/sentiment.types";

import {
    PricingSnapshot,
    PricingState,
    CurrencyPair,
    CurrencyPairPrice,
    PricingOHLC,
} from "./pricing-engine.types";

const DAY_MS =
    24 * 60 * 60 * 1000;

const CURRENCY_PAIRS:
    CurrencyPair[] = [
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
    ];

/**
 * Pair-specific market characteristics.
 *
 * riskBeta:
 *   Positive = benefits from risk-on.
 *   Negative = benefits from risk-off.
 *
 * usdExposure:
 *   +1 = USD is the BASE currency.
 *   -1 = USD is the QUOTE currency.
 *
 * This is deliberately approximate for a
 * simulation rather than a real FX model.
 */
interface PairConfig {
    riskBeta: number;
    volatility: number;
    meanReversion: number;
}

const PAIR_CONFIG:
    Record<
        CurrencyPair,
        PairConfig
    > = {
    "EUR/USD": {
        riskBeta: 0.15,
        volatility: 0.0070,
        meanReversion: 0.015,
    },

    "GBP/USD": {
        riskBeta: 0.18,
        volatility: 0.0080,
        meanReversion: 0.015,
    },

    "USD/JPY": {
        riskBeta: 0.25,
        volatility: 0.0075,
        meanReversion: 0.012,
    },

    "USD/CHF": {
        riskBeta: 0.18,
        volatility: 0.0065,
        meanReversion: 0.014,
    },

    "AUD/USD": {
        riskBeta: 0.55,
        volatility: 0.0100,
        meanReversion: 0.018,
    },

    "USD/CAD": {
        riskBeta: -0.45,
        volatility: 0.0080,
        meanReversion: 0.015,
    },

    "NZD/USD": {
        riskBeta: 0.50,
        volatility: 0.0100,
        meanReversion: 0.018,
    },

    "USD/CNY": {
        riskBeta: -0.10,
        volatility: 0.0040,
        meanReversion: 0.020,
    },

    "USD/INR": {
        riskBeta: -0.10,
        volatility: 0.0035,
        meanReversion: 0.020,
    },

    "USD/NPR": {
        riskBeta: -0.05,
        volatility: 0.0025,
        meanReversion: 0.025,
    },
};

interface PricingInputs {
    currencies: CurrencyState;

    bonds: BondState;

    sentiment: SentimentState;

    nepal: NepalMarketState;
}

export class PricingEngine {
    private state: PricingState;

    private history:
        Map<number, PricingSnapshot>;

    private currentSimulationTime: number;

    /**
     * Previous currency strengths are
     * retained so we can calculate actual
     * currency returns rather than comparing
     * arbitrary strength levels.
     */
    private previousCurrencyStrengths:
        Partial<
            Record<
                CurrencyCode,
                number
            >
        > = {};

    constructor(
        initialTime: number
    ) {
        this.currentSimulationTime =
            initialTime;

        this.state =
            this.createInitialState();

        this.history =
            new Map();

        this.saveSnapshot(
            initialTime
        );
    }

    update(
        clock: SimulationClockState,
        inputs: PricingInputs
    ): void {
        const targetTime =
            clock.currentTime;

        if (
            targetTime ===
            this.currentSimulationTime
        ) {
            return;
        }

        if (
            targetTime >
            this.currentSimulationTime
        ) {
            this.processForward(
                targetTime,
                inputs
            );
        } else {
            this.processBackward(
                targetTime
            );
        }

        this.currentSimulationTime =
            targetTime;
    }

    private processForward(
        targetTime: number,
        inputs: PricingInputs
    ): void {
        const elapsed =
            targetTime -
            this.currentSimulationTime;

        if (
            elapsed <= 0
        ) {
            return;
        }

        /*
         * On the first update we need a
         * reference point for currency returns.
         */
        if (
            Object.keys(
                this.previousCurrencyStrengths
            ).length === 0
        ) {
            this.captureCurrencyStrengths(
                inputs.currencies
            );
        }

        this.updateCurrencyPairs(
            inputs.currencies,
            inputs.bonds,
            inputs.sentiment,
            elapsed
        );

        this.updateBondPricing(
            inputs.bonds
        );

        this.updateSentimentPricing(
            inputs.sentiment
        );

        this.updateNepalPricing(
            inputs.nepal,
            inputs.currencies,
            inputs.sentiment
        );

        this.captureCurrencyStrengths(
            inputs.currencies
        );

        this.saveSnapshot(
            targetTime
        );
    }

    /**
     * Calculate pair prices using:
     *
     * 1. Relative base/quote strength
     * 2. USD macro factor
     * 3. Risk sentiment
     * 4. Small mean-reversion pressure
     * 5. Deterministic market noise
     */
    private updateCurrencyPairs(
        currencies: CurrencyState,
        bonds: BondState,
        sentiment: SentimentState,
        elapsed: number
    ): void {
        for (
            let i = 0;
            i < CURRENCY_PAIRS.length;
            i++
        ) {
            const pair =
                CURRENCY_PAIRS[i];

            const [
                base,
                quote,
            ] =
                pair.split(
                    "/"
                ) as [
                    CurrencyCode,
                    CurrencyCode
                ];

            const current =
                this.state.currencies[
                pair
                ];

            const config =
                PAIR_CONFIG[
                pair
                ];

            const baseReturn =
                this.getCurrencyReturn(
                    base,
                    currencies
                );

            const quoteReturn =
                this.getCurrencyReturn(
                    quote,
                    currencies
                );

            /*
             * --------------------------------
             * 1. BASE / QUOTE FACTOR
             * --------------------------------
             *
             * If base strengthens relative
             * to quote, pair rises.
             *
             * If quote strengthens relative
             * to base, pair falls.
             */
            const relativeCurrencyEffect =
                this.clamp(
                    (
                        baseReturn -
                        quoteReturn
                    ) * 0.65,
                    -0.015,
                    0.015
                );

            /*
             * --------------------------------
             * 2. USD FACTOR
             * --------------------------------
             *
             * Rising US yields tend to
             * support USD.
             *
             * Safe-haven demand also supports
             * USD.
             *
             * USD base:
             *
             * USD/CAD ↑ when USD strengthens.
             *
             * USD quote:
             *
             * EUR/USD ↓ when USD strengthens.
             */
            const yieldLevel =
                this.calculateYieldSignal(
                    bonds
                );

            const usdSentiment =
                this.clamp(
                    (
                        sentiment.safeHavenDemand *
                        0.70 +
                        sentiment.creditRisk *
                        0.30
                    ),
                    0,
                    1
                );

            const usdMacroStrength =
                this.clamp(
                    yieldLevel *
                    0.035 +
                    usdSentiment *
                    0.020,
                    -0.015,
                    0.015
                );

            const usdExposure =
                base === "USD"
                    ? 1
                    : quote === "USD"
                        ? -1
                        : 0;

            const usdEffect =
                usdMacroStrength *
                usdExposure;

            /*
             * --------------------------------
             * 3. RISK SENTIMENT
             * --------------------------------
             */
            const riskSignal =
                this.calculateRiskSignal(
                    sentiment
                );

            const riskEffect =
                riskSignal *
                config.riskBeta *
                0.004;

            /*
             * --------------------------------
             * 4. SMALL MEAN REVERSION
             * --------------------------------
             *
             * Prevents random noise from
             * creating an endless one-way
             * trend.
             */
            const distanceFromInitial =
                this.calculatePriceDistance(
                    pair,
                    current.price
                );

            const meanReversionEffect =
                -distanceFromInitial *
                config.meanReversion;

            /*
             * --------------------------------
             * 5. DETERMINISTIC NOISE
             * --------------------------------
             */
            const seed =
                this.createSeed(
                    this.currentSimulationTime +
                    elapsed,
                    i
                );

            const randomShock =
                this.gaussianNoise(
                    seed,
                    seed + 11
                );

            /*
             * Volatility is expressed as
             * approximate daily standard
             * deviation.
             */
            const timeScale =
                Math.sqrt(
                    Math.max(
                        elapsed /
                        DAY_MS,
                        0
                    )
                );

            const noise =
                randomShock *
                config.volatility *
                timeScale;

            /*
             * Small deterministic micro drift.
             */
            const microDrift =
                (
                    this.seededRandom(
                        seed + 21
                    ) -
                    0.5
                ) *
                0.0005 *
                timeScale;

            /*
             * --------------------------------
             * FINAL RETURN
             * --------------------------------
             */
            const totalReturn =
                this.clamp(
                    relativeCurrencyEffect +
                    usdEffect +
                    riskEffect +
                    meanReversionEffect +
                    noise +
                    microDrift,
                    -0.035,
                    0.035
                );

            const open =
                current.price;

            const close =
                Math.max(
                    0.000001,
                    open *
                    Math.exp(
                        totalReturn
                    )
                );

            /*
             * --------------------------------
             * INTRABAR HIGH / LOW
             * --------------------------------
             *
             * Add separate noise so the
             * candles have visible wicks
             * rather than merely being:
             *
             * open -> close
             */
            const wickSeed =
                seed + 101;

            const upperShock =
                Math.abs(
                    this.gaussianNoise(
                        wickSeed,
                        wickSeed + 7
                    )
                );

            const lowerShock =
                Math.abs(
                    this.gaussianNoise(
                        wickSeed + 17,
                        wickSeed + 31
                    )
                );

            const wickScale =
                config.volatility *
                timeScale *
                0.75;

            const high =
                Math.max(
                    open,
                    close
                ) *
                (
                    1 +
                    upperShock *
                    wickScale
                );

            const low =
                Math.max(
                    0.000001,
                    Math.min(
                        open,
                        close
                    ) *
                    (
                        1 -
                        lowerShock *
                        wickScale
                    )
                );

            current.price =
                close;

            current.ohlc =
                this.updateOHLC(
                    current.ohlc,
                    {
                        open,
                        high,
                        low,
                        close,
                    }
                );
        }
    }

    /**
     * Return percentage movement in a
     * currency's own strength index.
     */
    private getCurrencyReturn(
        currency: CurrencyCode,
        currencies: CurrencyState
    ): number {
        const current =
            currencies[
                currency
            ].strength;

        const previous =
            this.previousCurrencyStrengths[
            currency
            ];

        if (
            previous === undefined ||
            previous === 0
        ) {
            return 0;
        }

        return this.clamp(
            (
                current -
                previous
            ) /
            Math.abs(
                previous
            ),
            -0.05,
            0.05
        );
    }

    /**
     * Estimate USD pressure from
     * US yield conditions.
     *
     * This intentionally stays moderate
     * because currency strength already
     * carries part of this information.
     */
    private calculateYieldSignal(
        bonds: BondState
    ): number {
        const us2y =
            this.clamp(
                (
                    bonds.us2yYield -
                    4
                ) / 2,
                -1,
                1
            );

        const us10y =
            this.clamp(
                (
                    bonds.us10yYield -
                    4.5
                ) / 2,
                -1,
                1
            );

        return (
            us2y * 0.60 +
            us10y * 0.40
        );
    }

    /**
     * Convert market sentiment to
     * a risk-on / risk-off factor.
     */
    private calculateRiskSignal(
        sentiment: SentimentState
    ): number {
        const fearGreed =
            this.clamp(
                sentiment.fearGreed,
                -1,
                1
            );

        const momentum =
            this.clamp(
                sentiment.momentum,
                -1,
                1
            );

        const breadth =
            this.clamp(
                sentiment.marketBreadth,
                -1,
                1
            );

        const safeHaven =
            this.clamp(
                sentiment.safeHavenDemand,
                0,
                1
            );

        return this.clamp(
            fearGreed * 0.40 +
            momentum * 0.25 +
            breadth * 0.20 -
            safeHaven * 0.15,
            -1,
            1
        );
    }

    /**
     * Simple bounded price distance.
     *
     * Rather than allowing the price to
     * mean revert against an arbitrary
     * market level forever, use a very weak
     * logarithmic distance from the initial
     * anchor.
     */
    private calculatePriceDistance(
        pair: CurrencyPair,
        price: number
    ): number {
        const anchor =
            this.getInitialPairPrice(
                pair
            );

        if (
            anchor <= 0 ||
            price <= 0
        ) {
            return 0;
        }

        return this.clamp(
            Math.log(
                price /
                anchor
            ),
            -1,
            1
        );
    }

    /**
     * Capture latest currency strength.
     */
    private captureCurrencyStrengths(
        currencies: CurrencyState
    ): void {
        for (
            const currency of Object.keys(
                currencies
            ) as CurrencyCode[]
        ) {
            this.previousCurrencyStrengths[
                currency
            ] =
                currencies[
                    currency
                ].strength;
        }
    }

    /**
     * Deterministic seed.
     */
    private createSeed(
        timestamp: number,
        pairIndex: number
    ): number {
        const timeBucket =
            Math.floor(
                timestamp /
                60_000
            );

        return (
            timeBucket * 1009 +
            pairIndex * 7919 +
            73
        );
    }

    /**
     * Uniform deterministic random.
     */
    private seededRandom(
        seed: number
    ): number {
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

    /**
     * Deterministic Gaussian random
     * using Box-Muller.
     */
    private gaussianNoise(
        seedA: number,
        seedB: number
    ): number {
        const u1 =
            Math.max(
                0.000001,
                this.seededRandom(
                    seedA
                )
            );

        const u2 =
            this.seededRandom(
                seedB
            );

        return (
            Math.sqrt(
                -2 *
                Math.log(
                    u1
                )
            ) *
            Math.cos(
                2 *
                Math.PI *
                u2
            )
        );
    }

    private updateBondPricing(
        bonds: BondState
    ): void {
        this.state.bonds = {
            us2yYield:
                Math.max(
                    0,
                    bonds.us2yYield
                ),

            us10yYield:
                Math.max(
                    0,
                    bonds.us10yYield
                ),

            yieldSpread:
                bonds.yieldSpread,
        };
    }

    private updateSentimentPricing(
        sentiment: SentimentState
    ): void {
        const value =
            Math.max(
                -1,
                Math.min(
                    1,
                    (
                        sentiment.fearGreed +
                        sentiment.momentum +
                        sentiment.marketBreadth
                    ) /
                    3
                )
            );

        const premium =
            value *
            0.01;

        this.state.sentiment = {
            value,

            premium,
        };
    }

    private updateNepalPricing(
        nepal: NepalMarketState,
        currencies: CurrencyState,
        sentiment: SentimentState
    ): void {
        const nepse =
            Math.max(
                0,
                nepal.nepseIndex
            );

        const usdStrength =
            currencies.USD.strength;

        const nprStrength =
            currencies.NPR.strength;

        const baseRemittancePrice =
            this.safeRatio(
                usdStrength,
                nprStrength
            );

        const remittancePressure =
            (
                sentiment.safeHavenDemand +
                sentiment.creditRisk
            ) *
            0.01;

        const remittance =
            Math.max(
                0.000001,
                baseRemittancePrice *
                (
                    1 +
                    remittancePressure
                )
            );

        this.state.nepal = {
            nepse,

            remittance,
        };
    }

    private createInitialState():
        PricingState {
        const currencies =
            {} as PricingState[
            "currencies"
            ];

        for (
            const pair of CURRENCY_PAIRS
        ) {
            const [
                base,
                quote,
            ] =
                pair.split(
                    "/"
                ) as [
                    CurrencyCode,
                    CurrencyCode
                ];

            const initialPrice =
                this.getInitialPairPrice(
                    pair
                );

            currencies[pair] = {
                pair,

                baseCurrency:
                    base,

                quoteCurrency:
                    quote,

                price:
                    initialPrice,

                ohlc: {
                    open:
                        initialPrice,

                    high:
                        initialPrice,

                    low:
                        initialPrice,

                    close:
                        initialPrice,
                },
            };
        }

        return {
            currencies,

            bonds: {
                us2yYield: 0,
                us10yYield: 0,
                yieldSpread: 0,
            },

            sentiment: {
                value: 0,
                premium: 0,
            },

            nepal: {
                nepse: 0,
                remittance: 0,
            },
        };
    }

    private getInitialPairPrice(
        pair: CurrencyPair
    ): number {
        switch (pair) {
            case "EUR/USD":
                return 1.08;

            case "GBP/USD":
                return 1.27;

            case "USD/JPY":
                return 155;

            case "USD/CHF":
                return 0.88;

            case "AUD/USD":
                return 0.65;

            case "USD/CAD":
                return 1.38;

            case "NZD/USD":
                return 0.59;

            case "USD/CNY":
                return 7.25;

            case "USD/INR":
                return 86;

            case "USD/NPR":
                return 137;
        }
    }

    private safeRatio(
        numerator: number,
        denominator: number
    ): number {
        if (
            denominator === 0 ||
            !Number.isFinite(
                denominator
            )
        ) {
            return 1;
        }

        return (
            numerator /
            denominator
        );
    }

    /**
     * Accumulate OHLC.
     *
     * The first price in the current
     * pricing interval establishes open.
     */
    private updateOHLC(
        previous: PricingOHLC,
        current: PricingOHLC
    ): PricingOHLC {
        return {
            open:
                previous.open,

            high:
                Math.max(
                    previous.high,
                    current.high
                ),

            low:
                Math.min(
                    previous.low,
                    current.low
                ),

            close:
                current.close,
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

        /*
         * Reconstruct previous strength
         * reference from the restored
         * simulation state.
         */
        this.previousCurrencyStrengths =
            {};
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
    ): PricingSnapshot | null {
        let result:
            | PricingSnapshot
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
        state: PricingState
    ): PricingState {
        const currencies =
            {} as PricingState[
            "currencies"
            ];

        for (
            const pair of CURRENCY_PAIRS
        ) {
            const price =
                state.currencies[
                pair
                ];

            currencies[pair] = {
                ...price,

                ohlc: {
                    ...price.ohlc,
                },
            };
        }

        return {
            currencies,

            bonds: {
                ...state.bonds,
            },

            sentiment: {
                ...state.sentiment,
            },

            nepal: {
                ...state.nepal,
            },
        };
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

    private alignToMinute(
        timestamp: number
    ): number {
        return (
            Math.floor(
                timestamp /
                60_000
            ) *
            60_000
        );
    }

    getState(): PricingState {
        return this.cloneState(
            this.state
        );
    }

    getHistory():
        PricingSnapshot[] {
        return Array.from(
            this.history.values()
        ).sort(
            (a, b) =>
                a.timestamp -
                b.timestamp
        );
    }

    getCurrencyPairPrice(
        pair: CurrencyPair
    ): CurrencyPairPrice {
        return {
            ...this.state.currencies[
            pair
            ],

            ohlc: {
                ...this.state
                    .currencies[pair]
                    .ohlc,
            },
        };
    }
}