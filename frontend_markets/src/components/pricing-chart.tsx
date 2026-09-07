"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Application,
    Container,
    Graphics,
    Text,
} from "pixi.js";

import {
    CurrencyPair,
    PricingOHLC,
    PricingSnapshot,
    PricingState,
} from "../app/(protected)/engine/pricing/pricing-engine.types";
import { CurrencyState } from "@/app/(protected)/engine/currency/currency-engine.types";
import { BondState } from "@/app/(protected)/engine/bond/bond-engine.types";
import { SentimentState } from "@/app/(protected)/engine/sentiment/sentiment.types";
import { MarketState } from "@/app/(protected)/engine/market/market-engine.types";
import { NepalMarketState } from "@/app/(protected)/engine/nepal/nepal-engine.types";
import { EconomicState } from "@/app/(protected)/engine/economy/economic-engine.types";
import { CorrelationState } from "@/app/(protected)/engine/correlation/correlation-engine.types";

export type PricingTimeframe =
    | "5m"
    | "15m"
    | "1h"
    | "4h"
    | "1d"
    | "1w"
    | "1m";

type PricingAssetId =
    | `currency:${CurrencyPair}`
    | "bond:us2y"
    | "bond:us10y"
    | "bond:spread"
    | "sentiment"
    | "nepal:nepse"
    | "nepal:remittance";

type PricingAssetCategory =
    | "currency"
    | "bond"
    | "sentiment"
    | "nepal";

interface PricingAsset {
    id: PricingAssetId;
    symbol: string;
    name: string;
    category: PricingAssetCategory;
}


export type EngineSnapshotLike<
    T = unknown
> = {
    timestamp: number;
    state: T;
};


interface PricingChartProps {
    pricingState: PricingState | null;
    history?: PricingSnapshot[];
    height?: number;

    currencyHistory?: EngineSnapshotLike<CurrencyState>[];
    bondHistory?: EngineSnapshotLike<BondState>[];
    sentimentHistory?: EngineSnapshotLike<SentimentState>[];
    marketHistory?: EngineSnapshotLike<MarketState>[];
    nepalHistory?: EngineSnapshotLike<NepalMarketState>[];
    economicHistory?: EngineSnapshotLike<EconomicState>[];
    correlationHistory?: EngineSnapshotLike<CorrelationState>[];
}
interface ChartPoint { timestamp: number; sourceTimestamp: number; ohlc: PricingOHLC; }

const TIMEFRAMES: {
    id: PricingTimeframe;
    label: string;
    milliseconds: number;
}[] = [
        {
            id: "1h",
            label: "1H",
            milliseconds: 60 * 60 * 1000,
        },
        {
            id: "4h",
            label: "4H",
            milliseconds: 4 * 60 * 60 * 1000,
        },
        {
            id: "1d",
            label: "1D",
            milliseconds: 24 * 60 * 60 * 1000,
        },
        {
            id: "1w",
            label: "1W",
            milliseconds: 7 * 24 * 60 * 60 * 1000,
        },
        {
            id: "1m",
            label: "1M",
            milliseconds: 30 * 24 * 60 * 60 * 1000,
        },
    ];

const CURRENCY_PAIRS: CurrencyPair[] = [
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

const CATEGORY_LABELS: Record<
    PricingAssetCategory,
    string
> = {
    currency: "Currency Pairs",
    bond: "Bonds",
    sentiment: "Sentiment",
    nepal: "Nepal",
};

const CATEGORY_ORDER: PricingAssetCategory[] = [
    "currency",
    "bond",
    "sentiment",
    "nepal",
];

function formatPrice(value: number): string {
    if (!Number.isFinite(value)) {
        return "—";
    }

    if (Math.abs(value) >= 1000) {
        return value.toLocaleString("en-US", {
            maximumFractionDigits: 2,
        });
    }

    if (Math.abs(value) >= 10) {
        return value.toFixed(2);
    }

    return value.toFixed(4);
}

function formatDate(
    timestamp: number,
    timeframe: PricingTimeframe
): string {
    const date = new Date(timestamp);

    if (
        timeframe === "5m" ||
        timeframe === "15m" ||
        timeframe === "1h"
    ) {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function getTimeframe(
    timeframe: PricingTimeframe
) {
    return (
        TIMEFRAMES.find(
            (item) =>
                item.id === timeframe
        ) ?? TIMEFRAMES[0]
    );
}

/**
 * Currency assets use their actual OHLC source.
 *
 * Scalar assets are converted into:
 *
 * open  = value
 * high  = value
 * low   = value
 * close = value
 *
 * The chart renderer decides whether to show
 * the asset as a candle or as a line.
 */
function getAssetOHLC(
    state: PricingState,
    asset: PricingAsset
): PricingOHLC | null {
    if (
        asset.category === "currency"
    ) {
        const pair =
            asset.id.replace(
                "currency:",
                ""
            ) as CurrencyPair;

        return (
            state.currencies[pair]
                ?.ohlc ?? null
        );
    }

    if (
        asset.id === "bond:us2y"
    ) {
        const value =
            state.bonds.us2yYield;

        return {
            open: value,
            high: value,
            low: value,
            close: value,
        };
    }

    if (
        asset.id === "bond:us10y"
    ) {
        const value =
            state.bonds.us10yYield;

        return {
            open: value,
            high: value,
            low: value,
            close: value,
        };
    }

    if (
        asset.id === "bond:spread"
    ) {
        const value =
            state.bonds.yieldSpread;

        return {
            open: value,
            high: value,
            low: value,
            close: value,
        };
    }

    if (
        asset.id === "sentiment"
    ) {
        const value =
            state.sentiment.value;

        return {
            open: value,
            high: value,
            low: value,
            close: value,
        };
    }

    if (
        asset.id === "nepal:nepse"
    ) {
        const value =
            state.nepal.nepse;

        return {
            open: value,
            high: value,
            low: value,
            close: value,
        };
    }

    if (
        asset.id ===
        "nepal:remittance"
    ) {
        const value =
            state.nepal.remittance;

        return {
            open: value,
            high: value,
            low: value,
            close: value,
        };
    }

    return null;
}

function getSnapshotAtOrBefore<T>(
    history:
        | EngineSnapshotLike<T>[]
        | undefined,
    timestamp: number
): EngineSnapshotLike<T> | null {
    if (
        !history ||
        history.length === 0
    ) {
        return null;
    }

    const sortedHistory =
        [...history].sort(
            (a, b) =>
                a.timestamp -
                b.timestamp
        );

    let result:
        | EngineSnapshotLike<T>
        | null = null;

    for (
        const snapshot of sortedHistory
    ) {
        if (
            snapshot.timestamp <=
            timestamp
        ) {
            result = snapshot;
        } else {
            break;
        }
    }

    /*
     * Backward-compatible fallback:
     * if the selected candle is before
     * the available engine history,
     * use the earliest known state.
     */
    return (
        result ??
        sortedHistory[0]
    );
}

/**
 * Currency pairs -> OHLC
 *
 * IMPORTANT:
 * We build timeframe candles from the
 * sequence of sampled CLOSE prices instead
 * of taking one snapshot's OHLC as the
 * entire candle.
 *
 * This produces:
 *
 * open  = first price in bucket
 * high  = highest price in bucket
 * low   = lowest price in bucket
 * close = last price in bucket
 *
 * Scalar assets also use this function,
 * but their resulting points are rendered
 * as a line.
 */
function buildChartData(
    history: PricingSnapshot[],
    asset: PricingAsset,
    timeframe: PricingTimeframe
): ChartPoint[] {
    if (history.length === 0) {
        return [];
    }

    const interval =
        getTimeframe(
            timeframe
        ).milliseconds;

    const buckets =
        new Map<number, ChartPoint>();

    const sortedHistory =
        [...history].sort(
            (a, b) =>
                a.timestamp -
                b.timestamp
        );

    for (
        const snapshot of sortedHistory
    ) {
        const source =
            getAssetOHLC(
                snapshot.state,
                asset
            );

        if (!source) {
            continue;
        }

        const price =
            source.close;

        if (
            !Number.isFinite(price)
        ) {
            continue;
        }

        const bucket =
            Math.floor(
                snapshot.timestamp /
                interval
            ) * interval;

        const existing =
            buckets.get(bucket);

        if (!existing) {
            buckets.set(
                bucket,
                {
                    timestamp:
                        bucket,

                    sourceTimestamp:
                        snapshot.timestamp,

                    ohlc: {
                        open: price,
                        high: price,
                        low: price,
                        close: price,
                    },
                }
            );

            continue;
        }

        existing.ohlc.high =
            Math.max(
                existing.ohlc.high,
                price
            );

        existing.ohlc.low =
            Math.min(
                existing.ohlc.low,
                price
            );

        existing.ohlc.close =
            price;

        /*
         * Keep the timestamp of the
         * latest source sample in this
         * timeframe bucket.
         *
         * This becomes the cross-market
         * state-selection timestamp.
         */
        existing.sourceTimestamp =
            snapshot.timestamp;
    }

    return Array.from(
        buckets.values()
    ).sort(
        (a, b) =>
            a.timestamp -
            b.timestamp
    );
}


function isScalarAsset(
    asset: PricingAsset
): boolean {
    return (
        asset.category !==
        "currency"
    );
}

function getLatestValue(
    state: PricingState,
    asset: PricingAsset
): number | null {
    const ohlc =
        getAssetOHLC(
            state,
            asset
        );

    return ohlc?.close ?? null;
}

function createAssets(
    state: PricingState | null
): PricingAsset[] {
    if (!state) {
        return [];
    }

    const assets: PricingAsset[] =
        [];

    for (
        const pair of CURRENCY_PAIRS
    ) {
        if (
            !state.currencies[pair]
        ) {
            continue;
        }

        assets.push({
            id:
                `currency:${pair}` as PricingAssetId,

            symbol: pair,

            name:
                `${pair} Currency Pair`,

            category:
                "currency",
        });
    }

    assets.push(
        {
            id: "bond:us2y",
            symbol: "US2Y",
            name: "US 2-Year Treasury Yield",
            category: "bond",
        },
        {
            id: "bond:us10y",
            symbol: "US10Y",
            name: "US 10-Year Treasury Yield",
            category: "bond",
        },
        {
            id: "bond:spread",
            symbol: "2Y-10Y",
            name: "US Treasury Yield Spread",
            category: "bond",
        }
    );

    assets.push({
        id: "sentiment",
        symbol: "SENTIMENT",
        name: "Market Sentiment",
        category: "sentiment",
    });

    assets.push(
        {
            id: "nepal:nepse",
            symbol: "NEPSE",
            name: "NEPSE Index",
            category: "nepal",
        },
        {
            id: "nepal:remittance",
            symbol: "REMITTANCE",
            name: "Nepal Remittance",
            category: "nepal",
        }
    );

    return assets;
}

export default function PricingChart({
    pricingState,
    history = [],
    height = 560,
    currencyHistory,
    bondHistory,
    sentimentHistory,
    marketHistory,
    nepalHistory,
    economicHistory,
    correlationHistory,
}: PricingChartProps) {
    // Add near your other state declarations

    const [aiExplanation, setAiExplanation] =
        useState<string>("");

    const [aiLoading, setAiLoading] =
        useState<boolean>(false);

    const [aiError, setAiError] =
        useState<string>("");

    const [
        hoveredPointIndex,
        setHoveredPointIndex,
    ] = useState<number | null>(null);

    const [
        selectedPointRange,
        setSelectedPointRange,
    ] = useState<{
        start: number;
        end: number;
    } | null>(null);

    const pixiContainerRef =
        useRef<HTMLDivElement | null>(
            null
        );

    const appRef =
        useRef<Application | null>(
            null
        );

    const assets = useMemo(
        () =>
            createAssets(
                pricingState
            ),
        [pricingState]
    );

    const [
        selectedAssetId,
        setSelectedAssetId,
    ] = useState<
        PricingAssetId | ""
    >("");

    const [
        timeframe,
        setTimeframe,
    ] =
        useState<PricingTimeframe>(
            "4h"
        );

    useEffect(() => {
        setHoveredPointIndex(null);
        setSelectedPointRange(null);
    }, [
        selectedAssetId,
        timeframe,
    ]);

    useEffect(() => {
        if (
            assets.length === 0
        ) {
            setSelectedAssetId(
                ""
            );

            return;
        }

        setSelectedAssetId(
            (current) => {
                const exists =
                    assets.some(
                        (asset) =>
                            asset.id ===
                            current
                    );

                return exists
                    ? current
                    : assets[0].id;
            }
        );
    }, [assets]);

    const selectedAsset =
        useMemo(
            () =>
                assets.find(
                    (asset) =>
                        asset.id ===
                        selectedAssetId
                ) ??
                assets[0] ??
                null,
            [
                assets,
                selectedAssetId,
            ]
        );

    const chartData =
        useMemo(() => {
            if (
                !selectedAsset
            ) {
                return [];
            }

            return buildChartData(
                history,
                selectedAsset,
                timeframe
            );
        }, [
            history,
            selectedAsset,
            timeframe,
        ]);


    const selectedChartPoints =
        useMemo(() => {
            if (
                !selectedPointRange ||
                chartData.length === 0
            ) {
                return [];
            }

            const start = Math.max(
                0,
                Math.min(
                    selectedPointRange.start,
                    selectedPointRange.end
                )
            );

            const end = Math.min(
                chartData.length - 1,
                Math.max(
                    selectedPointRange.start,
                    selectedPointRange.end
                )
            );

            return chartData.slice(
                start,
                end + 1
            );
        }, [
            chartData,
            selectedPointRange,
        ]);

    const selectedChartPoint =
        selectedChartPoints.length > 0
            ? selectedChartPoints[
            selectedChartPoints.length - 1
            ]
            : null;

    const hoveredChartPoint =
        hoveredPointIndex !== null
            ? chartData[
            hoveredPointIndex
            ] ?? null
            : null;

    const selectedTimestamp =
        selectedChartPoints.length > 0
            ? selectedChartPoints[0]
                .sourceTimestamp
            : null;

    const selectedEngineStates =
        useMemo(() => {
            if (
                selectedTimestamp === null
            ) {
                return null;
            }

            return {
                pricing:
                    getSnapshotAtOrBefore(
                        history,
                        selectedTimestamp
                    ),

                currency:
                    getSnapshotAtOrBefore(
                        currencyHistory,
                        selectedTimestamp
                    ),

                bond:
                    getSnapshotAtOrBefore(
                        bondHistory,
                        selectedTimestamp
                    ),

                sentiment:
                    getSnapshotAtOrBefore(
                        sentimentHistory,
                        selectedTimestamp
                    ),

                market:
                    getSnapshotAtOrBefore(
                        marketHistory,
                        selectedTimestamp
                    ),

                nepal:
                    getSnapshotAtOrBefore(
                        nepalHistory,
                        selectedTimestamp
                    ),

                economic:
                    getSnapshotAtOrBefore(
                        economicHistory,
                        selectedTimestamp
                    ),

                correlation:
                    getSnapshotAtOrBefore(
                        correlationHistory,
                        selectedTimestamp
                    ),
            };
        }, [
            history,
            currencyHistory,
            bondHistory,
            sentimentHistory,
            marketHistory,
            nepalHistory,
            economicHistory,
            correlationHistory,
            selectedTimestamp,
        ]);



    /*
     * Initialize Pixi.
     */
    useEffect(() => {
        if (
            !pixiContainerRef.current
        ) {
            return;
        }

        const container =
            pixiContainerRef.current;

        let destroyed = false;

        const app =
            new Application();

        app.init({
            background:
                "#0b0f14",
            antialias: true,
            resizeTo:
                container,
        }).then(() => {
            if (destroyed) {
                app.destroy(true, {
                    children:
                        true,
                });

                return;
            }

            appRef.current =
                app;

            container.appendChild(
                app.canvas
            );
        });

        return () => {
            destroyed = true;

            if (
                appRef.current
            ) {
                appRef.current.destroy(
                    true,
                    {
                        children:
                            true,
                    }
                );

                appRef.current =
                    null;
            }
        };
    }, []);

    /*
     * Draw chart.
     */
    useEffect(() => {
        const app =
            appRef.current;

        if (
            !app ||
            !selectedAsset
        ) {
            return;
        }

        const drawChart =
            () => {
                app.stage.removeChildren();

                const root =
                    new Container();

                app.stage.addChild(
                    root
                );

                const width =
                    Math.max(
                        app.screen.width,
                        320
                    );

                const chartHeight =
                    Math.max(
                        app.screen.height,
                        height
                    );

                /*
                 * Layout
                 */
                const paddingLeft =
                    16;

                const paddingRight =
                    78;

                const paddingTop =
                    32;

                const paddingBottom =
                    46;

                const plotWidth =
                    Math.max(
                        1,
                        width -
                        paddingLeft -
                        paddingRight
                    );

                const plotHeight =
                    Math.max(
                        1,
                        chartHeight -
                        paddingTop -
                        paddingBottom
                    );

                /*
                 * Background.
                 */
                const background =
                    new Graphics();

                background.rect(
                    0,
                    0,
                    width,
                    chartHeight
                );

                background.fill(
                    "#0b0f14"
                );

                root.addChild(
                    background
                );

                if (
                    chartData.length ===
                    0
                ) {
                    const emptyText =
                        new Text({
                            text:
                                history.length ===
                                    0
                                    ? "Waiting for pricing history..."
                                    : "No data for selected asset.",
                            style: {
                                fill:
                                    "#7d8794",
                                fontSize:
                                    14,
                            },
                        });

                    emptyText.anchor.set(
                        0.5
                    );

                    emptyText.position.set(
                        width / 2,
                        chartHeight / 2
                    );

                    root.addChild(
                        emptyText
                    );

                    return;
                }

                /*
                 * Chart range.
                 *
                 * Scalars use their line values.
                 * Currency uses high/low.
                 */
                const values =
                    isScalarAsset(
                        selectedAsset
                    )
                        ? chartData.map(
                            (point) =>
                                point.ohlc
                                    .close
                        )
                        : chartData.flatMap(
                            (point) => [
                                point.ohlc
                                    .high,
                                point.ohlc
                                    .low,
                            ]
                        );

                let minPrice =
                    Math.min(
                        ...values
                    );

                let maxPrice =
                    Math.max(
                        ...values
                    );

                let range =
                    maxPrice -
                    minPrice;

                /*
                 * Add meaningful breathing
                 * room around the data.
                 */
                if (
                    range === 0
                ) {
                    const expansion =
                        Math.max(
                            Math.abs(
                                maxPrice
                            ) *
                            0.01,
                            1
                        );

                    minPrice -=
                        expansion;

                    maxPrice +=
                        expansion;

                    range =
                        maxPrice -
                        minPrice;
                }

                const chartMin =
                    minPrice -
                    range * 0.08;

                const chartMax =
                    maxPrice +
                    range * 0.08;

                /*
                 * Grid
                 */
                const grid =
                    new Graphics();

                const horizontalLines =
                    5;

                const verticalLines =
                    Math.min(
                        6,
                        Math.max(
                            chartData.length -
                            1,
                            1
                        )
                    );

                for (
                    let i = 0;
                    i <=
                    horizontalLines;
                    i++
                ) {
                    const y =
                        paddingTop +
                        (plotHeight /
                            horizontalLines) *
                        i;

                    grid.moveTo(
                        paddingLeft,
                        y
                    );

                    grid.lineTo(
                        width -
                        paddingRight,
                        y
                    );
                }

                for (
                    let i = 0;
                    i <=
                    verticalLines;
                    i++
                ) {
                    const x =
                        paddingLeft +
                        (plotWidth /
                            verticalLines) *
                        i;

                    grid.moveTo(
                        x,
                        paddingTop
                    );

                    grid.lineTo(
                        x,
                        chartHeight -
                        paddingBottom
                    );
                }

                grid.stroke({
                    color:
                        "#1b222c",
                    width: 1,
                });

                root.addChild(
                    grid
                );

                /*
                 * Price -> screen Y
                 */
                const priceToY =
                    (
                        price: number
                    ) => {
                        const normalized =
                            (price -
                                chartMin) /
                            (chartMax -
                                chartMin);

                        return (
                            paddingTop +
                            (1 -
                                normalized) *
                            plotHeight
                        );
                    };

                /*
                 * X coordinate.
                 *
                 * Add some side breathing room
                 * so the first/last candle don't
                 * touch the edges.
                 */
                const candleSpacing =
                    chartData.length === 1
                        ? plotWidth
                        : plotWidth /
                        chartData.length;

                const getX =
                    (index: number) =>
                        paddingLeft +
                        candleSpacing *
                        index +
                        candleSpacing / 2;

                /*
                 * Draw either:
                 *
                 * Currency -> OHLC candles
                 *
                 * Scalar -> Line
                 */

                if (
                    isScalarAsset(
                        selectedAsset
                    )
                ) {
                    /*
                     * --------------------------------
                     * SCALAR LINE CHART
                     * --------------------------------
                     */
                    const line =
                        new Graphics();

                    chartData.forEach(
                        (
                            point,
                            index
                        ) => {
                            const x =
                                getX(
                                    index
                                );


                            const y =
                                priceToY(
                                    point
                                        .ohlc
                                        .close
                                );

                            if (
                                index ===
                                0
                            ) {
                                line.moveTo(
                                    x,
                                    y
                                );
                            } else {
                                line.lineTo(
                                    x,
                                    y
                                );
                            }
                        }
                    );

                    line.stroke({
                        color:
                            "#4da6ff",
                        width: 2,
                    });

                    root.addChild(
                        line
                    );

                    /*
                     * Data point highlights.
                     *
                     * Only draw a subset for
                     * large histories.
                     */
                    const maxDots =
                        80;

                    const step =
                        Math.max(
                            1,
                            Math.ceil(
                                chartData.length /
                                maxDots
                            )
                        );

                    chartData.forEach(
                        (
                            point,
                            index
                        ) => {
                            if (
                                index %
                                step !==
                                0 &&
                                index !==
                                chartData.length -
                                1
                            ) {
                                return;
                            }

                            const dot =
                                new Graphics();

                            dot.circle(
                                getX(
                                    index
                                ),
                                priceToY(
                                    point
                                        .ohlc
                                        .close
                                ),
                                2.5
                            );

                            dot.fill(
                                "#4da6ff"
                            );

                            root.addChild(
                                dot
                            );
                        }
                    );
                } else {
                    /*
                     * --------------------------------
                     * OHLC CANDLE CHART
                     * --------------------------------
                     */

                    const candleWidth =
                        Math.max(
                            4,
                            Math.min(
                                14,
                                candleSpacing *
                                0.62
                            )
                        );

                    const halfBody =
                        candleWidth /
                        2;

                    const wickWidth =
                        1.25;

                    chartData.forEach(
                        (
                            point,
                            index
                        ) => {
                            const x =
                                getX(
                                    index
                                );

                            const isSelected =
                                selectedPointRange !== null &&
                                index >=
                                Math.min(
                                    selectedPointRange.start,
                                    selectedPointRange.end
                                ) &&
                                index <=
                                Math.max(
                                    selectedPointRange.start,
                                    selectedPointRange.end
                                );

                            /*
                             * Selection background.
                             */
                            if (isSelected) {
                                const selection =
                                    new Graphics();

                                selection.roundRect(
                                    x -
                                    candleSpacing / 2 +
                                    1,
                                    paddingTop,
                                    candleSpacing - 2,
                                    plotHeight,
                                    4
                                );

                                selection.fill({
                                    color: 0x4da6ff,
                                    alpha: 0.08,
                                });

                                selection.stroke({
                                    color: 0x4da6ff,
                                    width: 2,
                                    alpha: 0.9,
                                });

                                root.addChild(
                                    selection
                                );

                                /*
                                 * Strong center marker.
                                 */
                                const centerMarker =
                                    new Graphics();

                                centerMarker.moveTo(
                                    x,
                                    paddingTop
                                );

                                centerMarker.lineTo(
                                    x,
                                    chartHeight -
                                    paddingBottom
                                );

                                centerMarker.stroke({
                                    color: 0x4da6ff,
                                    width: 1,
                                    alpha: 0.35,
                                });

                                root.addChild(
                                    centerMarker
                                );
                            }

                            const {
                                open,
                                high,
                                low,
                                close,
                            } =
                                point.ohlc;

                            const openY =
                                priceToY(
                                    open
                                );

                            const highY =
                                priceToY(
                                    high
                                );

                            const lowY =
                                priceToY(
                                    low
                                );

                            const closeY =
                                priceToY(
                                    close
                                );

                            const bullish =
                                close >=
                                open;

                            const candleColor =
                                bullish
                                    ? "#35d07f"
                                    : "#ff5c5c";

                            /*
                             * Wick.
                             */
                            const wick =
                                new Graphics();

                            wick.moveTo(
                                x,
                                highY
                            );

                            wick.lineTo(
                                x,
                                lowY
                            );

                            wick.stroke({
                                color:
                                    candleColor,
                                width:
                                    wickWidth,
                            });

                            root.addChild(
                                wick
                            );

                            /*
                             * Body.
                             *
                             * Ensure very small
                             * movements remain visible.
                             */
                            const bodyTop =
                                Math.min(
                                    openY,
                                    closeY
                                );

                            const rawBodyHeight =
                                Math.abs(
                                    closeY -
                                    openY
                                );

                            const bodyHeight =
                                Math.max(
                                    rawBodyHeight,
                                    3
                                );

                            const body =
                                new Graphics();

                            body.roundRect(
                                x -
                                halfBody,
                                bodyTop,
                                candleWidth,
                                bodyHeight,
                                1.5
                            );

                            body.fill({
                                color:
                                    candleColor,
                                alpha:
                                    0.88,
                            });

                            body.stroke({
                                color:
                                    candleColor,
                                width:
                                    1,
                            });

                            root.addChild(
                                body
                            );

                            /*
                             * Open tick.
                             */
                            const openTick =
                                new Graphics();

                            openTick.moveTo(
                                x -
                                candleWidth *
                                0.7,
                                openY
                            );

                            openTick.lineTo(
                                x -
                                candleWidth *
                                0.15,
                                openY
                            );

                            openTick.stroke({
                                color:
                                    candleColor,
                                width:
                                    1.2,
                            });

                            root.addChild(
                                openTick
                            );

                            /*
                             * Close tick.
                             */
                            const closeTick =
                                new Graphics();

                            closeTick.moveTo(
                                x +
                                candleWidth *
                                0.15,
                                closeY
                            );

                            closeTick.lineTo(
                                x +
                                candleWidth *
                                0.7,
                                closeY
                            );

                            closeTick.stroke({
                                color:
                                    candleColor,
                                width:
                                    1.2,
                            });

                            root.addChild(
                                closeTick
                            );

                            const hitArea = new Graphics();
                            hitArea.rect(x - candleSpacing / 2, paddingTop, candleSpacing, plotHeight);
                            hitArea.fill({ color: 0xffffff, alpha: 0.001, });
                            hitArea.eventMode = "static";
                            hitArea.cursor = "pointer";
                            hitArea.on("pointerover", () => {
                                setHoveredPointIndex(index);
                            });
                            hitArea.on("pointerout", () => {
                                setHoveredPointIndex(null);
                            });
                            hitArea.on(
                                "pointertap",
                                () => {
                                    setSelectedPointRange(
                                        (current) => {
                                            /*
                                             * First click.
                                             */
                                            if (!current) {
                                                return {
                                                    start: index,
                                                    end: index,
                                                };
                                            }

                                            /*
                                             * Clicking the anchor again
                                             * keeps a single candle selected.
                                             */
                                            if (
                                                current.start === index
                                            ) {
                                                return {
                                                    start: index,
                                                    end: index,
                                                };
                                            }

                                            /*
                                             * Extend/shrink the continuous
                                             * range from the original anchor.
                                             */
                                            return {
                                                start: current.start,
                                                end: index,
                                            };
                                        }
                                    );
                                }
                            );
                            root.addChild(hitArea);
                        }
                    );
                }

                /*
                 * Latest price.
                 */
                const latest =
                    chartData[
                    chartData.length -
                    1
                    ];

                const latestPrice =
                    latest.ohlc.close;

                const latestY =
                    priceToY(
                        latestPrice
                    );

                /*
                 * Latest price guide.
                 */
                const latestLine =
                    new Graphics();

                latestLine.moveTo(
                    paddingLeft,
                    latestY
                );

                latestLine.lineTo(
                    width -
                    paddingRight,
                    latestY
                );

                latestLine.stroke({
                    color:
                        "#35d07f",
                    width: 1,
                    alpha: 0.35,
                });

                root.addChild(
                    latestLine
                );

                /*
                 * Latest price label.
                 */
                const latestBadge =
                    new Graphics();

                const badgeWidth =
                    68;

                const badgeHeight =
                    22;

                const badgeX =
                    width -
                    badgeWidth -
                    8;

                const badgeY =
                    latestY -
                    badgeHeight / 2;

                latestBadge.roundRect(
                    badgeX,
                    badgeY,
                    badgeWidth,
                    badgeHeight,
                    4
                );

                latestBadge.fill(
                    "#18222d"
                );

                latestBadge.stroke({
                    color:
                        "#35d07f",
                    width: 1,
                });

                root.addChild(
                    latestBadge
                );

                const latestLabel =
                    new Text({
                        text:
                            formatPrice(
                                latestPrice
                            ),
                        style: {
                            fill:
                                "#dce6f0",
                            fontSize:
                                10,
                            fontWeight:
                                "600",
                        },
                    });

                latestLabel.anchor.set(
                    0.5
                );

                latestLabel.position.set(
                    badgeX +
                    badgeWidth / 2,
                    latestY
                );

                root.addChild(
                    latestLabel
                );

                /*
                 * Y axis labels.
                 */
                for (
                    let i = 0;
                    i <=
                    horizontalLines;
                    i++
                ) {
                    const ratio =
                        i /
                        horizontalLines;

                    const value =
                        chartMax -
                        (chartMax -
                            chartMin) *
                        ratio;

                    const label =
                        new Text({
                            text:
                                formatPrice(
                                    value
                                ),
                            style: {
                                fill:
                                    "#687585",
                                fontSize:
                                    10,
                            },
                        });

                    label.anchor.set(
                        1,
                        0.5
                    );

                    label.position.set(
                        width - 8,
                        paddingTop +
                        plotHeight *
                        ratio
                    );

                    root.addChild(
                        label
                    );
                }

                /*
                 * X axis labels.
                 */
                const labelCount =
                    Math.min(
                        6,
                        Math.max(
                            chartData.length -
                            1,
                            1
                        )
                    );

                for (
                    let i = 0;
                    i <=
                    labelCount;
                    i++
                ) {
                    const index =
                        Math.round(
                            (i /
                                Math.max(
                                    labelCount,
                                    1
                                )) *
                            (chartData.length -
                                1)
                        );

                    const point =
                        chartData[
                        index
                        ];

                    if (!point) {
                        continue;
                    }

                    const label =
                        new Text({
                            text:
                                formatDate(
                                    point.timestamp,
                                    timeframe
                                ),
                            style: {
                                fill:
                                    "#687585",
                                fontSize:
                                    10,
                            },
                        });

                    label.anchor.set(
                        0.5,
                        0
                    );

                    label.position.set(
                        getX(index),
                        chartHeight -
                        paddingBottom +
                        10
                    );

                    root.addChild(
                        label
                    );
                }

                /*
                 * Chart title.
                 */
                const title =
                    new Text({
                        text:
                            isScalarAsset(
                                selectedAsset
                            )
                                ? `${selectedAsset.symbol} · Line`
                                : `${selectedAsset.symbol} · OHLC`,
                        style: {
                            fill:
                                "#dce6f0",
                            fontSize:
                                12,
                            fontWeight:
                                "600",
                        },
                    });

                title.position.set(
                    paddingLeft,
                    10
                );

                root.addChild(
                    title
                );

                /*
                 * Chart legend.
                 */
                const legend =
                    new Text({
                        text:
                            isScalarAsset(
                                selectedAsset
                            )
                                ? "Value"
                                : "Open · High · Low · Close",
                        style: {
                            fill:
                                "#596574",
                            fontSize:
                                10,
                        },
                    });

                legend.anchor.set(
                    1,
                    0
                );

                legend.position.set(
                    width -
                    paddingRight,
                    10
                );

                root.addChild(
                    legend
                );
            };

        drawChart();

        const resizeObserver =
            new ResizeObserver(
                drawChart
            );

        if (
            pixiContainerRef.current
        ) {
            resizeObserver.observe(
                pixiContainerRef.current
            );
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [
        chartData,
        selectedAsset,
        timeframe,
        height,
        history.length,
        selectedPointRange,
    ]);

    const latestPrice =
        pricingState &&
            selectedAsset
            ? getLatestValue(
                pricingState,
                selectedAsset
            )
            : null;

    const previousPrice =
        chartData.length > 1
            ? chartData[
                chartData.length - 2
            ].ohlc.close
            : latestPrice;

    const change =
        latestPrice !== null &&
            previousPrice !== null &&
            previousPrice !== 0
            ? ((latestPrice -
                previousPrice) /
                previousPrice) *
            100
            : 0;

    const isPositive =
        change >= 0;

    return (
        <div
            style={{
                display: "flex",
                flexDirection:
                    "column",
                width: "100%",
                height: "100%",
                minHeight:
                    height + 100,
                background:
                    "#0b0f14",
                color: "#ffffff",
                border:
                    "1px solid #1c2530",
                borderRadius: 12,
                boxShadow:
                    "0 8px 30px rgba(0,0,0,0.20)",
            }}
        >
            {/* Header */}
            <div
                style={{
                    height: 72,
                    minHeight: 72,
                    display: "flex",
                    alignItems:
                        "center",
                    justifyContent:
                        "space-between",
                    padding:
                        "0 18px",
                    borderBottom:
                        "1px solid #1c2530",
                    background:
                        "#0d131a",
                }}
            >
                <div>
                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap: 8,
                        }}
                    >
                        <div
                            style={{
                                fontSize:
                                    18,
                                fontWeight:
                                    600,
                                letterSpacing:
                                    0.2,
                            }}
                        >
                            {
                                selectedAsset?.symbol ??
                                "No asset"
                            }
                        </div>

                        {selectedAsset && (
                            <div
                                style={{
                                    padding:
                                        "3px 7px",
                                    borderRadius:
                                        4,
                                    background:
                                        "#151e27",
                                    color:
                                        "#6f7e8e",
                                    fontSize:
                                        9,
                                    fontWeight:
                                        600,
                                    textTransform:
                                        "uppercase",
                                }}
                            >
                                {
                                    isScalarAsset(
                                        selectedAsset
                                    )
                                        ? "LINE"
                                        : "OHLC"
                                }
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            marginTop:
                                4,
                            fontSize:
                                11,
                            color:
                                "#6f7b89",
                        }}
                    >
                        {
                            selectedAsset?.name
                        }
                    </div>
                </div>

                {latestPrice !==
                    null && (
                        <div
                            style={{
                                textAlign:
                                    "right",
                            }}
                        >
                            <div
                                style={{
                                    fontSize:
                                        21,
                                    fontWeight:
                                        600,
                                    lineHeight:
                                        1.1,
                                }}
                            >
                                {formatPrice(
                                    latestPrice
                                )}
                            </div>

                            <div
                                style={{
                                    marginTop:
                                        5,
                                    fontSize:
                                        11,
                                    color:
                                        isPositive
                                            ? "#35d07f"
                                            : "#ff5c5c",
                                }}
                            >
                                {isPositive
                                    ? "+"
                                    : ""}
                                {change.toFixed(
                                    2
                                )}
                                %
                            </div>
                        </div>
                    )}
            </div>

            {/* Main */}
            <div
                style={{
                    display:
                        "flex",
                    flex: 1,
                    minHeight: 0,
                }}
            >
                {/* Sidebar */}
                <aside
                    style={{
                        width: 205,
                        minWidth: 205,
                        overflowY:
                            "auto",
                        borderRight:
                            "1px solid #1c2530",
                        padding:
                            "12px 8px",
                        background:
                            "#0d131a",
                    }}
                >
                    {CATEGORY_ORDER.map(
                        (
                            category
                        ) => {
                            const categoryAssets =
                                assets.filter(
                                    (
                                        asset
                                    ) =>
                                        asset.category ===
                                        category
                                );

                            if (
                                categoryAssets.length ===
                                0
                            ) {
                                return null;
                            }

                            return (
                                <div
                                    key={
                                        category
                                    }
                                    style={{
                                        marginBottom:
                                            16,
                                    }}
                                >
                                    <div
                                        style={{
                                            padding:
                                                "5px 8px",
                                            marginBottom:
                                                4,
                                            color:
                                                "#556170",
                                            fontSize:
                                                9,
                                            fontWeight:
                                                700,
                                            textTransform:
                                                "uppercase",
                                            letterSpacing:
                                                1,
                                        }}
                                    >
                                        {
                                            CATEGORY_LABELS[
                                            category
                                            ]
                                        }
                                    </div>

                                    {categoryAssets.map(
                                        (
                                            asset
                                        ) => {
                                            const active =
                                                asset.id ===
                                                selectedAssetId;

                                            const latest =
                                                pricingState
                                                    ? getLatestValue(
                                                        pricingState,
                                                        asset
                                                    )
                                                    : null;

                                            return (
                                                <button
                                                    key={
                                                        asset.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedAssetId(
                                                            asset.id
                                                        )
                                                    }
                                                    style={{
                                                        width:
                                                            "100%",
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "space-between",
                                                        gap:
                                                            8,
                                                        padding:
                                                            "9px 9px",
                                                        marginBottom:
                                                            2,
                                                        border:
                                                            "1px solid transparent",
                                                        borderRadius:
                                                            6,
                                                        background:
                                                            active
                                                                ? "#18222d"
                                                                : "transparent",
                                                        color:
                                                            active
                                                                ? "#ffffff"
                                                                : "#aeb7c2",
                                                        cursor:
                                                            "pointer",
                                                        textAlign:
                                                            "left",
                                                        transition:
                                                            "background 120ms ease",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            minWidth:
                                                                0,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    11,
                                                                fontWeight:
                                                                    active
                                                                        ? 600
                                                                        : 400,
                                                            }}
                                                        >
                                                            {
                                                                asset.symbol
                                                            }
                                                        </div>

                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    2,
                                                                fontSize:
                                                                    9,
                                                                color:
                                                                    "#596574",
                                                            }}
                                                        >
                                                            {isScalarAsset(
                                                                asset
                                                            )
                                                                ? "Scalar"
                                                                : "Currency"}
                                                        </div>
                                                    </div>

                                                    <span
                                                        style={{
                                                            fontSize:
                                                                10,
                                                            color:
                                                                active
                                                                    ? "#8d9aa8"
                                                                    : "#596574",
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        {latest !==
                                                            null
                                                            ? formatPrice(
                                                                latest
                                                            )
                                                            : "—"}
                                                    </span>
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            );
                        }
                    )}
                </aside>

                {/* Chart */}
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 0,
                        position:
                            "relative",
                        background:
                            "#0b0f14",
                    }}
                >
                    {hoveredChartPoint && (<div style={{ position: "absolute", top: 12, left: 12, zIndex: 10, minWidth: 190, padding: "10px 12px", borderRadius: 7, background: "rgba(13, 19, 26, 0.96)", border: "1px solid #293543", boxShadow: "0 8px 24px rgba(0,0,0,0.35)", pointerEvents: "none", }} > <div style={{ fontSize: 10, color: "#7f8b99", textTransform: "uppercase", letterSpacing: 0.8, }} > {selectedAsset?.symbol} </div> <div style={{ marginTop: 5, fontSize: 10, color: "#687585", }} > {new Date(hoveredChartPoint.sourceTimestamp).toLocaleString("en-US")} </div> <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, fontSize: 11, }} > <div> <span style={{ color: "#687585", }} > O </span>{" "} {formatPrice(hoveredChartPoint.ohlc.open)} </div> <div> <span style={{ color: "#687585", }} > H </span>{" "} {formatPrice(hoveredChartPoint.ohlc.high)} </div> <div> <span style={{ color: "#687585", }} > L </span>{" "} {formatPrice(hoveredChartPoint.ohlc.low)} </div> <div> <span style={{ color: "#687585", }} > C </span>{" "} {formatPrice(hoveredChartPoint.ohlc.close)} </div> </div> </div>)}

                    <div
                        ref={
                            pixiContainerRef
                        }
                        style={{
                            width:
                                "100%",
                            height:
                                "100%",
                            minHeight:
                                height,
                        }}
                    />
                </div>
            </div>

            {/* Timeframes */}
            <div
                style={{
                    height: 50,
                    minHeight: 50,
                    display: "flex",
                    alignItems:
                        "center",
                    gap: 3,
                    padding:
                        "0 12px",
                    borderTop:
                        "1px solid #1c2530",
                    background:
                        "#0d131a",
                }}
            >
                <div
                    style={{
                        fontSize: 9,
                        color:
                            "#596574",
                        textTransform:
                            "uppercase",
                        letterSpacing:
                            0.8,
                        marginRight: 5,
                    }}
                >
                    Timeframe
                </div>

                {TIMEFRAMES.map(
                    (
                        item
                    ) => {
                        const active =
                            timeframe ===
                            item.id;

                        return (
                            <button
                                key={
                                    item.id
                                }
                                type="button"
                                onClick={() =>
                                    setTimeframe(
                                        item.id
                                    )
                                }
                                style={{
                                    border:
                                        "1px solid transparent",
                                    background:
                                        active
                                            ? "#253342"
                                            : "transparent",
                                    color:
                                        active
                                            ? "#ffffff"
                                            : "#6d7885",
                                    borderRadius:
                                        5,
                                    padding:
                                        "6px 11px",
                                    cursor:
                                        "pointer",
                                    fontSize:
                                        10,
                                    fontWeight:
                                        active
                                            ? 600
                                            : 400,
                                }}
                            >
                                {
                                    item.label
                                }
                            </button>
                        );
                    }
                )}
            </div>

            {selectedChartPoints.length > 0 && (
                <div
                    style={{
                        width: "100%",
                        marginTop: 8,
                        border:
                            "1px solid #1c2530",
                        borderRadius: 10,
                        background: "#0d131a",
                        // overflow: "hidden",
                    }}
                >
                    {/* Selection toolbar */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginLeft: "auto",
                        }}
                    >
                        <button
                            type="button"
                            disabled={
                                aiLoading ||
                                !selectedEngineStates ||
                                selectedChartPoints.length === 0
                            }
                            onClick={async () => {
                                if (
                                    !selectedEngineStates ||
                                    selectedChartPoints.length === 0
                                ) {
                                    return;
                                }

                                setAiLoading(true);
                                setAiError("");
                                setAiExplanation("");

                                try {
                                    const prompt = `
You are the financial market analysis AI for a trading simulation.

Analyze the selected market period using ALL supplied engine data.

Your job is to explain WHY the selected asset moved up or down.

Analyze:

1. Price movement of the selected asset.
2. Open, high, low and close behavior.
3. Economic conditions.
4. Interest rates and bond yields.
5. Currency strength and currency relationships.
6. Market sentiment.
7. International stock and commodity markets.
8. Nepal market conditions.
9. Cross-market correlations.
10. News/events when available.
11. Whether the movement is mainly:
   - fundamental
   - monetary-policy driven
   - sentiment driven
   - cross-market driven
   - news driven
   - or market noise.

Important rules:

- Use ONLY the supplied data.
- Do not invent external facts.
- Do not assume missing information.
- Explain causal relationships carefully.
- Mention conflicting signals when they exist.
- Explain why the price moved up OR down.
- Explain the strongest drivers first.
- Keep the explanation trader-friendly.
- Do not give financial advice.
- Do not simply repeat the raw JSON.

Selected Asset:
${JSON.stringify(
                                        {
                                            symbol:
                                                selectedAsset?.symbol ??
                                                "Unknown",

                                            name:
                                                selectedAsset?.name ??
                                                "Unknown",

                                            category:
                                                selectedAsset?.category ??
                                                "Unknown",
                                        },
                                        null,
                                        2
                                    )}

Selected Timeframe:
${timeframe}

Selected Candle Range:
${JSON.stringify(
                                        selectedChartPoints,
                                        null,
                                        2
                                    )}

Selected Engine States:
${JSON.stringify(
                                        selectedEngineStates,
                                        null,
                                        2
                                    )}

Return a clear plain-text market explanation.
`.trim();

                                    const response =
                                        await fetch(
                                            "http://127.0.0.1:3001/api/chat",
                                            {
                                                method: "POST",

                                                headers: {
                                                    "Content-Type":
                                                        "application/json",

                                                    Accept:
                                                        "text/event-stream",
                                                },

                                                body:
                                                    JSON.stringify({
                                                        model:
                                                            "qwen3:4b",

                                                        thinking:
                                                            false,

                                                        message:
                                                            prompt,
                                                    }),
                                            }
                                        );

                                    if (!response.ok) {
                                        const errorText =
                                            await response.text();

                                        throw new Error(
                                            errorText ||
                                            `AI request failed with status ${response.status}.`
                                        );
                                    }

                                    if (!response.body) {
                                        throw new Error(
                                            "AI response stream is unavailable."
                                        );
                                    }

                                    const reader =
                                        response.body.getReader();

                                    const decoder =
                                        new TextDecoder();

                                    let buffer = "";

                                    while (true) {
                                        const {
                                            value,
                                            done,
                                        } =
                                            await reader.read();

                                        if (done) {
                                            break;
                                        }

                                        buffer +=
                                            decoder.decode(
                                                value,
                                                {
                                                    stream: true,
                                                }
                                            );

                                        /*
                                         * Backend sends SSE events like:
                                         *
                                         * data: {"type":"token","content":"hello"}
                                         *
                                         * Keep incomplete lines in
                                         * the buffer until the next chunk.
                                         */
                                        const lines =
                                            buffer.split("\n");

                                        buffer =
                                            lines.pop() ?? "";

                                        for (
                                            const line of lines
                                        ) {
                                            const trimmed =
                                                line.trim();

                                            if (
                                                !trimmed ||
                                                !trimmed.startsWith(
                                                    "data:"
                                                )
                                            ) {
                                                continue;
                                            }

                                            const payload =
                                                trimmed.slice(
                                                    "data:".length
                                                ).trim();

                                            if (!payload) {
                                                continue;
                                            }

                                            let event:
                                                | {
                                                    type?: string;
                                                    content?: string;
                                                    message?: string;
                                                    model?: string;
                                                    thinking?: boolean;
                                                };

                                            try {
                                                event =
                                                    JSON.parse(
                                                        payload
                                                    );
                                            } catch {
                                                /*
                                                 * Ignore malformed/
                                                 * incomplete SSE data.
                                                 */
                                                continue;
                                            }

                                            /*
                                             * Stream each token
                                             * directly into React state.
                                             */
                                            if (
                                                event.type ===
                                                "token" &&
                                                event.content
                                            ) {
                                                setAiExplanation(
                                                    previous =>
                                                        previous +
                                                        event.content
                                                );

                                                continue;
                                            }

                                            /*
                                             * Explicit backend error.
                                             */
                                            if (
                                                event.type ===
                                                "error"
                                            ) {
                                                throw new Error(
                                                    event.message ||
                                                    "AI generation failed."
                                                );
                                            }

                                            /*
                                             * start / done events
                                             * require no UI action.
                                             */
                                            if (
                                                event.type ===
                                                "done"
                                            ) {
                                                continue;
                                            }
                                        }
                                    }

                                    /*
                                     * Flush any remaining decoder data.
                                     */
                                    buffer +=
                                        decoder.decode();

                                    if (
                                        buffer.trim()
                                    ) {
                                        const lines =
                                            buffer.split("\n");

                                        for (
                                            const line of lines
                                        ) {
                                            const trimmed =
                                                line.trim();

                                            if (
                                                !trimmed ||
                                                !trimmed.startsWith(
                                                    "data:"
                                                )
                                            ) {
                                                continue;
                                            }

                                            const payload =
                                                trimmed.slice(
                                                    "data:".length
                                                ).trim();

                                            if (!payload) {
                                                continue;
                                            }

                                            try {
                                                const event =
                                                    JSON.parse(
                                                        payload
                                                    ) as {
                                                        type?: string;
                                                        content?: string;
                                                        message?: string;
                                                    };

                                                if (
                                                    event.type ===
                                                    "token" &&
                                                    event.content
                                                ) {
                                                    setAiExplanation(
                                                        previous =>
                                                            previous +
                                                            event.content
                                                    );
                                                }

                                                if (
                                                    event.type ===
                                                    "error"
                                                ) {
                                                    throw new Error(
                                                        event.message ||
                                                        "AI generation failed."
                                                    );
                                                }
                                            } catch (
                                            error
                                            ) {
                                                /*
                                                 * Do not fail the entire
                                                 * response because of an
                                                 * incomplete trailing line.
                                                 */
                                                if (
                                                    error instanceof Error &&
                                                    error.message !==
                                                    "Unexpected end of JSON input"
                                                ) {
                                                    throw error;
                                                }
                                            }
                                        }
                                    }
                                } catch (error) {
                                    setAiError(
                                        error instanceof Error
                                            ? error.message
                                            : "Unable to get AI analysis."
                                    );
                                } finally {
                                    setAiLoading(false);
                                }
                            }}
                            style={{
                                minWidth: 82,
                                height: 32,

                                border:
                                    "1px solid #315b83",

                                background:
                                    aiLoading
                                        ? "#101820"
                                        : "#142333",

                                color:
                                    "#72b9ff",

                                borderRadius: 6,

                                padding:
                                    "0 14px",

                                fontSize: 10,

                                fontWeight: 700,

                                cursor:
                                    aiLoading
                                        ? "default"
                                        : "pointer",

                                opacity:
                                    aiLoading
                                        ? 0.6
                                        : 1,
                            }}
                        >
                            {aiLoading
                                ? "Thinking..."
                                : "Ask AI"}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setSelectedPointRange(null)
                            }
                            style={{
                                minWidth: 82,
                                height: 32,
                                border:
                                    "1px solid #61363b",
                                background:
                                    "#2a1719",
                                color:
                                    "#ff8585",
                                borderRadius: 6,
                                padding:
                                    "0 14px",
                                fontSize: 10,
                                fontWeight: 700,
                                cursor: "pointer",
                            }}
                        >
                            Discard
                        </button>
                    </div>

                    {aiError && (
                        <div
                            style={{
                                marginTop: 10,

                                border:
                                    "1px solid #5b2d35",

                                background:
                                    "#1a0f13",

                                borderRadius: 6,

                                padding: 10,

                                color:
                                    "#ff7b88",

                                fontSize: 10,

                                lineHeight: 1.5,
                            }}
                        >
                            {aiError}
                        </div>
                    )}

                    {(aiLoading || aiExplanation) && (
                        <div
                            style={{
                                marginTop: 10,

                                border:
                                    "1px solid #294662",

                                background:
                                    "#0b121a",

                                borderRadius: 7,

                                overflow:
                                    "hidden",
                            }}
                        >
                            <div
                                style={{
                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "space-between",

                                    padding:
                                        "8px 10px",

                                    borderBottom:
                                        "1px solid #202b36",

                                    background:
                                        "#111820",
                                }}
                            >
                                <div
                                    style={{
                                        color:
                                            "#72b9ff",

                                        fontSize:
                                            10,

                                        fontWeight:
                                            700,
                                    }}
                                >
                                    AI Market Analysis
                                </div>

                                <div
                                    style={{
                                        color:
                                            aiLoading
                                                ? "#72b9ff"
                                                : "#596574",

                                        fontSize:
                                            9,

                                        fontWeight:
                                            600,
                                    }}
                                >
                                    {aiLoading
                                        ? "Streaming..."
                                        : "Complete"}
                                </div>
                            </div>

                            <div
                                style={{
                                    padding:
                                        12,

                                    color:
                                        "#b8c3cf",

                                    fontSize:
                                        11,

                                    lineHeight:
                                        1.7,

                                    whiteSpace:
                                        "pre-wrap",

                                    minHeight:
                                        42,
                                }}
                            >
                                {aiExplanation}

                                {aiLoading && (
                                    <span
                                        style={{
                                            marginLeft:
                                                3,

                                            color:
                                                "#72b9ff",

                                            opacity:
                                                0.75,

                                            animation:
                                                "aiCursorBlink 1s infinite",
                                        }}
                                    >
                                        ▋
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Selected candle data */}

                    {selectedChartPoints.map((point, index) => {
                        const bullish =
                            point.ohlc.close >=
                            point.ohlc.open;

                        return (
                            <div
                                key={`${point.sourceTimestamp}-${index}`}
                                style={{
                                    padding: 12,
                                    border:
                                        "1px solid #24303c",
                                    borderRadius: 8,
                                    background:
                                        "#10171f",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "#dce6f0",
                                            fontSize: 10,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Candle {index + 1}
                                    </span>

                                    <span
                                        style={{
                                            color: bullish
                                                ? "#35d07f"
                                                : "#ff5c5c",
                                            fontSize: 9,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {bullish
                                            ? "BULLISH"
                                            : "BEARISH"}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        marginTop: 5,
                                        fontSize: 9,
                                        color: "#596574",
                                    }}
                                >
                                    {new Date(
                                        point.sourceTimestamp
                                    ).toLocaleString("en-US")}
                                </div>

                                <div
                                    style={{
                                        marginTop: 10,
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(2, 1fr)",
                                        gap: 6,
                                        fontSize: 10,
                                        color: "#b8c2cd",
                                    }}
                                >
                                    <div>
                                        <span
                                            style={{
                                                color: "#657382",
                                            }}
                                        >
                                            O
                                        </span>{" "}
                                        {formatPrice(
                                            point.ohlc.open
                                        )}
                                    </div>

                                    <div>
                                        <span
                                            style={{
                                                color: "#657382",
                                            }}
                                        >
                                            H
                                        </span>{" "}
                                        {formatPrice(
                                            point.ohlc.high
                                        )}
                                    </div>

                                    <div>
                                        <span
                                            style={{
                                                color: "#657382",
                                            }}
                                        >
                                            L
                                        </span>{" "}
                                        {formatPrice(
                                            point.ohlc.low
                                        )}
                                    </div>

                                    <div>
                                        <span
                                            style={{
                                                color: "#657382",
                                            }}
                                        >
                                            C
                                        </span>{" "}
                                        {formatPrice(
                                            point.ohlc.close
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}


            {selectedEngineStates && (
                <div
                    style={{
                        marginTop: 12,
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 8,
                    }}
                >
                    {(
                        [
                            [
                                "Pricing",
                                selectedEngineStates.pricing,
                            ],
                            [
                                "Currency",
                                selectedEngineStates.currency,
                            ],
                            [
                                "Bonds",
                                selectedEngineStates.bond,
                            ],
                            [
                                "Sentiment",
                                selectedEngineStates.sentiment,
                            ],
                            [
                                "International Market",
                                selectedEngineStates.market,
                            ],
                            [
                                "Nepal Market",
                                selectedEngineStates.nepal,
                            ],
                            [
                                "Economic",
                                selectedEngineStates.economic,
                            ],
                            [
                                "Correlation",
                                selectedEngineStates.correlation,
                            ],
                        ] as Array<
                            [
                                string,
                                EngineSnapshotLike | null
                            ]
                        >
                    ).map(
                        ([label, snapshot]) => {
                            if (!snapshot) {
                                return null;
                            }

                            return (
                                <div
                                    key={label}
                                    style={{
                                        border:
                                            "1px solid #202b36",
                                        borderRadius: 6,
                                        overflow: "hidden",
                                        background:
                                            "#0b0f14",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding:
                                                "7px 9px",
                                            borderBottom:
                                                "1px solid #202b36",
                                            background:
                                                "#111820",
                                            color:
                                                "#aeb7c2",
                                            fontSize: 10,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {label}
                                    </div>

                                    <div
                                        style={{
                                            padding:
                                                "6px 9px",
                                            borderBottom:
                                                "1px solid #202b36",
                                            color:
                                                "#596574",
                                            fontSize: 9,
                                        }}
                                    >
                                        {new Date(
                                            snapshot.timestamp
                                        ).toLocaleString(
                                            "en-US"
                                        )}
                                    </div>

                                    <pre
                                        style={{
                                            margin: 0,
                                            padding: 10,
                                            maxHeight: 210,
                                            overflow: "auto",
                                            color:
                                                "#82909f",
                                            fontSize: 9,
                                            lineHeight: 1.5,
                                            fontFamily:
                                                "monospace",
                                            whiteSpace:
                                                "pre-wrap",
                                            wordBreak:
                                                "break-word",
                                        }}
                                    >
                                        {JSON.stringify(
                                            snapshot.state,
                                            null,
                                            2
                                        )}
                                    </pre>
                                </div>
                            );
                        }
                    )}
                </div>
            )}

        </div >
    );
}
