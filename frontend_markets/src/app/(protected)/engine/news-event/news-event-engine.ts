import { SimulationClockState } from "../../clock/simulation-clock.types";

import {
    NewsEvent,
    NewsEventFrequency,
    NewsEventSnapshot,
    NewsCorrelationInput,
} from "./news-event.types";

import {
    DEMO_NEWS_EVENTS,
} from "./demo-news-events";


export class NewsEventEngine {
    private correlationInput:
        NewsCorrelationInput;

    /**
     * Events currently visible at the
     * current simulation time.
     */
    private events: NewsEvent[];

    /**
     * Complete archive of every generated
     * news event.
     *
     * This is never destroyed when the
     * simulation moves backward.
     */
    private allEvents: NewsEvent[];

    /**
     * Snapshots of visible news state.
     */
    private history: Map<
        number,
        NewsEventSnapshot
    >;

    private currentSimulationTime: number;

    private nextEventId: number;

    constructor(
        initialTime: number,

        correlationInput:
            NewsCorrelationInput = {
                economicSensitivity: 1,
                marketSensitivity: 1,
                bondSensitivity: 1,
                currencySensitivity: 1,
                nepalSensitivity: 1,
            }
    ) {
        this.currentSimulationTime =
            initialTime;

        this.events = [];

        this.allEvents = [];

        this.history = new Map();

        this.nextEventId = 1;

        this.correlationInput = {
            ...correlationInput,
        };

        this.saveSnapshot(
            initialTime
        );
    }

    /**
     * Update correlation-driven inputs.
     *
     * The correlation engine determines how
     * strongly news should interact with the
     * rest of the simulation.
     */
    setCorrelationInput(
        input: NewsCorrelationInput
    ): void {
        this.correlationInput = {
            ...input,
        };
    }

    /**
     * Update the news engine from
     * the simulation clock.
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
     */
    private processForward(
        targetTime: number
    ): void {
        const previousTime =
            this.currentSimulationTime;

        const previousDate =
            new Date(previousTime);

        const targetDate =
            new Date(targetTime);

        /*
         * Process every calendar day
         * crossed by the simulation.
         */
        let cursor =
            this.startOfDay(
                previousDate
            );

        const targetDay =
            this.startOfDay(
                targetDate
            );

        while (
            cursor < targetDay
        ) {
            cursor =
                this.addDays(
                    cursor,
                    1
                );

            this.processFrequency(
                cursor,
                "daily"
            );

            this.processFrequency(
                cursor,
                "weekly"
            );

            this.processFrequency(
                cursor,
                "monthly"
            );

            this.processFrequency(
                cursor,
                "quarterly"
            );

            this.processFrequency(
                cursor,
                "yearly"
            );
        }

        /*
         * Restore only events that have
         * actually occurred by target time.
         */
        this.events =
            this.allEvents
                .filter(
                    (event) =>
                        event.timestamp <=
                        targetTime
                )
                .map(
                    (event) => ({
                        ...event,
                    })
                );

        /*
         * Only save a snapshot if the
         * visible state changed.
         */
        if (
            this.events.length >
            0
        ) {
            this.saveSnapshot(
                targetTime
            );
        }
    }

    /**
     * Process backward simulation.
     *
     * Important:
     * We DO NOT delete generated events.
     *
     * The archive remains intact.
     */
    private processBackward(
        targetTime: number
    ): void {
        const snapshot =
            this.findSnapshotAtOrBefore(
                targetTime
            );

        if (snapshot) {
            this.restoreSnapshot(
                snapshot
            );

            return;
        }

        /*
         * Fallback for a timestamp where
         * no snapshot exists.
         */
        this.events =
            this.allEvents
                .filter(
                    (event) =>
                        event.timestamp <=
                        targetTime
                )
                .map(
                    (event) => ({
                        ...event,
                    })
                );
    }

    /**
     * Process one frequency.
     */
    private processFrequency(
        timestamp: number,
        frequency: NewsEventFrequency
    ): void {
        /*
         * Prevent duplicate events if the
         * same simulated period is visited
         * again.
         */
        const alreadyGenerated =
            this.hasEventForPeriod(
                timestamp,
                frequency
            );

        if (
            alreadyGenerated
        ) {
            return;
        }

        const candidates =
            DEMO_NEWS_EVENTS.filter(
                (event) =>
                    event.frequency ===
                    frequency
            );

        if (
            candidates.length === 0
        ) {
            return;
        }

        const selected =
            candidates[
            Math.floor(
                Math.random() *
                candidates.length
            )
            ];

        const event: NewsEvent = {
            ...selected,

            id:
                `news-${this.nextEventId++}`,

            timestamp,

            economicEffect:
                this.calculateCorrelatedEffect(
                    selected
                ),
        };

        /*
         * Save permanently.
         */
        this.allEvents.push(
            event
        );

        /*
         * Keep archive sorted.
         */
        this.allEvents.sort(
            (a, b) =>
                a.timestamp -
                b.timestamp
        );
    }

    /**
     * Apply correlation sensitivity to the
     * generated news event.
     *
     * The event's base economic effect is
     * modified by the correlation layer.
     */
    private calculateCorrelatedEffect(
        event: Omit<
            NewsEvent,
            "id" | "timestamp"
        >
    ): number {
        const sensitivity =
            (
                this.correlationInput
                    .economicSensitivity +

                this.correlationInput
                    .marketSensitivity +

                this.correlationInput
                    .bondSensitivity +

                this.correlationInput
                    .currencySensitivity +

                this.correlationInput
                    .nepalSensitivity
            ) / 5;

        return this.clampEconomicEffect(
            event.economicEffect *
            sensitivity
        );
    }

    /**
     * Determine whether an event has
     * already been generated for a
     * particular calendar period.
     */
    private hasEventForPeriod(
        timestamp: number,
        frequency: NewsEventFrequency
    ): boolean {
        return this.allEvents.some(
            (event) =>
                event.frequency ===
                frequency &&
                this.isSamePeriod(
                    event.timestamp,
                    timestamp,
                    frequency
                )
        );
    }

    /**
     * Compare two timestamps according
     * to the requested frequency.
     */
    private isSamePeriod(
        firstTimestamp: number,
        secondTimestamp: number,
        frequency: NewsEventFrequency
    ): boolean {
        const first =
            new Date(firstTimestamp);

        const second =
            new Date(secondTimestamp);

        switch (frequency) {
            case "daily":
                return (
                    first.getUTCFullYear() ===
                    second.getUTCFullYear() &&
                    first.getUTCMonth() ===
                    second.getUTCMonth() &&
                    first.getUTCDate() ===
                    second.getUTCDate()
                );

            case "weekly": {
                const firstWeek =
                    this.getWeekKey(
                        first
                    );

                const secondWeek =
                    this.getWeekKey(
                        second
                    );

                return (
                    firstWeek ===
                    secondWeek
                );
            }

            case "monthly":
                return (
                    first.getUTCFullYear() ===
                    second.getUTCFullYear() &&
                    first.getUTCMonth() ===
                    second.getUTCMonth()
                );

            case "quarterly":
                return (
                    first.getUTCFullYear() ===
                    second.getUTCFullYear() &&
                    Math.floor(
                        first.getUTCMonth() /
                        3
                    ) ===
                    Math.floor(
                        second.getUTCMonth() /
                        3
                    )
                );

            case "yearly":
                return (
                    first.getUTCFullYear() ===
                    second.getUTCFullYear()
                );
        }
    }

    /**
     * Generate a stable week key.
     */
    private getWeekKey(
        date: Date
    ): string {
        const start =
            this.startOfWeek(
                date
            );

        return (
            `${start.getUTCFullYear()}-` +
            `${start.getUTCMonth()}-` +
            `${start.getUTCDate()}`
        );
    }

    /**
     * Start of UTC day.
     */
    private startOfDay(
        date: Date
    ): number {
        return Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
        );
    }

    /**
     * Start of UTC week.
     *
     * Monday is the first day.
     */
    private startOfWeek(
        date: Date
    ): Date {
        const result =
            new Date(
                this.startOfDay(
                    date
                )
            );

        const day =
            result.getUTCDay();

        const daysFromMonday =
            day === 0
                ? 6
                : day - 1;

        result.setUTCDate(
            result.getUTCDate() -
            daysFromMonday
        );

        return result;
    }

    /**
     * Add days to timestamp.
     */
    private addDays(
        timestamp: number,
        days: number
    ): number {
        const date =
            new Date(timestamp);

        date.setUTCDate(
            date.getUTCDate() +
            days
        );

        return date.getTime();
    }

    /**
     * Keep economic effect within
     * [-1, +1].
     */
    private clampEconomicEffect(
        value: number
    ): number {
        return Math.max(
            -1,
            Math.min(
                1,
                value
            )
        );
    }

    /**
     * Save current visible state.
     */
    private saveSnapshot(
        timestamp: number
    ): void {
        this.history.set(
            timestamp,
            {
                timestamp,

                events:
                    this.events.map(
                        (event) => ({
                            ...event,
                        })
                    ),
            }
        );
    }

    /**
     * Find latest snapshot at or before
     * a timestamp.
     */
    private findSnapshotAtOrBefore(
        timestamp: number
    ): NewsEventSnapshot | null {
        let bestTimestamp:
            | number
            | null = null;

        for (
            const snapshotTimestamp of
            this.history.keys()
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
     * Restore visible news state.
     */
    private restoreSnapshot(
        snapshot: NewsEventSnapshot
    ): void {
        this.events =
            snapshot.events.map(
                (event) => ({
                    ...event,
                })
            );
    }

    /**
     * Current visible events.
     */
    getEvents(): NewsEvent[] {
        return this.events.map(
            (event) => ({
                ...event,
            })
        );
    }

    /**
     * Complete news archive.
     *
     * Includes events that occurred
     * after the current simulation time.
     */
    getAllEvents(): NewsEvent[] {
        return this.allEvents.map(
            (event) => ({
                ...event,
            })
        );
    }

    /**
     * Latest visible event.
     */
    getLatestEvent():
        NewsEvent | null {
        if (
            this.events.length === 0
        ) {
            return null;
        }

        return {
            ...this.events[
            this.events.length - 1
            ],
        };
    }

    /**
     * Snapshot history.
     */
    getHistory():
        NewsEventSnapshot[] {
        return Array.from(
            this.history.values()
        );
    }
}