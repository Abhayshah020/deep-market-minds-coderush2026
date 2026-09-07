import {
    SimulationClockState,
} from "../../clock/simulation-clock.types";

import {
    NepalCompanyState,
    NepalMarketSnapshot,
    NepalMarketState,
} from "./nepal-engine.types";

import {
    INITIAL_NEPAL_MARKET_STATE,
} from "./initial-nepal-market-state";

import {
    NepalCorrelationInput,
} from "./nepal-engine.types";

const MINUTE_MS =
    60 * 1000;

const DAY_MS =
    24 * 60 * MINUTE_MS;

export class NepalMarketEngine {
    private state: NepalMarketState;

    private history:
        Map<number, NepalMarketSnapshot>;

    private currentSimulationTime: number;

    private correlationInput: NepalCorrelationInput;

    constructor(
        initialTime: number,

        initialState:
            NepalMarketState =
            INITIAL_NEPAL_MARKET_STATE,

        correlationInput:
            NepalCorrelationInput = {
                globalMarketInfluence: 0,
                currencyInfluence: 0,
                bondInfluence: 0,
                economicInfluence: 0,
                newsInfluence: 0,
            }
    ) {
        this.currentSimulationTime =
            initialTime;

        this.state =
            this.cloneState(
                initialState
            );

        this.correlationInput =
        {
            ...correlationInput,
        };

        this.history =
            new Map();

        this.saveSnapshot(
            initialTime
        );
    }

    /**
 * Update correlation-driven inputs.
 *
 * The correlation engine calculates these
 * relationships. Nepal Market Engine only
 * consumes the resulting influence values.
 */
    setCorrelationInput(
        input: NepalCorrelationInput
    ): void {
        this.correlationInput = {
            ...input,
        };
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

        const elapsed =
            targetTime -
            previousTime;

        if (elapsed <= 0) {
            return;
        }

        /*
         * Continuous NEPSE movement.
         */
        this.updateNEPSE(
            previousTime,
            targetTime
        );

        /*
         * Continuous company movement.
         */
        this.state.companies =
            this.state.companies.map(
                (
                    company,
                    index
                ) =>
                    this.updateCompany(
                        company,
                        previousTime,
                        targetTime,
                        index
                    )
            );

        /*
         * Daily economic conditions.
         */
        if (
            this.crossedDay(
                previousTime,
                targetTime
            )
        ) {
            this.updateDailyEconomy(
                targetTime
            );
        }

        /*
         * Monthly remittance.
         */
        if (
            this.crossedMonth(
                previousTime,
                targetTime
            )
        ) {
            this.updateMonthlyRemittance(
                targetTime
            );
        }

        this.saveSnapshot(
            targetTime
        );
    }

    /**
     * Continuous NEPSE movement.
     */
    private updateNEPSE(
        previousTime: number,
        currentTime: number
    ): void {
        const elapsed =
            currentTime -
            previousTime;

        const seed =
            this.createSeed(
                currentTime,
                100
            );

        const noise =
            this.random(seed) -
            0.5;

        const demand =
            100 +
            (
                this.random(
                    seed + 1
                ) -
                0.5
            ) *
            20;

        const supply =
            100 +
            (
                this.random(
                    seed + 2
                ) -
                0.5
            ) *
            20;

        const pressure =
            (
                demand -
                supply
            ) /
            100;

        const timeFactor =
            elapsed /
            DAY_MS;

        const correlationInfluence =
            (
                this.correlationInput
                    .globalMarketInfluence +

                this.correlationInput
                    .currencyInfluence +

                this.correlationInput
                    .bondInfluence +

                this.correlationInput
                    .economicInfluence +

                this.correlationInput
                    .newsInfluence
            ) / 5;

        const movement =
            (
                pressure * 0.02 +
                noise * 0.01 +
                correlationInfluence * 0.02
            ) *
            timeFactor;

        const previous =
            this.state.nepseIndex;

        const next =
            Math.max(
                0,
                previous *
                (
                    1 +
                    movement
                )
            );

        this.state.nepseIndex =
            next;

        this.state.nepseOHLC =
            this.updateOHLC(
                this.state.nepseOHLC,
                next
            );
    }

    /**
     * Continuous company movement.
     */
    private updateCompany(
        company: NepalCompanyState,
        previousTime: number,
        currentTime: number,
        index: number
    ): NepalCompanyState {
        const elapsed =
            currentTime -
            previousTime;

        const seed =
            this.createSeed(
                currentTime,
                200 + index
            );

        const demand =
            100 +
            (
                this.random(
                    seed
                ) -
                0.5
            ) *
            20;

        const supply =
            100 +
            (
                this.random(
                    seed + 1
                ) -
                0.5
            ) *
            20;

        const pressure =
            (
                demand -
                supply
            ) /
            100;

        const noise =
            this.random(
                seed + 2
            ) -
            0.5;

        const timeFactor =
            elapsed /
            DAY_MS;

        const correlationInfluence =
            (
                this.correlationInput
                    .globalMarketInfluence +

                this.correlationInput
                    .currencyInfluence +

                this.correlationInput
                    .bondInfluence +

                this.correlationInput
                    .economicInfluence +

                this.correlationInput
                    .newsInfluence
            ) / 5;

        const movement =
            (
                pressure * 0.025 +
                noise * 0.01 +
                correlationInfluence * 0.025
            ) *
            timeFactor;

        const next =
            Math.max(
                0,
                company.value *
                (
                    1 +
                    movement
                )
            );

        return {
            ...company,

            value: next,

            supply:
                company.supply *
                0.9 +
                supply *
                0.1,

            demand:
                company.demand *
                0.9 +
                demand *
                0.1,

            ohlc:
                this.updateOHLC(
                    company.ohlc,
                    next
                ),
        };
    }

    /**
     * Daily Nepal economic conditions.
     */
    private updateDailyEconomy(
        timestamp: number
    ): void {
        const seed =
            this.createSeed(
                timestamp,
                300
            );

        const liquidityChange =
            (
                this.random(
                    seed
                ) -
                0.5
            ) *
            2;

        const creditChange =
            (
                this.random(
                    seed + 1
                ) -
                0.5
            ) *
            0.4;

        const inflationChange =
            (
                this.random(
                    seed + 2
                ) -
                0.5
            ) *
            0.1;

        this.state.economy.liquidity
            .bankingLiquidity +=
            liquidityChange;

        this.state.economy.liquidity
            .creditGrowth +=
            creditChange;

        this.state.economy.inflation +=
            inflationChange;

        this.state.economy.liquidity
            .bankingLiquidity =
            this.clamp(
                this.state.economy.liquidity
                    .bankingLiquidity,
                0,
                200
            );

        this.state.economy
            .economicActivity +=
            (
                this.random(
                    seed + 3
                ) -
                0.5
            );

        this.state.economy
            .consumerDemand +=
            (
                this.random(
                    seed + 4
                ) -
                0.5
            );

        this.state.economy
            .economicActivity =
            this.clamp(
                this.state.economy
                    .economicActivity,
                0,
                200
            );

        this.state.economy
            .consumerDemand =
            this.clamp(
                this.state.economy
                    .consumerDemand,
                0,
                200
            );
    }

    /**
     * Monthly remittance update.
     */
    private updateMonthlyRemittance(
        timestamp: number
    ): void {
        const seed =
            this.createSeed(
                timestamp,
                400
            );

        const growth =
            (
                this.random(
                    seed
                ) -
                0.5
            ) *
            4;

        this.state.remittance
            .growthRate +=
            growth;

        this.state.remittance
            .growthRate =
            this.clamp(
                this.state.remittance
                    .growthRate,
                -20,
                30
            );

        const monthly =
            this.state.remittance
                .monthlyInflow *
            (
                1 +
                this.state.remittance
                    .growthRate /
                100
            );

        this.state.remittance
            .monthlyInflow =
            Math.max(
                0,
                monthly
            );

        this.state.remittance
            .annualInflow =
            this.state.remittance
                .monthlyInflow *
            12;
    }

    private updateOHLC(
        previous: {
            open: number;
            high: number;
            low: number;
            close: number;
        },
        price: number
    ) {
        return {
            open: previous.open,

            high: Math.max(
                previous.high,
                price
            ),

            low: Math.min(
                previous.low,
                price
            ),

            close: price,
        };
    }

    private crossedDay(
        previous: number,
        current: number
    ): boolean {
        return (
            Math.floor(
                previous /
                DAY_MS
            ) !==
            Math.floor(
                current /
                DAY_MS
            )
        );
    }

    private crossedMonth(
        previous: number,
        current: number
    ): boolean {
        const previousDate =
            new Date(previous);

        const currentDate =
            new Date(current);

        return (
            previousDate.getUTCFullYear() !==
            currentDate.getUTCFullYear() ||
            previousDate.getUTCMonth() !==
            currentDate.getUTCMonth()
        );
    }

    private createSeed(
        timestamp: number,
        index: number
    ): number {
        const minute =
            Math.floor(
                timestamp /
                MINUTE_MS
            );

        return (
            minute * 1009 +
            index * 37 +
            173
        );
    }

    private random(
        seed: number
    ): number {
        const value =
            Math.sin(
                seed * 12.9898
            ) *
            43758.5453;

        return (
            value -
            Math.floor(value)
        );
    }

    private clamp(
        value: number,
        min: number,
        max: number
    ): number {
        return Math.max(
            min,
            Math.min(
                max,
                value
            )
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
            }
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

        this.state =
            this.cloneState(
                snapshot.state
            );
    }

    private findSnapshotAtOrBefore(
        timestamp: number
    ): NepalMarketSnapshot | null {
        let result:
            | NepalMarketSnapshot
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
        state: NepalMarketState
    ): NepalMarketState {
        return {
            nepseIndex:
                state.nepseIndex,

            nepseOHLC: {
                ...state.nepseOHLC,
            },

            remittance: {
                ...state.remittance,
            },

            economy: {
                ...state.economy,

                liquidity: {
                    ...state.economy
                        .liquidity,
                },
            },

            companies:
                state.companies.map(
                    (company) => ({
                        ...company,

                        ohlc: {
                            ...company.ohlc,
                        },
                    })
                ),
        };
    }

    getState(): NepalMarketState {
        return this.cloneState(
            this.state
        );
    }

    getHistory():
        NepalMarketSnapshot[] {
        return Array.from(
            this.history.values()
        ).sort(
            (a, b) =>
                a.timestamp -
                b.timestamp
        );
    }
}