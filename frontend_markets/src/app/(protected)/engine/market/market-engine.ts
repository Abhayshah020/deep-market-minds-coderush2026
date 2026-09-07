import { SimulationClockState } from "../../clock/simulation-clock.types";

import {
    CommodityCode,
    CompanyState,
    MarketAssetState,
    MarketCandle,
    MarketCandleTimeframe,
    MarketSnapshot,
    MarketState,
    StockIndexCode,
} from "./market-engine.types";

import {
    INITIAL_MARKET_STATE,
} from "./initial-market-state";

const MINUTE_MS =
    60 * 1000;

const HOUR_MS =
    60 * MINUTE_MS;

const DAY_MS =
    24 * HOUR_MS;

const STOCK_INDICES:
    StockIndexCode[] = [
        "SP500",
        "NASDAQ",
        "DOW",
        "FTSE100",
        "DAX",
        "CAC40",
        "NIKKEI225",
        "HANGSENG",
        "NIFTY50",
        "ASX200",
    ];

const COMMODITIES:
    CommodityCode[] = [
        "GOLD",
        "OIL",
        "COPPER",
    ];

export class MarketEngine {
    private state: MarketState;

    private history:
        Map<number, MarketSnapshot>;

    private candles:
        Map<
            MarketCandleTimeframe,
            Map<
                string,
                MarketCandle[]
            >
        >;

    private currentSimulationTime: number;

    private readonly candleTimeframe:
        MarketCandleTimeframe =
        "minute";

    constructor(
        initialTime: number,
        initialState:
            MarketState =
            INITIAL_MARKET_STATE
    ) {
        this.currentSimulationTime =
            initialTime;

        /*
         * Clone the provided initial state
         * so the engine never mutates the
         * caller's object.
         */
        this.state =
            this.cloneState(
                initialState
            );

        this.history =
            new Map();

        this.candles =
            new Map();

        this.initializeCandleStorage();

        this.saveSnapshot(
            initialTime
        );

        this.initializeCurrentCandles(
            initialTime
        );
    }

    /**
     * Main engine update.
     *
     * Price changes continuously with
     * simulation time.
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
     * The market price moves continuously.
     *
     * Fundamentals are updated once
     * per simulated day.
     */
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
         * Continuous market movement.
         */
        this.updateContinuousPrices(
            previousTime,
            targetTime
        );

        /*
         * Process every crossed
         * simulated day.
         */
        const firstDay =
            this.getNextDay(
                previousTime
            );

        let day =
            firstDay;

        while (
            day <= targetTime
        ) {
            this.updateDailyFundamentals(
                day
            );

            day += DAY_MS;
        }

        /*
         * Update OHLC candle.
         */
        this.updateCurrentCandles(
            targetTime
        );

        this.saveSnapshot(
            targetTime
        );
    }

    /**
     * Continuous price movement.
     */
    private updateContinuousPrices(
        previousTime: number,
        currentTime: number
    ): void {
        STOCK_INDICES.forEach(
            (code, index) => {
                const asset =
                    this.state.indices[
                    code
                    ];

                this.state.indices[
                    code
                ] =
                    this.updateAssetPrice(
                        asset,
                        previousTime,
                        currentTime,
                        index
                    );
            }
        );

        COMMODITIES.forEach(
            (code, index) => {
                const asset =
                    this.state.commodities[
                    code
                    ];

                this.state.commodities[
                    code
                ] =
                    this.updateAssetPrice(
                        asset,
                        previousTime,
                        currentTime,
                        index + 100
                    );
            }
        );

        this.state.companies =
            this.state.companies.map(
                (
                    company,
                    index
                ) =>
                    this.updateCompanyPrice(
                        company,
                        previousTime,
                        currentTime,
                        index
                    )
            );
    }

    /**
     * Update one market asset.
     */
    private updateAssetPrice(
        asset: MarketAssetState,
        previousTime: number,
        currentTime: number,
        index: number
    ): MarketAssetState {
        const previousPrice =
            asset.value;

        const elapsed =
            currentTime -
            previousTime;

        /*
         * Deterministic random component.
         *
         * The timestamp makes the movement
         * dependent on simulation time rather
         * than browser update frequency.
         */
        const seed =
            this.createTimeSeed(
                currentTime,
                index
            );

        const noise =
            this.seededRandom(seed) -
            0.5;

        /*
         * Basic supply/demand.
         */
        const demand =
            100 +
            (
                this.seededRandom(
                    seed + 1
                ) -
                0.5
            ) *
            20;

        const supply =
            100 +
            (
                this.seededRandom(
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

        /*
         * Convert elapsed simulation
         * time into a small price movement.
         */
        const timeFactor =
            elapsed /
            DAY_MS;

        const returnRate =
            (
                pressure * 0.02 +
                noise * 0.01
            ) *
            timeFactor;

        const newPrice =
            Math.max(
                0,
                previousPrice *
                (
                    1 +
                    returnRate
                )
            );

        return {
            ...asset,

            value: newPrice,

            supply: this.smoothValue(
                asset.supply,
                supply
            ),

            demand: this.smoothValue(
                asset.demand,
                demand
            ),
        };
    }

    /**
     * Update company market price
     * continuously.
     */
    private updateCompanyPrice(
        company: CompanyState,
        previousTime: number,
        currentTime: number,
        index: number
    ): CompanyState {
        const elapsed =
            currentTime -
            previousTime;

        const seed =
            this.createTimeSeed(
                currentTime,
                index + 200
            );

        const demand =
            100 +
            (
                this.seededRandom(
                    seed + 1
                ) -
                0.5
            ) *
            20;

        const supply =
            100 +
            (
                this.seededRandom(
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

        const noise =
            this.seededRandom(
                seed + 3
            ) -
            0.5;

        const timeFactor =
            elapsed /
            DAY_MS;

        const returnRate =
            (
                pressure * 0.02 +
                noise * 0.01
            ) *
            timeFactor;

        const close =
            Math.max(
                0,
                company.value *
                (
                    1 +
                    returnRate
                )
            );

        return {
            ...company,

            value: close,

            supply: this.smoothValue(
                company.supply,
                supply
            ),

            demand: this.smoothValue(
                company.demand,
                demand
            ),
        };
    }

    /**
     * Fundamentals change daily.
     *
     * Revenue and earnings are NOT
     * continuously changed.
     */
    private updateDailyFundamentals(
        timestamp: number
    ): void {
        this.state.companies =
            this.state.companies.map(
                (
                    company,
                    index
                ) => {
                    const seed =
                        this.createTimeSeed(
                            timestamp,
                            index + 500
                        );

                    const revenueGrowth =
                        (
                            this.seededRandom(
                                seed
                            ) -
                            0.5
                        ) *
                        0.02;

                    const earningsGrowth =
                        (
                            this.seededRandom(
                                seed + 1
                            ) -
                            0.5
                        ) *
                        0.03;

                    return {
                        ...company,

                        revenue:
                            Math.max(
                                0,
                                company.revenue *
                                (
                                    1 +
                                    revenueGrowth
                                )
                            ),

                        earnings:
                            Math.max(
                                0,
                                company.earnings *
                                (
                                    1 +
                                    earningsGrowth
                                )
                            ),
                    };
                }
            );
    }

    /**
     * Update the active OHLC candle.
     */
    private updateCurrentCandles(
        timestamp: number
    ): void {
        const candleTimestamp =
            this.getCandleTimestamp(
                timestamp
            );

        STOCK_INDICES.forEach(
            (code) => {
                this.updateCandle(
                    code,
                    candleTimestamp,
                    this.state.indices[
                        code
                    ].value
                );
            }
        );

        COMMODITIES.forEach(
            (code) => {
                this.updateCandle(
                    code,
                    candleTimestamp,
                    this.state.commodities[
                        code
                    ].value
                );
            }
        );

        this.state.companies.forEach(
            (company) => {
                this.updateCandle(
                    company.id,
                    candleTimestamp,
                    company.value
                );
            }
        );

        /*
         * Update current state's OHLC
         * from the active candle.
         */
        this.syncStateOHLC(
            candleTimestamp
        );
    }

    private updateCandle(
        assetId: string,
        candleTimestamp: number,
        price: number
    ): void {
        const storage =
            this.getCandleStorage(
                assetId
            );

        const last =
            storage[
            storage.length - 1
            ];

        /*
         * New candle.
         */
        if (
            !last ||
            last.timestamp !==
            candleTimestamp
        ) {
            storage.push({
                timestamp:
                    candleTimestamp,

                ohlc: {
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                },
            });

            return;
        }

        /*
         * Update existing candle.
         */
        last.ohlc.high =
            Math.max(
                last.ohlc.high,
                price
            );

        last.ohlc.low =
            Math.min(
                last.ohlc.low,
                price
            );

        last.ohlc.close =
            price;
    }

    /**
     * Synchronize the OHLC exposed
     * in the current market state.
     */
    private syncStateOHLC(
        timestamp: number
    ): void {
        const candleTimestamp =
            this.getCandleTimestamp(
                timestamp
            );

        STOCK_INDICES.forEach(
            (code) => {
                const candle =
                    this.findCandle(
                        code,
                        candleTimestamp
                    );

                if (candle) {
                    this.state.indices[
                        code
                    ].ohlc =
                    {
                        ...candle.ohlc,
                    };
                }
            }
        );

        COMMODITIES.forEach(
            (code) => {
                const candle =
                    this.findCandle(
                        code,
                        candleTimestamp
                    );

                if (candle) {
                    this.state.commodities[
                        code
                    ].ohlc =
                    {
                        ...candle.ohlc,
                    };
                }
            }
        );

        this.state.companies =
            this.state.companies.map(
                (company) => {
                    const candle =
                        this.findCandle(
                            company.id,
                            candleTimestamp
                        );

                    if (!candle) {
                        return company;
                    }

                    return {
                        ...company,

                        ohlc: {
                            ...candle.ohlc,
                        },
                    };
                }
            );
    }

    /**
     * Initialize candle maps.
     */
    private initializeCandleStorage(): void {
        const storage =
            new Map<
                string,
                MarketCandle[]
            >();

        STOCK_INDICES.forEach(
            (code) =>
                storage.set(
                    code,
                    []
                )
        );

        COMMODITIES.forEach(
            (code) =>
                storage.set(
                    code,
                    []
                )
        );

        /*
         * Use the actual initial state
         * rather than the global default.
         *
         * This keeps custom initial states
         * fully backward compatible.
         */
        this.state.companies.forEach(
            (company) =>
                storage.set(
                    company.id,
                    []
                )
        );

        this.candles.set(
            this.candleTimeframe,
            storage
        );
    }

    private initializeCurrentCandles(
        timestamp: number
    ): void {
        this.updateCurrentCandles(
            timestamp
        );
    }

    /**
     * Retrieve candle storage.
     */
    private getCandleStorage(
        assetId: string
    ): MarketCandle[] {
        const timeframe =
            this.candles.get(
                this.candleTimeframe
            );

        if (!timeframe) {
            throw new Error(
                "Candle storage not initialized."
            );
        }

        const storage =
            timeframe.get(
                assetId
            );

        if (!storage) {
            throw new Error(
                `Unknown market asset: ${assetId}`
            );
        }

        return storage;
    }

    private findCandle(
        assetId: string,
        timestamp: number
    ): MarketCandle | null {
        const storage =
            this.getCandleStorage(
                assetId
            );

        return (
            storage.find(
                (candle) =>
                    candle.timestamp ===
                    timestamp
            ) ?? null
        );
    }

    /**
     * Return the beginning of the
     * current candle.
     */
    private getCandleTimestamp(
        timestamp: number
    ): number {
        return (
            Math.floor(
                timestamp /
                MINUTE_MS
            ) *
            MINUTE_MS
        );
    }

    /**
     * Return beginning of next day.
     */
    private getNextDay(
        timestamp: number
    ): number {
        return (
            Math.floor(
                timestamp / DAY_MS
            ) *
            DAY_MS +
            DAY_MS
        );
    }

    /**
     * Deterministic time seed.
     */
    private createTimeSeed(
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
            91
        );
    }

    /**
     * Deterministic pseudo-random value.
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

    private smoothValue(
        previous: number,
        target: number
    ): number {
        return (
            previous * 0.9 +
            target * 0.1
        );
    }

    /**
     * Save complete market snapshot.
     *
     * A deep clone is stored so later
     * state mutations cannot modify history.
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
     * Restore previous simulation state.
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

    private findSnapshotAtOrBefore(
        timestamp: number
    ): MarketSnapshot | null {
        let result:
            | MarketSnapshot
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
     * Deep clone the complete
     * market state.
     */
    private cloneState(
        state: MarketState
    ): MarketState {
        return {
            indices:
                Object.fromEntries(
                    Object.entries(
                        state.indices
                    ).map(
                        ([
                            code,
                            asset,
                        ]) => [
                                code,
                                {
                                    ...asset,

                                    ohlc: {
                                        ...asset.ohlc,
                                    },
                                },
                            ]
                    )
                ) as MarketState[
                "indices"
                ],

            commodities:
                Object.fromEntries(
                    Object.entries(
                        state.commodities
                    ).map(
                        ([
                            code,
                            asset,
                        ]) => [
                                code,
                                {
                                    ...asset,

                                    ohlc: {
                                        ...asset.ohlc,
                                    },
                                },
                            ]
                    )
                ) as MarketState[
                "commodities"
                ],

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

    /**
     * Return a safe copy of the
     * current market state.
     */
    getState(): MarketState {
        return this.cloneState(
            this.state
        );
    }

    /**
     * Return safe copies of all
     * historical snapshots.
     */
    getHistory():
        MarketSnapshot[] {
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

    /**
     * Get historical candles.
     *
     * Return cloned candle objects so
     * external code cannot mutate the
     * engine's candle history.
     */
    getCandles(
        assetId: string
    ): MarketCandle[] {
        return this.getCandleStorage(
            assetId
        ).map(
            (candle) => ({
                timestamp:
                    candle.timestamp,

                ohlc: {
                    ...candle.ohlc,
                },
            })
        );
    }

    getCandleTimeframe():
        MarketCandleTimeframe {
        return this.candleTimeframe;
    }
}