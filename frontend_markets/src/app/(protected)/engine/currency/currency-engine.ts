import { SimulationClockState } from "../../clock/simulation-clock.types";

import {
    CurrencyCode,
    CurrencyOHLC,
    CurrencySnapshot,
    CurrencyState,
} from "./currency-engine.types";

import {
    INITIAL_CURRENCY_STATE,
} from "./initial-currency-state";

const DAY_MS =
    24 * 60 * 60 * 1000;

const MINUTE_MS =
    60 * 1000;

/*
 * Generate one market price sample
 * every simulated minute.
 */
const CURRENCY_TICK_MS =
    MINUTE_MS;

const CURRENCIES: CurrencyCode[] = [
    "EUR",
    "USD",
    "CHF",
    "CNY",
    "INR",
    "NPR",
    "JPY",
    "NZD",
    "AUD",
    "CAD",
    "GBP",
];

export class CurrencyEngine {
    private state: CurrencyState;

    private history: Map<
        number,
        CurrencySnapshot
    >;

    private currentSimulationTime: number;

    constructor(
        initialTime: number,
        initialState:
            CurrencyState =
            INITIAL_CURRENCY_STATE
    ) {
        this.currentSimulationTime =
            initialTime;

        this.state =
            this.cloneState(
                initialState
            );

        this.history = new Map();

        this.saveSnapshot(
            initialTime
        );
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

    /**
     * Process forward simulation.
     *
     * Currency prices now update every
     * simulated minute instead of once
     * per simulated day.
     */
    private processForward(
        targetTime: number
    ): void {
        let nextTick =
            this.getNextTick(
                this.currentSimulationTime
            );

        while (
            nextTick <= targetTime
        ) {
            const existingSnapshot =
                this.history.get(
                    nextTick
                );

            if (
                existingSnapshot
            ) {
                this.state =
                    this.cloneState(
                        existingSnapshot.state
                    );
            } else {
                this.generatePriceUpdate(
                    nextTick
                );

                this.saveSnapshot(
                    nextTick
                );
            }

            nextTick +=
                CURRENCY_TICK_MS;
        }

        /*
         * Save exact simulation time.
         *
         * This means the other engines can
         * still move at arbitrary simulation
         * timestamps while currency history
         * remains sampled at one-minute
         * intervals.
         */
        this.saveSnapshot(
            targetTime
        );
    }

    /**
     * Process backward simulation.
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
     * Generate one deterministic
     * intraday price sample for every
     * currency.
     *
     * The previous close becomes the
     * new open.
     *
     * Then we introduce small deterministic
     * movement for close/high/low.
     */
    private generatePriceUpdate(
        timestamp: number
    ): void {
        for (
            let i = 0;
            i < CURRENCIES.length;
            i++
        ) {
            const currency =
                CURRENCIES[i];

            const previous =
                this.state[currency];

            const seed =
                this.createSeed(
                    timestamp,
                    i
                );

            const open =
                previous.ohlc.close;

            /*
             * --------------------------------
             * Intraday movement
             * --------------------------------
             *
             * Around +/- 0.04% per minute.
             *
             * The movement is relative to
             * the current price so that:
             *
             * EUR/USD
             * USD/JPY
             * USD/INR
             *
             * all receive appropriately sized
             * price movements.
             */
            const volatility =
                0.0004;

            const directionalNoise =
                this.seededRandom(
                    seed
                ) * 2 -
                1;

            const drift =
                this.seededRandom(
                    seed + 1
                ) * 0.0001 -
                0.00005;

            const percentageMove =
                directionalNoise *
                volatility +
                drift;

            let close =
                open *
                (1 +
                    percentageMove);

            close =
                this.clamp(
                    close,
                    0.000001,
                    Infinity
                );

            /*
             * --------------------------------
             * High / Low wick noise
             * --------------------------------
             *
             * These are intentionally
             * independent from the close
             * movement so candles have
             * visible wicks.
             */
            const upperNoise =
                this.seededRandom(
                    seed + 2
                ) * 0.00025;

            const lowerNoise =
                this.seededRandom(
                    seed + 3
                ) * 0.00025;

            const high =
                Math.max(
                    open,
                    close
                ) *
                (100 +
                    upperNoise);

            const low =
                Math.max(
                    0.000001,
                    Math.min(
                        open,
                        close
                    ) *
                    (100 -
                        lowerNoise)
                );

            const ohlc: CurrencyOHLC = {
                open,
                high,
                low,
                close,
            };

            this.state[currency] = {
                currency,

                /*
                 * Strength currently follows
                 * the latest price.
                 *
                 * Later this can become a
                 * normalized currency-strength
                 * calculation based on economic
                 * factors.
                 */
                strength: close,

                ohlc,
            };
        }
    }

    /**
     * Create deterministic seed for a
     * particular currency and timestamp.
     */
    private createSeed(
        timestamp: number,
        currencyIndex: number
    ): number {
        /*
         * Use minutes instead of days so
         * every intraday sample receives
         * a different deterministic seed.
         */
        const minuteNumber =
            Math.floor(
                timestamp /
                MINUTE_MS
            );

        return (
            minuteNumber * 1009 +
            currencyIndex * 131 +
            73
        );
    }

    /**
     * Deterministic random number
     * between 0 and 1.
     */
    private seededRandom(
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

    /**
     * Get beginning of the next
     * currency update interval.
     */
    private getNextTick(
        timestamp: number
    ): number {
        const tickStart =
            Math.floor(
                timestamp /
                CURRENCY_TICK_MS
            ) *
            CURRENCY_TICK_MS;

        return (
            tickStart +
            CURRENCY_TICK_MS
        );
    }

    /**
     * Save complete currency state.
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
     * Find latest snapshot at
     * or before requested time.
     */
    private findSnapshotAtOrBefore(
        timestamp: number
    ): CurrencySnapshot | null {
        let result:
            | CurrencySnapshot
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

    /**
     * Deep clone currency state.
     */
    private cloneState(
        state: CurrencyState
    ): CurrencyState {
        const cloned =
            {} as CurrencyState;

        for (
            const currency of
            CURRENCIES
        ) {
            cloned[currency] = {
                currency,

                strength:
                    state[currency]
                        .strength,

                ohlc: {
                    open:
                        state[currency]
                            .ohlc
                            .open,

                    high:
                        state[currency]
                            .ohlc
                            .high,

                    low:
                        state[currency]
                            .ohlc
                            .low,

                    close:
                        state[currency]
                            .ohlc
                            .close,
                },
            };
        }

        return cloned;
    }

    /**
     * Keep value inside range.
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

    getState(): CurrencyState {
        return this.cloneState(
            this.state
        );
    }

    getHistory():
        CurrencySnapshot[] {
        return Array.from(
            this.history.values()
        )
            .map(
                (snapshot) => ({
                    timestamp:
                        snapshot.timestamp,

                    state:
                        this.cloneState(
                            snapshot.state
                        ),
                })
            )
            .sort(
                (a, b) =>
                    a.timestamp -
                    b.timestamp
            );
    }
}