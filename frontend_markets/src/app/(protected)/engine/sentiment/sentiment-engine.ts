import { SimulationClockState } from "../../clock/simulation-clock.types";

import {
    SentimentState,
    SentimentSnapshot,
} from "./sentiment.types";

import {
    INITIAL_SENTIMENT_STATE,
} from "./initial-sentiment-state";

const DAY_MS =
    24 * 60 * 60 * 1000;

export class SentimentEngine {
    private state: SentimentState;

    private history:
        Map<number, SentimentSnapshot>;

    private currentSimulationTime: number;

    constructor(
        initialTime: number,
        initialState:
            SentimentState =
            INITIAL_SENTIMENT_STATE
    ) {
        this.currentSimulationTime =
            initialTime;

        this.state =
            this.cloneState(
                initialState
            );

        this.history =
            new Map();

        this.saveSnapshot(
            initialTime
        );
    }

    /**
     * Main engine update.
     *
     * The engine follows the simulation
     * clock and supports both forward
     * and backward movement.
     */
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
     * Sentiment changes once per
     * simulated calendar day.
     */
    private processForward(
        targetTime: number
    ): void {
        let nextDay =
            this.getNextDay(
                this.currentSimulationTime
            );

        while (
            nextDay <= targetTime
        ) {
            const snapshot =
                this.history.get(
                    nextDay
                );

            if (snapshot) {
                /*
                 * Restore an existing deterministic
                 * snapshot instead of generating the
                 * state again.
                 */
                this.state =
                    this.cloneState(
                        snapshot.state
                    );
            } else {
                this.generateDailyUpdate(
                    nextDay
                );

                this.saveSnapshot(
                    nextDay
                );
            }

            nextDay += DAY_MS;
        }

        /*
         * Save the exact current simulation
         * state when it is between daily
         * boundaries.
         */
        this.saveSnapshot(
            targetTime
        );
    }

    /**
     * Process backward simulation.
     *
     * Restore the latest state snapshot
     * at or before the requested time.
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
     * Generate the sentiment update
     * for one simulated day.
     */
    private generateDailyUpdate(
        timestamp: number
    ): void {
        const seed =
            this.createSeed(
                timestamp
            );

        this.state.fearGreed =
            this.randomWalk(
                this.state.fearGreed,
                0.08,
                seed + 1,
                -1,
                1
            );

        this.state.volatility =
            this.randomWalk(
                this.state.volatility,
                0.05,
                seed + 2,
                0,
                1
            );

        this.state.momentum =
            this.randomWalk(
                this.state.momentum,
                0.10,
                seed + 3,
                -1,
                1
            );

        this.state.marketBreadth =
            this.randomWalk(
                this.state.marketBreadth,
                0.08,
                seed + 4,
                -1,
                1
            );

        this.state.safeHavenDemand =
            this.randomWalk(
                this.state.safeHavenDemand,
                0.06,
                seed + 5,
                0,
                1
            );

        this.state.creditRisk =
            this.randomWalk(
                this.state.creditRisk,
                0.05,
                seed + 6,
                0,
                1
            );

        this.state.putCallSentiment =
            this.randomWalk(
                this.state.putCallSentiment,
                0.08,
                seed + 7,
                -1,
                1
            );

        this.state.cotPositioning =
            this.randomWalk(
                this.state.cotPositioning,
                0.06,
                seed + 8,
                -1,
                1
            );
    }

    /**
     * Apply a bounded random walk.
     */
    private randomWalk(
        previous: number,
        maxChange: number,
        seed: number,
        min: number,
        max: number
    ): number {
        const random =
            this.seededRandom(
                seed
            );

        const change =
            (
                random * 2 -
                1
            ) *
            maxChange;

        return this.clamp(
            previous + change,
            min,
            max
        );
    }

    /**
     * Create deterministic seed from
     * the simulated calendar day.
     */
    private createSeed(
        timestamp: number
    ): number {
        const dayNumber =
            Math.floor(
                timestamp /
                DAY_MS
            );

        return Math.abs(
            Math.sin(
                dayNumber *
                12.9898
            ) *
            43758.5453
        ) *
            1_000_000;
    }

    /**
     * Deterministic pseudo-random value.
     */
    private seededRandom(
        seed: number
    ): number {
        const value =
            Math.sin(seed) *
            43758.5453123;

        return (
            value -
            Math.floor(value)
        );
    }

    /**
     * Get the beginning of the next
     * simulated calendar day.
     */
    private getNextDay(
        timestamp: number
    ): number {
        const dayStart =
            Math.floor(
                timestamp /
                DAY_MS
            ) *
            DAY_MS;

        return (
            dayStart +
            DAY_MS
        );
    }

    /**
     * Save an immutable snapshot of
     * the current sentiment state.
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
     * Find the latest snapshot at or
     * before the requested timestamp.
     */
    private findSnapshotAtOrBefore(
        timestamp: number
    ): SentimentSnapshot | null {
        let result:
            | SentimentSnapshot
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
     * Clone sentiment state so the
     * engine never exposes its internal
     * mutable state.
     */
    private cloneState(
        state: SentimentState
    ): SentimentState {
        return {
            fearGreed:
                state.fearGreed,

            volatility:
                state.volatility,

            momentum:
                state.momentum,

            marketBreadth:
                state.marketBreadth,

            safeHavenDemand:
                state.safeHavenDemand,

            creditRisk:
                state.creditRisk,

            putCallSentiment:
                state.putCallSentiment,

            cotPositioning:
                state.cotPositioning,
        };
    }

    /**
     * Clamp a value to a range.
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
     * Return a cloned current state.
     */
    getState(): SentimentState {
        return this.cloneState(
            this.state
        );
    }

    /**
     * Return cloned snapshot history.
     */
    getHistory():
        SentimentSnapshot[] {
        return Array.from(
            this.history.values()
        )
            .sort(
                (a, b) =>
                    a.timestamp -
                    b.timestamp
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
            );
    }
}