import { SimulationClockState } from "../../clock/simulation-clock.types";

import {
    BondState,
    BondStateSnapshot,
} from "./bond-engine.types";

import {
    INITIAL_BOND_STATE,
} from "./initial-bond-state";

const ONE_SECOND =
    1_000;

const SNAPSHOT_INTERVAL =
    60 * ONE_SECOND;

const MAX_HISTORY_SNAPSHOTS =
    10_000;

export class BondEngine {
    private state: BondState;

    private currentSimulationTime: number;

    private history:
        Map<
            number,
            BondStateSnapshot
        >;

    constructor(
        initialTime: number,

        initialState:
            BondState =
            INITIAL_BOND_STATE
    ) {
        this.currentSimulationTime =
            this.alignToSecond(
                initialTime
            );

        this.state =
            this.cloneState(
                initialState
            );

        this.recalculateSpread();

        this.history =
            new Map();

        this.saveSnapshot(
            this.currentSimulationTime
        );
    }

    /**
     * Main engine update.
     *
     * The engine follows the
     * simulation clock and supports
     * both forward and backward
     * movement.
     */
    update(
        clock: SimulationClockState
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
     * Bond market updates once
     * per simulated second.
     */
    private processForward(
        targetTime: number
    ): void {
        let simulationTime =
            this.currentSimulationTime;

        while (
            simulationTime <
            targetTime
        ) {
            simulationTime +=
                ONE_SECOND;

            const existingSnapshot =
                this.history.get(
                    simulationTime
                );

            /*
             * If this timestamp was
             * already simulated, restore
             * the previous deterministic
             * state instead of generating
             * a different state.
             */
            if (
                existingSnapshot
            ) {
                this.state =
                    this.cloneState(
                        existingSnapshot.state
                    );

                continue;
            }

            /*
             * Generate the state for
             * this simulated second.
             */
            this.updateBondMarket(
                simulationTime
            );

            this.recalculateSpread();

            /*
             * Save periodic snapshots.
             */
            if (
                simulationTime %
                SNAPSHOT_INTERVAL ===
                0
            ) {
                this.saveSnapshot(
                    simulationTime
                );
            }
        }
    }

    /**
     * Process backward simulation.
     *
     * Previously generated history
     * is preserved.
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
     * Deterministic bond movement.
     *
     * This is currently a placeholder
     * model. Later, correlation inputs
     * from economic, currency,
     * sentiment, international market,
     * and other engines can influence
     * these changes.
     */
    private updateBondMarket(
        timestamp: number
    ): void {
        const twoYearNoise =
            this.deterministicNoise(
                timestamp,
                17
            );

        const tenYearNoise =
            this.deterministicNoise(
                timestamp,
                31
            );

        const twoYearChange =
            twoYearNoise *
            0.002;

        const tenYearChange =
            tenYearNoise *
            0.001;

        this.state.us2yYield +=
            twoYearChange;

        this.state.us10yYield +=
            tenYearChange;

        this.state.us2yYield =
            Math.max(
                0,
                this.state.us2yYield
            );

        this.state.us10yYield =
            Math.max(
                0,
                this.state.us10yYield
            );
    }

    /**
     * Deterministic pseudo-random
     * number between -1 and 1.
     *
     * The result depends only on
     * simulation timestamp and seed.
     */
    private deterministicNoise(
        timestamp: number,
        seed: number
    ): number {
        const value =
            Math.sin(
                timestamp *
                0.000001 +
                seed *
                12.9898
            ) *
            43758.5453;

        const fraction =
            value -
            Math.floor(value);

        return (
            fraction * 2 -
            1
        );
    }

    /**
     * Calculate 2Y - 10Y spread.
     */
    private recalculateSpread(): void {
        this.state.yieldSpread =
            this.state.us2yYield -
            this.state.us10yYield;
    }

    /**
     * Align timestamp to the
     * simulated second.
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
     * Save a complete state snapshot.
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

        /*
         * Prevent unlimited history
         * growth.
         */
        while (
            this.history.size >
            MAX_HISTORY_SNAPSHOTS
        ) {
            const oldestTimestamp =
                this.history
                    .keys()
                    .next()
                    .value;

            if (
                oldestTimestamp ===
                undefined
            ) {
                break;
            }

            this.history.delete(
                oldestTimestamp
            );
        }
    }

    /**
     * Find latest snapshot at or
     * before the requested timestamp.
     */
    private findSnapshotAtOrBefore(
        timestamp: number
    ): BondStateSnapshot | null {
        let bestTimestamp:
            | number
            | null = null;

        for (
            const snapshotTimestamp
            of this.history.keys()
        ) {
            if (
                snapshotTimestamp <=
                timestamp
            ) {
                if (
                    bestTimestamp ===
                    null ||
                    snapshotTimestamp >
                    bestTimestamp
                ) {
                    bestTimestamp =
                        snapshotTimestamp;
                }
            }
        }

        if (
            bestTimestamp ===
            null
        ) {
            return null;
        }

        return (
            this.history.get(
                bestTimestamp
            ) ?? null
        );
    }

    /**
     * Deep clone bond state.
     *
     * Kept as a dedicated method so
     * future nested bond state can be
     * handled safely without changing
     * the engine architecture.
     */
    private cloneState(
        state: BondState
    ): BondState {
        return {
            us2yYield:
                state.us2yYield,

            us10yYield:
                state.us10yYield,

            yieldSpread:
                state.yieldSpread,
        };
    }

    /**
     * Current bond state.
     */
    getState(): BondState {
        return this.cloneState(
            this.state
        );
    }

    /**
     * Complete available snapshot
     * history.
     */
    getHistory():
        BondStateSnapshot[] {
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