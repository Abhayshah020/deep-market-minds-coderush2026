import {
    SimulationClockState,
} from "../../clock/simulation-clock.types";

import {
    CorrelationInput,
    CorrelationSnapshot,
    CorrelationState,
} from "./correlation-engine.types";

import {
    INITIAL_CORRELATION_STATE,
} from "./initial-correlation-state";

const ONE_SECOND = 1_000;

export class CorrelationEngine {
    private state: CorrelationState;

    private history: Map<
        number,
        CorrelationSnapshot
    >;

    private currentSimulationTime: number;

    constructor(initialTime: number) {
        this.currentSimulationTime =
            this.alignToSecond(
                initialTime
            );

        this.state =
            this.cloneState(
                INITIAL_CORRELATION_STATE
            );

        this.history = new Map();

        this.saveSnapshot(
            this.currentSimulationTime
        );
    }

    /**
     * Update correlation calculations
     * using the current states of the
     * existing simulation engines.
     *
     * This engine does NOT modify any
     * source market state.
     */
    update(
        clock: SimulationClockState,
        input: CorrelationInput
    ): void {
        const targetTime =
            this.alignToSecond(
                clock.currentTime
            );

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
                input
            );
        } else {
            this.processBackward(
                targetTime
            );
        }

        this.currentSimulationTime =
            targetTime;
    }

    /**
     * Process forward simulation.
     *
     * Correlation is calculated once
     * for every simulated second.
     */
    // private processForward(
    //     targetTime: number,
    //     input: CorrelationInput
    // ): void {
    //     let simulationTime =
    //         this.currentSimulationTime;

    //     while (
    //         simulationTime < targetTime
    //     ) {
    //         simulationTime +=
    //             ONE_SECOND;

    //         const existingSnapshot =
    //             this.history.get(
    //                 simulationTime
    //             );

    //         if (
    //             existingSnapshot
    //         ) {
    //             this.state =
    //                 this.cloneState(
    //                     existingSnapshot.state
    //                 );

    //             continue;
    //         }

    //         this.calculateCorrelations(
    //             input
    //         );

    //         this.saveSnapshot(
    //             simulationTime
    //         );
    //     }
    // }

    private processForward(
        targetTime: number,
        input: CorrelationInput
    ): void {
        const existingSnapshot =
            this.history.get(
                targetTime
            );

        if (
            existingSnapshot
        ) {
            this.state =
                this.cloneState(
                    existingSnapshot.state
                );

            return;
        }

        this.calculateCorrelations(
            input
        );

        this.saveSnapshot(
            targetTime
        );
    }

    /**
     * Restore the latest correlation
     * snapshot at or before target time.
     */
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

    /**
     * Main correlation calculation layer.
     */
    private calculateCorrelations(
        input: CorrelationInput
    ): void {
        const economicEffect =
            this.calculateEconomicEffect(
                input.economic
            );

        const bondEffect =
            this.calculateBondEffect(
                input.bonds
            );

        const sentimentEffect =
            this.calculateSentimentEffect(
                input.sentiment
            );

        const crossMarketEffect =
            this.calculateCrossMarketEffect(
                input
            );

        const nepalEffect =
            this.calculateNepalEffect(
                input.nepal
            );

        this.state = {
            economic: {
                bonds:
                    economicEffect.bonds,

                currencies:
                    economicEffect.currencies,

                markets:
                    economicEffect.markets,
            },

            bonds: {
                currencies:
                    bondEffect,
            },

            sentiment: {
                stocks:
                    sentimentEffect.stocks,

                commodities:
                    sentimentEffect.commodities,

                currencies:
                    sentimentEffect.currencies,

                nepal:
                    sentimentEffect.nepal,
            },

            crossMarket: {
                stocks:
                    crossMarketEffect.stocks,

                commodities:
                    crossMarketEffect.commodities,

                currencies:
                    crossMarketEffect.currencies,

                nepal:
                    crossMarketEffect.nepal,
            },

            nepal: {
                nepse:
                    nepalEffect,
            },

            aggregate: {
                stocks:
                    this.clamp(
                        this.weightedAverage([
                            economicEffect.markets,
                            sentimentEffect.stocks,
                            crossMarketEffect.stocks,
                        ]),
                        -1,
                        1
                    ),

                commodities:
                    this.clamp(
                        this.weightedAverage([
                            economicEffect.markets,
                            sentimentEffect.commodities,
                            crossMarketEffect.commodities,
                        ]),
                        -1,
                        1
                    ),

                currencies:
                    this.clamp(
                        this.weightedAverage([
                            economicEffect.currencies,
                            bondEffect,
                            sentimentEffect.currencies,
                            crossMarketEffect.currencies,
                        ]),
                        -1,
                        1
                    ),

                nepse:
                    this.clamp(
                        this.weightedAverage([
                            economicEffect.markets,
                            sentimentEffect.nepal,
                            crossMarketEffect.nepal,
                            nepalEffect,
                        ]),
                        -1,
                        1
                    ),
            },
        };
    }

    /**
     * Economic → Bonds
     *
     * Higher inflation and interest rates
     * produce stronger bond pressure.
     *
     * This is an EFFECT score, not a yield.
     */
    // private calculateEconomicEffect(
    //     economic: CorrelationInput["economic"]
    // ): {
    //     bonds: number;
    //     currencies: number;
    //     markets: number;
    // } {
    //     /**
    //      * Interest rate contribution.
    //      *
    //      * 5% is treated as the neutral
    //      * reference for the initial model.
    //      */
    //     const interestRateEffect =
    //         this.normalizeAround(
    //             economic.interestRate,
    //             5,
    //             5
    //         );

    //     /**
    //      * Inflation contribution.
    //      *
    //      * Moderate inflation is treated
    //      * as neutral.
    //      */
    //     const inflationEffect =
    //         this.normalizeAround(
    //             economic.inflation,
    //             3,
    //             3
    //         );

    //     /**
    //      * GDP growth.
    //      */
    //     const gdpEffect =
    //         this.normalizeAround(
    //             economic.gdpGrowth,
    //             2,
    //             3
    //         );

    //     /**
    //      * PMI.
    //      *
    //      * 50 is the neutral level.
    //      */
    //     const pmiEffect =
    //         this.normalizeAround(
    //             economic.pmi,
    //             50,
    //             10
    //         );

    //     /**
    //      * Consumer confidence.
    //      */
    //     const confidenceEffect =
    //         this.normalizeAround(
    //             economic.consumerConfidence,
    //             100,
    //             30
    //         );

    //     /**
    //      * Bonds:
    //      *
    //      * Strong economic conditions /
    //      * inflation / rates create upward
    //      * pressure on yields.
    //      */
    //     const bonds =
    //         this.clamp(
    //             this.weightedAverage([
    //                 interestRateEffect,
    //                 inflationEffect,
    //                 gdpEffect,
    //                 pmiEffect,
    //             ]),
    //             -1,
    //             1
    //         );

    //     /**
    //      * Currency:
    //      *
    //      * Strong growth + higher rates
    //      * generally support the currency.
    //      */
    //     const currencies =
    //         this.clamp(
    //             this.weightedAverage([
    //                 interestRateEffect,
    //                 gdpEffect,
    //                 pmiEffect,
    //                 confidenceEffect,
    //             ]),
    //             -1,
    //             1
    //         );

    //     /**
    //      * Stocks:
    //      *
    //      * Growth, PMI and confidence are
    //      * positive market inputs.
    //      *
    //      * Inflation is treated negatively.
    //      */
    //     const markets =
    //         this.clamp(
    //             this.weightedAverage([
    //                 gdpEffect,
    //                 pmiEffect,
    //                 confidenceEffect,
    //                 -inflationEffect,
    //             ]),
    //             -1,
    //             1
    //         );

    //     return {
    //         bonds,
    //         currencies,
    //         markets,
    //     };
    // }

    private calculateEconomicEffect(
        economic: CorrelationInput["economic"]
    ): {
        bonds: number;
        currencies: number;
        markets: number;
    } {
        const economies =
            Object.values(
                economic.economies
            );

        if (
            economies.length === 0
        ) {
            return {
                bonds: 0,
                currencies: 0,
                markets: 0,
            };
        }

        /*
         * --------------------------------
         * GLOBAL GROWTH
         * --------------------------------
         */
        const growth =
            this.weightedAverage(
                economies.map(
                    economy =>
                        economy.growthScore
                )
            );

        /*
         * --------------------------------
         * INFLATION
         * --------------------------------
         */
        const inflation =
            this.weightedAverage(
                economies.map(
                    economy =>
                        economy.inflationPressure
                )
            );

        /*
         * --------------------------------
         * MONETARY POLICY
         * --------------------------------
         */
        const monetaryPolicy =
            this.weightedAverage(
                economies.map(
                    economy =>
                        economy
                            .monetaryPolicyPressure
                )
            );

        /*
         * --------------------------------
         * CURRENCY FUNDAMENTALS
         * --------------------------------
         */
        const currencyFundamentals =
            this.weightedAverage(
                economies.map(
                    economy =>
                        economy
                            .currencyFundamentalScore
                )
            );

        /*
         * --------------------------------
         * MARKET FUNDAMENTALS
         * --------------------------------
         */
        const marketFundamentals =
            this.weightedAverage(
                economies.map(
                    economy =>
                        economy
                            .marketFundamentalScore
                )
            );

        /*
         * --------------------------------
         * US ECONOMY
         * --------------------------------
         *
         * The USD has a disproportionate
         * influence on global rates,
         * liquidity and risk conditions
         * in this simulation.
         */
        const usd =
            economic.economies.USD;

        const usdGrowth =
            usd?.growthScore ??
            0;

        const usdPolicy =
            usd?.monetaryPolicyPressure ??
            0;

        const usdInflation =
            usd?.inflationPressure ??
            0;

        /*
         * --------------------------------
         * BOND EFFECT
         * --------------------------------
         *
         * Growth + inflation + policy
         * create upward pressure on
         * sovereign yields.
         *
         * This is yield pressure,
         * not bond price.
         */
        const bonds =
            this.clamp(
                monetaryPolicy *
                0.45 +
                inflation *
                0.30 +
                growth *
                0.15 +
                usdPolicy *
                0.10,
                -1,
                1
            );

        /*
         * --------------------------------
         * CURRENCY EFFECT
         * --------------------------------
         *
         * Currency fundamentals are
         * primarily driven by relative
         * monetary policy and growth.
         */
        const currencies =
            this.clamp(
                currencyFundamentals *
                0.55 +
                monetaryPolicy *
                0.20 +
                growth *
                0.10 +
                (
                    usdPolicy -
                    usdInflation
                ) *
                0.15,
                -1,
                1
            );

        /*
         * --------------------------------
         * STOCK / MARKET EFFECT
         * --------------------------------
         */
        const markets =
            this.clamp(
                marketFundamentals *
                0.50 +
                growth *
                0.25 -
                inflation *
                0.10 -
                monetaryPolicy *
                0.15,
                -1,
                1
            );

        return {
            bonds,
            currencies,
            markets,
        };
    }
    /**
     * Bonds → Currencies.
     *
     * Higher short-term yield pressure
     * supports the currency.
     */
    private calculateBondEffect(
        bonds: CorrelationInput["bonds"]
    ): number {
        const shortTermYield =
            this.normalizeAround(
                bonds.us2yYield,
                4,
                4
            );

        const longTermYield =
            this.normalizeAround(
                bonds.us10yYield,
                4.5,
                4.5
            );

        const spread =
            this.normalizeAround(
                bonds.yieldSpread,
                -0.5,
                2
            );

        return this.clamp(
            this.weightedAverage([
                shortTermYield,
                longTermYield,
                spread,
            ]),
            -1,
            1
        );
    }

    /**
     * Sentiment → Markets.
     */
    private calculateSentimentEffect(
        sentiment: CorrelationInput["sentiment"]
    ): {
        stocks: number;
        commodities: number;
        currencies: number;
        nepal: number;
    } {
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

        const creditRisk =
            this.clamp(
                sentiment.creditRisk,
                0,
                1
            );

        const putCall =
            this.clamp(
                sentiment.putCallSentiment,
                -1,
                1
            );

        const cot =
            this.clamp(
                sentiment.cotPositioning,
                -1,
                1
            );

        /**
         * Stocks.
         */
        const stocks =
            this.clamp(
                this.weightedAverage([
                    fearGreed,
                    momentum,
                    breadth,
                    putCall,
                    -creditRisk,
                ]),
                -1,
                1
            );

        /**
         * Commodities.
         *
         * Momentum supports commodities,
         * while safe-haven demand can also
         * support defensive commodities.
         */
        const commodities =
            this.clamp(
                this.weightedAverage([
                    momentum,
                    cot,
                    safeHaven,
                    -creditRisk,
                ]),
                -1,
                1
            );

        /**
         * Currencies.
         *
         * Risk sentiment and positioning
         * influence currency pressure.
         */
        const riskCurrencyBasket =
            this.weightedAverage([
                momentum,
                fearGreed,
                breadth,
                cot,
            ]);

        const defensiveCurrencyBasket =
            this.weightedAverage([
                -momentum,
                -fearGreed,
                safeHaven,
                creditRisk,
            ]);

        /*
         * Aggregate currency effect.
         *
         * Risk-on:
         *   supports AUD/NZD/CAD and other
         *   cyclical currencies.
         *
         * Risk-off:
         *   supports defensive currencies.
         */
        const currencies =
            this.clamp(
                riskCurrencyBasket *
                0.60 +
                defensiveCurrencyBasket *
                0.40,
                -1,
                1
            );

        /**
         * Nepal.
         *
         * Nepal's market is represented as
         * another risk-sensitive market.
         */
        const nepal =
            this.clamp(
                this.weightedAverage([
                    fearGreed,
                    momentum,
                    breadth,
                    -creditRisk,
                ]),
                -1,
                1
            );

        return {
            stocks,
            commodities,
            currencies,
            nepal,
        };
    }

    /**
     * Cross-market relationships.
     *
     * This intentionally uses the CURRENT
     * market states only to calculate
     * relative pressure.
     */
    private calculateCrossMarketEffect(
        input: CorrelationInput
    ): {
        stocks: number;
        commodities: number;
        currencies: number;
        nepal: number;
    } {
        const stockMomentum =
            this.calculateMarketMomentum(
                input.markets
            );

        const commodityMomentum =
            this.calculateCommodityMomentum(
                input.markets
            );

        const currencyMomentum =
            this.calculateCurrencyMomentum(
                input.currencies
            );

        const nepalMomentum =
            this.calculateNepalMomentum(
                input.nepal
            );

        /**
         * Strong currency can create
         * pressure on international stocks.
         */
        const stocks =
            this.clamp(
                stockMomentum *
                0.60 +
                commodityMomentum *
                0.20 +
                -currencyMomentum *
                0.20,
                -1,
                1
            );


        /**
         * Commodities have some relationship
         * with global market momentum.
         */
        const commodities =
            this.clamp(
                commodityMomentum *
                0.65 +
                stockMomentum *
                0.20 +
                nepalMomentum *
                0.05,
                -1,
                1
            );

        /**
         * Currency pressure responds to
         * relative international market
         * strength.
         */
        const currencies =
            this.clamp(
                currencyMomentum *
                0.75 +
                -stockMomentum *
                0.10 +
                commodityMomentum *
                0.15,
                -1,
                1
            );
        /**
         * Nepal responds to international
         * market conditions.
         */
        const nepal =
            this.clamp(
                nepalMomentum *
                0.45 +
                stockMomentum *
                0.25 +
                commodityMomentum *
                0.10 +
                currencyMomentum *
                0.20,
                -1,
                1
            );

        return {
            stocks,
            commodities,
            currencies,
            nepal,
        };
    }

    /**
     * Nepal-specific correlation.
     */
    private calculateNepalEffect(
        nepal: CorrelationInput["nepal"]
    ): number {
        const liquidity =
            this.normalizeAround(
                nepal.economy.liquidity
                    .bankingLiquidity,
                100,
                100
            );

        const creditGrowth =
            this.normalizeAround(
                nepal.economy.liquidity
                    .creditGrowth,
                6,
                6
            );

        const economicActivity =
            this.normalizeAround(
                nepal.economy.economicActivity,
                100,
                100
            );

        const consumerDemand =
            this.normalizeAround(
                nepal.economy.consumerDemand,
                100,
                100
            );

        const inflation =
            this.normalizeAround(
                nepal.economy.inflation,
                5,
                5
            );

        const remittance =
            this.normalizeAround(
                nepal.remittance.growthRate,
                8,
                8
            );

        return this.clamp(
            this.weightedAverage([
                liquidity,
                creditGrowth,
                economicActivity,
                consumerDemand,
                -inflation,
                remittance,
            ]),
            -1,
            1
        );
    }

    /**
     * Calculate aggregate international
     * stock momentum.
     */
    private calculateMarketMomentum(
        market: CorrelationInput["markets"]
    ): number {
        const values =
            Object.values(
                market.indices
            );

        if (
            values.length === 0
        ) {
            return 0;
        }

        const changes =
            values.map(
                asset =>
                    this.normalizeRelative(
                        asset.value,
                        asset.ohlc.open
                    )
            );

        return this.clamp(
            this.average(changes),
            -1,
            1
        );
    }

    /**
     * Calculate aggregate commodity
     * momentum.
     */
    private calculateCommodityMomentum(
        market: CorrelationInput["markets"]
    ): number {
        const values =
            Object.values(
                market.commodities
            );

        if (
            values.length === 0
        ) {
            return 0;
        }

        const changes =
            values.map(
                asset =>
                    this.normalizeRelative(
                        asset.value,
                        asset.ohlc.open
                    )
            );

        return this.clamp(
            this.average(changes),
            -1,
            1
        );
    }

    /**
     * Calculate aggregate currency
     * momentum.
     */
    // private calculateCurrencyMomentum(
    //     currencies: CorrelationInput["currencies"]
    // ): number {
    //     const values =
    //         Object.values(
    //             currencies
    //         );

    //     if (
    //         values.length === 0
    //     ) {
    //         return 0;
    //     }

    //     const changes =
    //         values.map(
    //             currency =>
    //                 this.normalizeRelative(
    //                     currency.strength,
    //                     currency.ohlc.open
    //                 )
    //         );

    //     return this.clamp(
    //         this.average(changes),
    //         -1,
    //         1
    //     );
    // }

    private calculateCurrencyMomentum(
        currencies: CorrelationInput["currencies"]
    ): number {
        const usd =
            currencies.USD;

        if (!usd) {
            return 0;
        }

        const usdMove =
            this.normalizeRelative(
                usd.strength,
                usd.ohlc.open
            );

        const relativeMoves: number[] =
            [];

        for (
            const [
                currency,
                state,
            ] of Object.entries(
                currencies
            )
        ) {
            if (
                currency === "USD"
            ) {
                continue;
            }

            const currencyMove =
                this.normalizeRelative(
                    state.strength,
                    state.ohlc.open
                );

            /*
             * Positive means the foreign
             * currency outperformed USD.
             */
            relativeMoves.push(
                currencyMove -
                usdMove
            );
        }

        if (
            relativeMoves.length === 0
        ) {
            return 0;
        }

        return this.clamp(
            this.average(
                relativeMoves
            ),
            -1,
            1
        );
    }

    /**
     * Calculate Nepal market momentum.
     */
    private calculateNepalMomentum(
        nepal: CorrelationInput["nepal"]
    ): number {
        return this.normalizeRelative(
            nepal.nepseIndex,
            nepal.nepseOHLC.open
        );
    }

    /**
     * Normalize a value relative to
     * a reference value.
     */
    private normalizeAround(
        value: number,
        neutral: number,
        scale: number
    ): number {
        if (scale === 0) {
            return 0;
        }

        return this.clamp(
            (value - neutral) / scale,
            -1,
            1
        );
    }

    /**
     * Normalize relative movement.
     */
    private normalizeRelative(
        current: number,
        previous: number
    ): number {
        if (
            previous === 0
        ) {
            return 0;
        }

        return this.clamp(
            (
                (current - previous) /
                Math.abs(previous)
            ) * 10,
            -1,
            1
        );
    }

    /**
     * Weighted average with equal weights.
     */
    private weightedAverage(
        values: number[]
    ): number {
        if (
            values.length === 0
        ) {
            return 0;
        }

        const validValues =
            values.filter(
                value =>
                    Number.isFinite(value)
            );

        if (
            validValues.length === 0
        ) {
            return 0;
        }

        return this.average(
            validValues
        );
    }

    /**
     * Arithmetic average.
     */
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
                (sum, value) =>
                    sum + value,
                0
            ) /
            values.length
        );
    }

    /**
     * Clamp effect to [-1, +1].
     */
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

    /**
     * Align timestamp to a simulated second.
     */
    private alignToSecond(
        timestamp: number
    ): number {
        return (
            Math.floor(
                timestamp /
                ONE_SECOND
            ) *
            ONE_SECOND
        );
    }

    /**
     * Save correlation snapshot.
     */
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

    /**
     * Find latest snapshot at or before
     * the requested timestamp.
     */
    private findSnapshotAtOrBefore(
        timestamp: number
    ): CorrelationSnapshot | null {
        let result:
            | CorrelationSnapshot
            | null = null;

        for (
            const snapshot
            of this.history.values()
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

    /**
     * Clone correlation state.
     */
    private cloneState(
        state: CorrelationState
    ): CorrelationState {
        return {
            economic: {
                ...state.economic,
            },

            bonds: {
                ...state.bonds,
            },

            sentiment: {
                ...state.sentiment,
            },

            crossMarket: {
                ...state.crossMarket,
            },

            nepal: {
                ...state.nepal,
            },

            aggregate: {
                ...state.aggregate,
            },
        };
    }

    /**
     * Current correlation state.
     */
    getState(): CorrelationState {
        return this.cloneState(
            this.state
        );
    }

    /**
     * Complete correlation history.
     */
    getHistory():
        CorrelationSnapshot[] {
        return Array.from(
            this.history.values()
        ).sort(
            (a, b) =>
                a.timestamp -
                b.timestamp
        );
    }
}