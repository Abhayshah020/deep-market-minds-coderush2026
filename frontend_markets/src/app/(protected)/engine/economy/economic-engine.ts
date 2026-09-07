import {
    SimulationClockState,
} from "../../clock/simulation-clock.types";

import {
    EconomicIndicatorSchedule,
    EconomicRegion,
    EconomicState,
    EconomicStateSnapshot,
    EconomyState,
} from "./economic-engine.types";

import {
    INITIAL_ECONOMIC_STATE,
} from "./initial-economic-state";

const DAY_MS =
    24 * 60 * 60 * 1000;

const MONTH_MS =
    30 * DAY_MS;

const QUARTER_MS =
    90 * DAY_MS;

const ECONOMIES:
    EconomicRegion[] = [
        "USD",
        "EUR",
        "GBP",
        "CAD",
        "AUD",
        "NZD",
        "CHF",
        "CNY",
        "INR",
        "JPY",
        "NPR",
    ];

interface EconomyBehavior {
    /*
     * Natural growth volatility.
     */
    growthVolatility: number;

    /*
     * Inflation volatility.
     */
    inflationVolatility: number;

    /*
     * Central bank response strength.
     */
    policySensitivity: number;

    /*
     * Risk sensitivity.
     */
    riskSensitivity: number;
}

const ECONOMY_BEHAVIOR:
    Record<
        EconomicRegion,
        EconomyBehavior
    > = {
    USD: {
        growthVolatility: 0.18,
        inflationVolatility: 0.10,
        policySensitivity: 0.30,
        riskSensitivity: 0.15,
    },

    EUR: {
        growthVolatility: 0.20,
        inflationVolatility: 0.09,
        policySensitivity: 0.25,
        riskSensitivity: 0.18,
    },

    GBP: {
        growthVolatility: 0.22,
        inflationVolatility: 0.12,
        policySensitivity: 0.28,
        riskSensitivity: 0.20,
    },

    CAD: {
        growthVolatility: 0.23,
        inflationVolatility: 0.12,
        policySensitivity: 0.25,
        riskSensitivity: 0.35,
    },

    AUD: {
        growthVolatility: 0.25,
        inflationVolatility: 0.12,
        policySensitivity: 0.24,
        riskSensitivity: 0.45,
    },

    NZD: {
        growthVolatility: 0.26,
        inflationVolatility: 0.13,
        policySensitivity: 0.24,
        riskSensitivity: 0.50,
    },

    CHF: {
        growthVolatility: 0.14,
        inflationVolatility: 0.06,
        policySensitivity: 0.20,
        riskSensitivity: -0.60,
    },

    CNY: {
        growthVolatility: 0.14,
        inflationVolatility: 0.07,
        policySensitivity: 0.22,
        riskSensitivity: 0.10,
    },

    INR: {
        growthVolatility: 0.30,
        inflationVolatility: 0.18,
        policySensitivity: 0.22,
        riskSensitivity: 0.25,
    },

    JPY: {
        growthVolatility: 0.16,
        inflationVolatility: 0.08,
        policySensitivity: 0.18,
        riskSensitivity: -0.45,
    },

    NPR: {
        growthVolatility: 0.35,
        inflationVolatility: 0.20,
        policySensitivity: 0.20,
        riskSensitivity: 0.25,
    },
};

export class EconomicEngine {
    private state: EconomicState;

    private schedules:
        EconomicIndicatorSchedule[];

    private history:
        Map<
            number,
            EconomicStateSnapshot
        >;

    private currentSimulationTime: number;

    constructor(
        initialTime: number,
        initialState:
            EconomicState =
            INITIAL_ECONOMIC_STATE
    ) {
        this.currentSimulationTime =
            initialTime;

        this.state =
            this.cloneState(
                initialState
            );

        this.schedules =
            this.createSchedules();

        this.history =
            new Map();

        this.recalculateDerivedState();

        this.saveSnapshot(
            initialTime
        );
    }

    private createSchedules():
        EconomicIndicatorSchedule[] {
        const schedules:
            EconomicIndicatorSchedule[] =
            [];

        for (
            const region of ECONOMIES
        ) {
            schedules.push(
                {
                    region,
                    indicator:
                        "inflation",
                    frequency:
                        "monthly",
                    lastUpdated:
                        null,
                },
                {
                    region,
                    indicator:
                        "employment",
                    frequency:
                        "monthly",
                    lastUpdated:
                        null,
                },
                {
                    region,
                    indicator:
                        "unemployment",
                    frequency:
                        "monthly",
                    lastUpdated:
                        null,
                },
                {
                    region,
                    indicator:
                        "pmi",
                    frequency:
                        "monthly",
                    lastUpdated:
                        null,
                },
                {
                    region,
                    indicator:
                        "retailSales",
                    frequency:
                        "monthly",
                    lastUpdated:
                        null,
                },
                {
                    region,
                    indicator:
                        "tradeBalance",
                    frequency:
                        "monthly",
                    lastUpdated:
                        null,
                },
                {
                    region,
                    indicator:
                        "consumerConfidence",
                    frequency:
                        "monthly",
                    lastUpdated:
                        null,
                },
                {
                    region,
                    indicator:
                        "gdp",
                    frequency:
                        "quarterly",
                    lastUpdated:
                        null,
                },
            );
        }

        /*
         * Interest rates are lower-frequency
         * policy events.
         */
        for (
            const region of ECONOMIES
        ) {
            schedules.push({
                region,
                indicator:
                    "interestRate",
                frequency:
                    "event",
                lastUpdated:
                    null,
            });
        }

        return schedules;
    }

    update(
        clock: SimulationClockState
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
                targetTime
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
        targetTime: number
    ): void {
        const previousTime =
            this.currentSimulationTime;

        /*
         * Advance every month that was
         * crossed rather than updating only
         * once at the final timestamp.
         */
        let nextMonth =
            this.getNextBoundary(
                previousTime,
                MONTH_MS
            );

        while (
            nextMonth <= targetTime
        ) {
            this.processMonthlyIndicators(
                nextMonth
            );

            nextMonth +=
                MONTH_MS;
        }

        let nextQuarter =
            this.getNextBoundary(
                previousTime,
                QUARTER_MS
            );

        while (
            nextQuarter <=
            targetTime
        ) {
            this.processQuarterlyIndicators(
                nextQuarter
            );

            nextQuarter +=
                QUARTER_MS;
        }

        /*
         * Slow monetary-policy drift.
         *
         * This does NOT mean central banks
         * literally change rates every tick.
         * It creates a changing policy path
         * that can later be replaced by
         * explicit rate decisions/events.
         */
        this.updatePolicyRegimes(
            targetTime
        );

        this.updateGlobalEconomy();

        this.recalculateDerivedState();

        this.saveSnapshot(
            targetTime
        );
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

        this.restoreSnapshot(
            snapshot
        );
    }

    private processMonthlyIndicators(
        currentTime: number
    ): void {
        for (
            const region of ECONOMIES
        ) {
            const economy =
                this.state.economies[
                region
                ];

            const behavior =
                ECONOMY_BEHAVIOR[
                region
                ];

            /*
             * Inflation has persistence:
             * current inflation is influenced
             * by previous inflation rather
             * than being pure random noise.
             */
            const inflationShock =
                this.noise(
                    currentTime,
                    region,
                    1
                ) *
                behavior
                    .inflationVolatility;

            economy.inflation =
                this.clamp(
                    economy.inflation +
                    (
                        economy
                            .growthScore *
                        0.05
                    ) +
                    inflationShock,
                    0,
                    20
                );

            /*
             * PMI reverts toward 50.
             */
            const pmiShock =
                this.noise(
                    currentTime,
                    region,
                    2
                ) *
                1.2;

            economy.pmi =
                this.clamp(
                    economy.pmi +
                    (
                        50 -
                        economy.pmi
                    ) *
                    0.08 +
                    pmiShock,
                    35,
                    65
                );

            /*
             * Employment tracks growth.
             */
            const employmentShock =
                this.noise(
                    currentTime,
                    region,
                    3
                ) *
                0.002;

            economy.employment =
                Math.max(
                    0,
                    economy.employment *
                    (
                        1 +
                        (
                            economy
                                .growthScore *
                            0.001
                        ) +
                        employmentShock
                    )
                );

            /*
             * Unemployment tends to move
             * opposite to growth.
             */
            economy.unemployment =
                this.clamp(
                    economy.unemployment +
                    (
                        -economy
                            .growthScore *
                        0.08
                    ) +
                    this.noise(
                        currentTime,
                        region,
                        4
                    ) *
                    0.08,
                    1,
                    25
                );

            /*
             * Retail consumption.
             */
            economy.retailSalesGrowth +=
                (
                    economy
                        .growthScore *
                    0.10
                ) +
                this.noise(
                    currentTime,
                    region,
                    5
                ) *
                0.20;

            economy.retailSalesGrowth =
                this.clamp(
                    economy
                        .retailSalesGrowth,
                    -10,
                    15
                );

            /*
             * Trade balance changes with
             * domestic demand and external
             * conditions.
             */
            economy.tradeBalance +=
                this.noise(
                    currentTime,
                    region,
                    6
                ) *
                2_000_000_000;

            /*
             * Confidence follows growth,
             * inflation and employment.
             */
            economy.consumerConfidence +=
                (
                    economy
                        .growthScore *
                    1.2
                ) -
                (
                    Math.max(
                        0,
                        economy
                            .inflation -
                        2
                    ) *
                    0.30
                ) +
                this.noise(
                    currentTime,
                    region,
                    7
                ) *
                1.2;

            economy.consumerConfidence =
                this.clamp(
                    economy
                        .consumerConfidence,
                    50,
                    150
                );
        }
    }

    private processQuarterlyIndicators(
        currentTime: number
    ): void {
        for (
            const region of ECONOMIES
        ) {
            const economy =
                this.state.economies[
                region
                ];

            const behavior =
                ECONOMY_BEHAVIOR[
                region
                ];

            const shock =
                this.noise(
                    currentTime,
                    region,
                    20
                ) *
                behavior
                    .growthVolatility;

            /*
             * GDP has persistence.
             */
            economy.gdpGrowth =
                this.clamp(
                    economy.gdpGrowth +
                    shock +
                    (
                        economy.pmi -
                        50
                    ) *
                    0.035 -
                    Math.max(
                        0,
                        economy
                            .inflation -
                        4
                    ) *
                    0.04,
                    -8,
                    12
                );
        }
    }

    private updatePolicyRegimes(
        currentTime: number
    ): void {
        /*
         * Simulate gradual expectations around
         * monetary policy.
         *
         * Higher inflation:
         *     upward policy pressure
         *
         * Weak growth:
         *     downward policy pressure
         */
        for (
            const region of ECONOMIES
        ) {
            const economy =
                this.state.economies[
                region
                ];

            const behavior =
                ECONOMY_BEHAVIOR[
                region
                ];

            const inflationPressure =
                this.clamp(
                    (
                        economy
                            .inflation -
                        2.5
                    ) /
                    2.5,
                    -1,
                    1
                );

            const growthPressure =
                this.clamp(
                    economy
                        .gdpGrowth /
                    4,
                    -1,
                    1
                );

            const desiredRate =
                this.getPolicyNeutralRate(
                    region
                ) +
                inflationPressure *
                1.25 +
                growthPressure *
                0.75;

            const adjustment =
                (
                    desiredRate -
                    economy.interestRate
                ) *
                behavior
                    .policySensitivity *
                0.03;

            /*
             * Tiny deterministic policy drift.
             */
            const noise =
                this.noise(
                    currentTime,
                    region,
                    30
                ) *
                0.005;

            economy.interestRate =
                this.clamp(
                    economy.interestRate +
                    adjustment +
                    noise,
                    0,
                    20
                );
        }
    }

    // private updateGlobalEconomy(): void {
    //     const economies =
    //         Object.values(
    //             this.state.economies
    //         );

    //     const growth =
    //         this.average(
    //             economies.map(
    //                 economy =>
    //                     economy.gdpGrowth
    //             )
    //         );

    //     const inflation =
    //         this.average(
    //             economies.map(
    //                 economy =>
    //                     economy.inflation
    //             )
    //         );

    //     const risk =
    //         this.average(
    //             economies.map(
    //                 economy =>
    //                     economy
    //                         .riskSensitivity *
    //                     economy
    //                         .growthScore
    //             )
    //         );

    //     this.state.global
    //         .globalGrowth =
    //         growth;

    //     this.state.global
    //         .globalInflation =
    //         inflation;

    //     this.state.global
    //         .riskAppetite =
    //         this.clamp(
    //             risk,
    //             -1,
    //             1
    //         );

    //     this.state.global
    //         .commodityDemand =
    //         this.clamp(
    //             (
    //                 growth -
    //                 2
    //             ) /
    //             3,
    //             -1,
    //             1
    //         );

    //     /*
    //      * Positive growth usually supports
    //      * liquidity/risk conditions.
    //      */
    //     this.state.global
    //         .globalLiquidity =
    //         this.clamp(
    //             (
    //                 growth -
    //                 inflation
    //             ) /
    //             5,
    //             -1,
    //             1
    //         );
    // }

    private updateGlobalEconomy(): void {
        const economies =
            Object.values(
                this.state.economies
            );

        const growth =
            this.average(
                economies.map(
                    economy =>
                        economy.gdpGrowth
                )
            );

        const inflation =
            this.average(
                economies.map(
                    economy =>
                        economy.inflation
                )
            );

        /*
         * Risk appetite is derived from
         * each economy's growth condition
         * multiplied by its configured
         * risk sensitivity.
         *
         * riskSensitivity is a model parameter,
         * not part of EconomyState.
         */
        const risk =
            this.average(
                ECONOMIES.map(
                    region => {
                        const economy =
                            this.state
                                .economies[
                            region
                            ];

                        const behavior =
                            ECONOMY_BEHAVIOR[
                            region
                            ];

                        return (
                            behavior
                                .riskSensitivity *
                            economy
                                .growthScore
                        );
                    }
                )
            );

        /*
         * Global state.
         */
        this.state.global =
        {
            globalGrowth:
                growth,

            globalInflation:
                inflation,

            riskAppetite:
                this.clamp(
                    risk,
                    -1,
                    1
                ),

            commodityDemand:
                this.clamp(
                    (
                        growth -
                        2
                    ) / 3,
                    -1,
                    1
                ),

            globalLiquidity:
                this.clamp(
                    (
                        growth -
                        inflation
                    ) / 5,
                    -1,
                    1
                ),
        };
    }

    /**
     * Calculate derived factors for each
     * individual economy.
     */
    private recalculateDerivedState(): void {
        for (
            const region of ECONOMIES
        ) {
            const economy =
                this.state.economies[
                region
                ];

            const inflationPressure =
                this.clamp(
                    (
                        economy
                            .inflation -
                        2.5
                    ) /
                    3,
                    -1,
                    1
                );

            const growthScore =
                this.calculateGrowthScore(
                    economy
                );

            const monetaryPolicyPressure =
                this.calculateMonetaryPolicyScore(
                    economy
                );

            /*
             * Currency fundamentals:
             *
             * Growth
             * + monetary policy
             * + external balance
             * - excessive inflation
             */
            const currencyFundamentalScore =
                this.clamp(
                    growthScore *
                    0.35 +
                    monetaryPolicyPressure *
                    0.40 +
                    this.calculateTradeScore(
                        economy
                    ) *
                    0.15 -
                    inflationPressure *
                    0.10,
                    -1,
                    1
                );

            /*
             * Equity/market fundamentals:
             *
             * Growth
             * + PMI
             * + confidence
             * + consumption
             * - inflation
             * - restrictive policy
             */
            const marketFundamentalScore =
                this.clamp(
                    growthScore *
                    0.30 +
                    this.normalizeAround(
                        economy.pmi,
                        50,
                        10
                    ) *
                    0.20 +
                    this.normalizeAround(
                        economy
                            .consumerConfidence,
                        100,
                        30
                    ) *
                    0.15 +
                    this.clamp(
                        economy
                            .retailSalesGrowth /
                        5,
                        -1,
                        1
                    ) *
                    0.15 -
                    inflationPressure *
                    0.10 -
                    monetaryPolicyPressure *
                    0.10,
                    -1,
                    1
                );

            economy.growthScore =
                growthScore;

            economy.inflationPressure =
                inflationPressure;

            economy.monetaryPolicyPressure =
                monetaryPolicyPressure;

            economy.currencyFundamentalScore =
                currencyFundamentalScore;

            economy.marketFundamentalScore =
                marketFundamentalScore;
        }
    }

    private calculateGrowthScore(
        economy: EconomyState
    ): number {
        const gdp =
            this.normalizeAround(
                economy.gdpGrowth,
                2,
                4
            );

        const pmi =
            this.normalizeAround(
                economy.pmi,
                50,
                10
            );

        const unemployment =
            this.normalizeAround(
                economy.unemployment,
                5,
                5
            );

        const confidence =
            this.normalizeAround(
                economy.consumerConfidence,
                100,
                30
            );

        return this.clamp(
            gdp * 0.35 +
            pmi * 0.30 +
            confidence * 0.20 -
            unemployment * 0.15,
            -1,
            1
        );
    }

    private calculateMonetaryPolicyScore(
        economy: EconomyState
    ): number {
        const rate =
            this.normalizeAround(
                economy.interestRate,
                3,
                3
            );

        const inflationGap =
            this.normalizeAround(
                economy.inflation,
                2.5,
                3
            );

        /*
         * Rate itself supports currency,
         * but excessive inflation represents
         * an economic problem.
         */
        return this.clamp(
            rate * 0.70 +
            inflationGap * 0.30,
            -1,
            1
        );
    }

    private calculateTradeScore(
        economy: EconomyState
    ): number {
        /*
         * Normalize trade balance using
         * the scale of the economy-independent
         * simulation rather than allowing huge
         * numbers to dominate.
         */
        return this.clamp(
            economy.tradeBalance /
            100_000_000_000,
            -1,
            1
        );
    }

    private getPolicyNeutralRate(
        region: EconomicRegion
    ): number {
        switch (region) {
            case "USD":
                return 3.00;

            case "EUR":
                return 2.00;

            case "GBP":
                return 3.00;

            case "CAD":
                return 2.50;

            case "AUD":
                return 3.00;

            case "NZD":
                return 3.00;

            case "CHF":
                return 1.00;

            case "CNY":
                return 2.75;

            case "INR":
                return 5.50;

            case "JPY":
                return 0.50;

            case "NPR":
                return 5.00;
        }
    }

    /**
     * Deterministic normally-distributed-ish
     * noise.
     */
    private noise(
        timestamp: number,
        region: EconomicRegion,
        channel: number
    ): number {
        const regionIndex =
            ECONOMIES.indexOf(
                region
            );

        const seed =
            Math.floor(
                timestamp /
                DAY_MS
            ) *
            1009 +
            regionIndex *
            7919 +
            channel *
            31337 +
            73;

        const u1 =
            Math.max(
                0.000001,
                this.random(
                    seed
                )
            );

        const u2 =
            this.random(
                seed + 1
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

    private random(
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

    private normalizeAround(
        value: number,
        neutral: number,
        scale: number
    ): number {
        if (
            scale === 0
        ) {
            return 0;
        }

        return this.clamp(
            (
                value -
                neutral
            ) /
            scale,
            -1,
            1
        );
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
                (
                    total,
                    value
                ) =>
                    total + value,
                0
            ) /
            values.length
        );
    }

    private getNextBoundary(
        timestamp: number,
        interval: number
    ): number {
        return (
            Math.floor(
                timestamp /
                interval
            ) *
            interval +
            interval
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

                schedules:
                    this.schedules.map(
                        schedule => ({
                            ...schedule,
                        })
                    ),
            }
        );
    }

    private findSnapshotAtOrBefore(
        timestamp: number
    ):
        | EconomicStateSnapshot
        | null {
        let result:
            | EconomicStateSnapshot
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

    private restoreSnapshot(
        snapshot:
            EconomicStateSnapshot
    ): void {
        this.state =
            this.cloneState(
                snapshot.state
            );

        this.schedules =
            snapshot.schedules.map(
                schedule => ({
                    ...schedule,
                })
            );
    }

    private cloneState(
        state: EconomicState
    ): EconomicState {
        const economies =
            {} as EconomicState[
            "economies"
            ];

        for (
            const region of ECONOMIES
        ) {
            economies[region] = {
                ...state.economies[
                region
                ],
            };
        }

        return {
            global: {
                ...state.global,
            },

            economies,
        };
    }

    getState(): EconomicState {
        return this.cloneState(
            this.state
        );
    }

    getHistory():
        EconomicStateSnapshot[] {
        return Array.from(
            this.history.values()
        ).sort(
            (a, b) =>
                a.timestamp -
                b.timestamp
        );
    }
}