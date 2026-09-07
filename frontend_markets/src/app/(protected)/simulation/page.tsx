"use client";
import './SimulationPage.css';
import { useEffect, useMemo, useRef, useState } from "react";

import { SimulationClock } from "../clock/simulation-clock";

import type {
    SimulationDirection,
    SimulationSpeed,
} from "../clock/simulation-clock.types";

import { EconomicEngine } from "../engine/economy/economic-engine";


import type { EconomicState } from "../engine/economy/economic-engine.types";


import { BondEngine } from "../engine/bond/bond-engine";

import type { BondState, BondStateSnapshot } from "../engine/bond/bond-engine.types";

import { NewsEventEngine } from "../engine/news-event/news-event-engine";

import type {
    NewsEvent,
} from "../engine/news-event/news-event.types";

import { SentimentEngine } from "../engine/sentiment/sentiment-engine";

import type {
    SentimentState,
} from "../engine/sentiment/sentiment.types";

import { CurrencyEngine } from "../engine/currency/currency-engine";

import type {
    CurrencyState,
} from "../engine/currency/currency-engine.types";

import { MarketEngine } from "../engine/market/market-engine";

import type {
    MarketState,
} from "../engine/market/market-engine.types";


import {
    NepalMarketEngine,
} from "../engine/nepal/nepal-engine";

import type {
    NepalMarketState,
} from "../engine/nepal/nepal-engine.types";

import { CorrelationEngine } from "../engine/correlation/correlation-engine";

import type {
    CorrelationState,
} from "../engine/correlation/correlation-engine.types";

import { PricingEngine } from "../engine/pricing/pricing-engine";
import {
    PricingSnapshot,
    PricingState,
} from "../engine/pricing/pricing-engine.types";
import PricingChart, { EngineSnapshotLike } from "@/components/pricing-chart";

import {
    TradingEngine,
} from "../engine/trading/trading-engine";

import {
    TradingAccountState,
    TradingOrderType,
    TradingSide,
} from "../engine/trading/trading-engine.types";

import {
    QuizEngine,
} from "../engine/quiz/quiz-engine";

import {
    QuizResult,
    QuizSession,
} from "../engine/quiz/quiz-engine.types";

import {
    PlayerPerformanceEngine,
} from "../engine/player-performance/player-performance-engine";

import {
    PerformanceRiskLevel,
    PlayerPerformanceState,
} from "../engine/player-performance/player-performance-engine.types";


import type {
    CurrencySnapshot,
} from "../engine/currency/currency-engine.types";

import type {
    SentimentSnapshot,
} from "../engine/sentiment/sentiment.types";

import type {
    MarketSnapshot,
} from "../engine/market/market-engine.types";

import type {
    NepalMarketSnapshot,
} from "../engine/nepal/nepal-engine.types";

import type {
    EconomicStateSnapshot,
} from "../engine/economy/economic-engine.types";

import type {
    CorrelationSnapshot,
} from "../engine/correlation/correlation-engine.types";
import NepalMarketSection from "@/components/NepalMarketSection";
import InternationalMarketsSection from "@/components/InternationalMarketsSection";
import CurrencyIndicesSection from "@/components/CurrencyIndicesSection";
import SentimentSection from "@/components/SentimentSection";
import NewsEventsSection from "@/components/NewsEventsSection";
import EconomicStateSection from "@/components/EconomicStateSection";
import BondMarketSection from "@/components/BondMarketSection";
import MarketCorrelationSection from "@/components/MarketCorrelationSection";
import DemoTradingSection from "@/components/DemoTradingSection";
import PlayerPerformanceReport from "@/components/PlayerPerformanceReport";
import QuizSection from "@/components/QuizSection";
import SimulationControls from "@/components/SimulationControls";

const SIMULATION_SPEEDS: SimulationSpeed[] = [
    1,
    10,
    100,
    1_000,
    10_000,
    100_000,
    // 1_000_000,
    // 10_000_000,
];

const INITIAL_SIMULATION_TIME = new Date(
    "2026-01-01T00:00:00"
).getTime();

const TRADING_INSTRUMENTS = [
    {
        symbol: "EUR/USD",
        label: "EUR/USD",
        assetType: "currency",
    },
    {
        symbol: "GBP/USD",
        label: "GBP/USD",
        assetType: "currency",
    },
    {
        symbol: "USD/JPY",
        label: "USD/JPY",
        assetType: "currency",
    },
    {
        symbol: "USD/CHF",
        label: "USD/CHF",
        assetType: "currency",
    },
    {
        symbol: "AUD/USD",
        label: "AUD/USD",
        assetType: "currency",
    },
    {
        symbol: "USD/CAD",
        label: "USD/CAD",
        assetType: "currency",
    },
    {
        symbol: "NZD/USD",
        label: "NZD/USD",
        assetType: "currency",
    },
    {
        symbol: "USD/CNY",
        label: "USD/CNY",
        assetType: "currency",
    },
    {
        symbol: "USD/INR",
        label: "USD/INR",
        assetType: "currency",
    },
    {
        symbol: "USD/NPR",
        label: "USD/NPR",
        assetType: "currency",
    },
    {
        symbol: "NEPSE",
        label: "NEPSE",
        assetType: "nepalIndex",
    },
] as const;

export default function SimulationPage() {
    const clockRef = useRef<SimulationClock | null>(null);

    const pricingEngineRef =
        useRef<PricingEngine | null>(null);

    const correlationEngineRef =
        useRef<CorrelationEngine | null>(null);

    const nepalEngineRef =
        useRef<NepalMarketEngine | null>(
            null
        );

    const currencyEngineRef =
        useRef<CurrencyEngine | null>(null);

    const economicEngineRef =
        useRef<EconomicEngine | null>(null);

    const bondEngineRef =
        useRef<BondEngine | null>(null);

    const minimumTime =
        clockRef.current?.getMinimumTime();

    const newsEventEngineRef =
        useRef<NewsEventEngine | null>(null);

    const sentimentEngineRef =
        useRef<SentimentEngine | null>(null);

    const marketEngineRef =
        useRef<MarketEngine | null>(null);

    const tradingEngineRef =
        useRef<TradingEngine | null>(null);

    const playerPerformanceEngineRef =
        useRef<
            PlayerPerformanceEngine | null
        >(null);

    const [
        playerPerformanceState,
        setPlayerPerformanceState,
    ] = useState<PlayerPerformanceState | null>(
        null
    );

    const [
        tradingState,
        setTradingState,
    ] = useState<TradingAccountState | null>(
        null
    );

    const quizEngineRef =
        useRef<QuizEngine | null>(null);

    const [
        quizSession,
        setQuizSession,
    ] = useState<QuizSession | null>(
        null
    );

    const [
        quizResult,
        setQuizResult,
    ] = useState<QuizResult | null>(
        null
    );

    const [
        quizAnswerLocked,
        setQuizAnswerLocked,
    ] =
        useState(false);

    const [
        selectedQuizAnswer,
        setSelectedQuizAnswer,
    ] =
        useState<number | null>(null);

    /*
     * Start an automatic quiz every
     * 30 simulated minutes.
     */
    const QUIZ_INTERVAL_MS =
        30 * 60 * 1000;

    const lastQuizStartTimeRef =
        useRef<number>(
            INITIAL_SIMULATION_TIME
        );

    const [
        tradingSymbol,
        setTradingSymbol,
    ] = useState<string>("EUR/USD");

    const [
        tradingLeverage,
        setTradingLeverage,
    ] = useState<number>(10);

    const [
        tradingLotSize,
        setTradingLotSize,
    ] = useState<number>(0.1);

    const [
        tradingOrderType,
        setTradingOrderType,
    ] =
        useState<TradingOrderType>("market");

    const [
        tradingPrice,
        setTradingPrice,
    ] =
        useState<number | "">("");

    const [
        tradingSide,
        setTradingSide,
    ] =
        useState<TradingSide>("buy");

    const [pricingState, setPricingState] =
        useState<PricingState | null>(null);

    const [correlationState, setCorrelationState] =
        useState<CorrelationState | null>(null);

    const [nepalState, setNepalState] =
        useState<NepalMarketState | null>(
            null
        );

    const [marketState, setMarketState] =
        useState<MarketState | null>(null);

    const [currencyState, setCurrencyState] =
        useState<CurrencyState | null>(null);

    const [sentimentState, setSentimentState] =
        useState<SentimentState | null>(null);

    const [newsEvents, setNewsEvents] =
        useState<NewsEvent[]>([]);

    const [bondState, setBondState] =
        useState<BondState | null>(null);

    const [economicState, setEconomicState] =
        useState<EconomicState | null>(null);

    const [currentTime, setCurrentTime] = useState(
        INITIAL_SIMULATION_TIME
    );

    const [speed, setSpeed] =
        useState<SimulationSpeed>(1);

    const [direction, setDirection] =
        useState<SimulationDirection>("forward");

    const [isRunning, setIsRunning] = useState(false);

    const [newsFromDate, setNewsFromDate] =
        useState("");

    const [newsToDate, setNewsToDate] =
        useState("");



    const [
        currencyHistory,
        setCurrencyHistory,
    ] = useState<CurrencySnapshot[]>([]);

    const [
        bondHistory,
        setBondHistory,
    ] = useState<BondStateSnapshot[]>([]);

    const [
        sentimentHistory,
        setSentimentHistory,
    ] = useState<SentimentSnapshot[]>([]);

    const [
        marketHistory,
        setMarketHistory,
    ] = useState<MarketSnapshot[]>([]);

    const [
        nepalHistory,
        setNepalHistory,
    ] = useState<NepalMarketSnapshot[]>([]);

    const [
        economicHistory,
        setEconomicHistory,
    ] = useState<EconomicStateSnapshot[]>([]);

    const [
        correlationHistory,
        setCorrelationHistory,
    ] = useState<CorrelationSnapshot[]>([]);



    const isAtMinimumTime =
        minimumTime !== undefined &&
        currentTime <= minimumTime;
    /**
     * Create the simulation clock.
     */


    const [
        pricingHistory,
        setPricingHistory,
    ] = useState<PricingSnapshot[]>(
        []
    );


    const filteredNewsEvents =
        newsEvents.filter((event) => {
            const eventDate =
                new Date(event.timestamp);

            const date =
                eventDate.toISOString().slice(0, 10);

            if (
                newsFromDate &&
                date < newsFromDate
            ) {
                return false;
            }

            if (
                newsToDate &&
                date > newsToDate
            ) {
                return false;
            }

            return true;
        });

    const handleQuizAnswer =
        (
            answerIndex: number
        ) => {
            const engine =
                quizEngineRef.current;

            if (
                !engine ||
                quizAnswerLocked
            ) {
                return;
            }

            const result =
                engine.answerQuestion(
                    answerIndex
                );

            if (!result) {
                return;
            }

            setSelectedQuizAnswer(
                answerIndex
            );

            setQuizResult(
                result
            );

            setQuizAnswerLocked(
                true
            );

            setQuizSession(
                engine.getSession()
            );
        };

    const handleQuizNext =
        () => {
            const engine =
                quizEngineRef.current;

            if (!engine) {
                return;
            }

            const session =
                engine.getSession();

            setQuizResult(
                null
            );

            setSelectedQuizAnswer(
                null
            );

            setQuizAnswerLocked(
                false
            );

            setQuizSession(
                session
            );
        };

    const handleStartQuiz =
        () => {
            const engine =
                quizEngineRef.current;

            if (!engine) {
                return;
            }

            const session =
                engine.startQuiz();

            setQuizSession(
                session
            );

            setQuizResult(
                null
            );

            setSelectedQuizAnswer(
                null
            );

            setQuizAnswerLocked(
                false
            );

            lastQuizStartTimeRef.current =
                currentTime;
        };

    const handleResetQuiz =
        () => {
            const engine =
                quizEngineRef.current;

            if (!engine) {
                return;
            }

            engine.resetQuiz();

            setQuizSession(
                null
            );

            setQuizResult(
                null
            );

            setSelectedQuizAnswer(
                null
            );

            setQuizAnswerLocked(
                false
            );

            lastQuizStartTimeRef.current =
                currentTime;
        };

    useEffect(() => {

        const quizEngine =
            new QuizEngine(
                INITIAL_SIMULATION_TIME
            );

        quizEngineRef.current =
            quizEngine;

        /*
         * ============================================================
         * ENGINE INITIALIZATION
         * ============================================================
         */

        const tradingEngine =
            new TradingEngine(
                INITIAL_SIMULATION_TIME,
                100_000
            );

        tradingEngineRef.current =
            tradingEngine;

        setTradingState(
            tradingEngine.getState()
        );

        const playerPerformanceEngine =
            new PlayerPerformanceEngine(
                INITIAL_SIMULATION_TIME
            );

        playerPerformanceEngineRef.current =
            playerPerformanceEngine;

        setPlayerPerformanceState(
            playerPerformanceEngine.getState()
        );

        const pricingEngine =
            new PricingEngine(
                INITIAL_SIMULATION_TIME
            );

        const clock =
            new SimulationClock(
                INITIAL_SIMULATION_TIME
            );

        const economicEngine =
            new EconomicEngine(
                INITIAL_SIMULATION_TIME
            );

        const bondEngine =
            new BondEngine(
                INITIAL_SIMULATION_TIME
            );

        const newsEventEngine =
            new NewsEventEngine(
                INITIAL_SIMULATION_TIME
            );

        const sentimentEngine =
            new SentimentEngine(
                INITIAL_SIMULATION_TIME
            );

        const currencyEngine =
            new CurrencyEngine(
                INITIAL_SIMULATION_TIME
            );

        const marketEngine =
            new MarketEngine(
                INITIAL_SIMULATION_TIME
            );

        const nepalEngine =
            new NepalMarketEngine(
                INITIAL_SIMULATION_TIME
            );

        const correlationEngine =
            new CorrelationEngine(
                INITIAL_SIMULATION_TIME
            );


        /*
         * ============================================================
         * STORE ENGINE REFERENCES
         * ============================================================
         */

        pricingEngineRef.current =
            pricingEngine;

        clockRef.current =
            clock;

        economicEngineRef.current =
            economicEngine;

        bondEngineRef.current =
            bondEngine;

        newsEventEngineRef.current =
            newsEventEngine;

        sentimentEngineRef.current =
            sentimentEngine;

        currencyEngineRef.current =
            currencyEngine;

        marketEngineRef.current =
            marketEngine;

        nepalEngineRef.current =
            nepalEngine;

        correlationEngineRef.current =
            correlationEngine;


        /*
         * ============================================================
         * INITIAL REACT STATE
         * ============================================================
         */

        setPricingState(
            pricingEngine.getState()
        );

        setPricingHistory(
            pricingEngine.getHistory()
        );

        setCurrencyHistory(
            currencyEngine.getHistory()
        );

        setBondHistory(
            bondEngine.getHistory()
        );

        setSentimentHistory(
            sentimentEngine.getHistory()
        );

        setMarketHistory(
            marketEngine.getHistory()
        );

        setNepalHistory(
            nepalEngine.getHistory()
        );

        setEconomicHistory(
            economicEngine.getHistory()
        );

        setCorrelationHistory(
            correlationEngine.getHistory()
        );

        setPricingState(
            pricingEngine.getState()
        );

        setCurrentTime(
            INITIAL_SIMULATION_TIME
        );

        setEconomicState(
            economicEngine.getState()
        );

        setBondState(
            bondEngine.getState()
        );

        setNewsEvents(
            newsEventEngine.getEvents()
        );

        setSentimentState(
            sentimentEngine.getState()
        );

        setCurrencyState(
            currencyEngine.getState()
        );

        setMarketState(
            marketEngine.getState()
        );

        setNepalState(
            nepalEngine.getState()
        );

        setCorrelationState(
            correlationEngine.getState()
        );


        /*
         * ============================================================
         * SIMULATION LOOP
         * ============================================================
         */

        const interval =
            window.setInterval(() => {

                /*
                 * ----------------------------------------------------
                 * 1. READ CURRENT SIMULATION TIME
                 * ----------------------------------------------------
                 */

                const clockState =
                    clock.getState();


                const quizEngine =
                    quizEngineRef.current;

                if (
                    quizEngine
                ) {
                    quizEngine.update(
                        clockState
                    );

                    /*
                     * Automatically start a new quiz
                     * after every 30 simulated minutes.
                     *
                     * Only trigger while moving forward.
                     */
                    if (
                        direction === "forward" &&
                        clockState.currentTime -
                        lastQuizStartTimeRef.current >=
                        QUIZ_INTERVAL_MS
                    ) {
                        const currentQuiz =
                            quizEngine.getSession();

                        /*
                         * Don't interrupt an active quiz.
                         */
                        if (
                            !currentQuiz ||
                            currentQuiz.completed
                        ) {
                            const newQuiz =
                                quizEngine.startQuiz();

                            setQuizSession(
                                newQuiz
                            );

                            setQuizResult(
                                null
                            );

                            setSelectedQuizAnswer(
                                null
                            );

                            setQuizAnswerLocked(
                                false
                            );

                            lastQuizStartTimeRef.current =
                                clockState.currentTime;
                        }
                    }

                    /*
                     * Keep the React quiz state synchronized.
                     */
                    const currentQuiz =
                        quizEngine.getSession();

                    setQuizSession(
                        currentQuiz
                    );
                }

                /*
                 * ----------------------------------------------------
                 * 2. UPDATE ALL SOURCE ENGINES
                 * ----------------------------------------------------
                 *
                 * Every engine receives the exact same
                 * SimulationClockState.
                 *
                 * This is important for synchronization.
                 */

                nepalEngine.update(
                    clockState
                );

                economicEngine.update(
                    clockState
                );

                bondEngine.update(
                    clockState
                );

                newsEventEngine.update(
                    clockState
                );

                sentimentEngine.update(
                    clockState
                );

                currencyEngine.update(
                    clockState
                );

                marketEngine.update(
                    clockState
                );

                nepalEngine.update(
                    clockState
                );


                /*
                 * ----------------------------------------------------
                 * 3. READ UPDATED ENGINE STATES
                 * ----------------------------------------------------
                 *
                 * IMPORTANT:
                 *
                 * Do not use the previous React state here.
                 *
                 * React state updates are asynchronous.
                 *
                 * Always get the current state directly from
                 * the engines.
                 */

                const economicState =
                    economicEngine.getState();

                const bondState =
                    bondEngine.getState();

                const newsEvents =
                    newsEventEngine.getEvents();

                const sentimentState =
                    sentimentEngine.getState();

                const currencyState =
                    currencyEngine.getState();

                const marketState =
                    marketEngine.getState();

                const nepalState =
                    nepalEngine.getState();


                /*
                 * ----------------------------------------------------
                 * 4. UPDATE CORRELATION ENGINE
                 * ----------------------------------------------------
                 *
                 * Correlation receives the freshly calculated
                 * state from every other engine.
                 */

                correlationEngine.update(
                    clockState,
                    {
                        economic:
                            economicState,

                        bonds:
                            bondState,

                        currencies:
                            currencyState,

                        markets:
                            marketState,

                        nepal:
                            nepalState,

                        sentiment:
                            sentimentState,

                        news:
                            newsEvents,
                    }
                );

                pricingEngine.update(
                    clockState,
                    {
                        currencies:
                            currencyEngine.getState(),

                        bonds:
                            bondEngine.getState(),

                        sentiment:
                            sentimentEngine.getState(),

                        nepal:
                            nepalEngine.getState(),
                    }
                );

                const tradingEngine =
                    tradingEngineRef.current;

                if (
                    tradingEngine
                ) {
                    tradingEngine.update(
                        clockState,
                        {
                            pricing:
                                pricingEngineRef.current!
                                    .getState(),

                            markets:
                                marketEngineRef.current!
                                    .getState(),

                            nepal:
                                nepalEngineRef.current!
                                    .getState(),
                        }
                    );

                    const playerPerformanceEngine =
                        playerPerformanceEngineRef.current;

                    if (
                        playerPerformanceEngine &&
                        tradingEngine
                    ) {
                        playerPerformanceEngine.update(
                            clockState,
                            tradingEngine.getState()
                        );

                        setPlayerPerformanceState(
                            playerPerformanceEngine.getState()
                        );
                    }

                    setTradingState(
                        tradingEngine.getState()
                    );
                }

                /*
                 * ----------------------------------------------------
                 * 5. UPDATE REACT STATE
                 * ----------------------------------------------------
                 *
                 * The UI is updated only after every engine has
                 * finished processing the current simulation time.
                 */

                const newPricingState =
                    pricingEngine.getState();

                setPricingState(
                    newPricingState
                );

                const newPricingHistory =
                    pricingEngine.getHistory();

                setPricingHistory(
                    newPricingHistory
                );

                setNepalState(
                    nepalEngine.getState()
                );

                setCurrentTime(
                    clockState.currentTime
                );

                setEconomicState(
                    economicState
                );

                setBondState(
                    bondState
                );

                setNewsEvents(
                    newsEvents
                );

                setSentimentState(
                    sentimentState
                );

                setCurrencyState(
                    currencyState
                );

                setMarketState(
                    marketState
                );

                setNepalState(
                    nepalState
                );

                setCorrelationState(
                    correlationEngine.getState()
                );

            }, 50);


        /*
         * ============================================================
         * CLEANUP
         * ============================================================
         */

        return () => {

            window.clearInterval(
                interval
            );

            clock.stop();

            clockRef.current = null;

            economicEngineRef.current =
                null;

            bondEngineRef.current =
                null;

            newsEventEngineRef.current =
                null;

            sentimentEngineRef.current =
                null;

            currencyEngineRef.current =
                null;

            marketEngineRef.current =
                null;

            nepalEngineRef.current =
                null;

            correlationEngineRef.current =
                null;

            pricingEngineRef.current =
                null;

            quizEngineRef.current =
                null;

            playerPerformanceEngineRef.current =
                null;
        };

    }, []);

    /**
     * Start the simulation in the selected direction.
     */

    const tradingInstruments =
        useMemo(() => {
            return TRADING_INSTRUMENTS.filter(
                (instrument) =>
                    tradingState?.quotes[
                    instrument.symbol
                    ] !== undefined
            );
        }, [tradingState]);

    const selectedInstrument =
        TRADING_INSTRUMENTS.find(
            (instrument) =>
                instrument.symbol ===
                tradingSymbol
        );

    const selectedTradingQuote =
        tradingState?.quotes[
        tradingSymbol
        ];

    const selectedPosition =
        tradingState?.positions[
        tradingSymbol
        ];

    const getContractSize = (
        assetType:
            | "currency"
            | "index"
            | "stock"
            | "nepalIndex"
            | "nepalStock"
    ): number => {
        switch (assetType) {
            case "currency":
                return 100_000;

            case "index":
                return 1;

            case "stock":
                return 1;

            case "nepalIndex":
                return 1;

            case "nepalStock":
                return 1;

            default:
                return 1;
        }
    };

    const getOrderQuantity = (): number => {
        if (
            !selectedInstrument ||
            tradingLotSize <= 0
        ) {
            return 0;
        }

        return (
            tradingLotSize *
            getContractSize(
                selectedInstrument.assetType
            )
        );
    };

    const orderQuantity =
        getOrderQuantity();

    const handleStart = (
        selectedDirection: SimulationDirection
    ) => {
        const clock = clockRef.current;

        if (!clock) {
            return;
        }

        clock.setDirection(selectedDirection);
        clock.start();

        setDirection(selectedDirection);
        setIsRunning(true);
    };

    const handleClosePosition =
        (
            symbol: string
        ) => {
            const engine =
                tradingEngineRef.current;

            if (!engine) {
                return;
            }

            engine.closePosition(
                symbol
            );

            setTradingState(
                engine.getState()
            );
        };

    /**
     * Stop the simulation.
     */
    const handleStop = () => {
        const clock = clockRef.current;

        if (!clock) {
            return;
        }

        clock.stop();

        setCurrentTime(clock.getTime());
        setIsRunning(false);
    };

    /**
     * Change simulation speed.
     */
    const handleSpeedChange = (
        selectedSpeed: number
    ) => {
        const clock = clockRef.current;

        if (
            !clock ||
            !SIMULATION_SPEEDS.includes(
                selectedSpeed as SimulationSpeed
            )
        ) {
            return;
        }

        const validSpeed =
            selectedSpeed as SimulationSpeed;

        clock.setSpeed(validSpeed);

        setSpeed(validSpeed);
        setCurrentTime(clock.getTime());
    };

    /**
     * Format simulation date and time.
     */
    const formattedDateTime = new Date(
        currentTime
    ).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    return (
        <main className="simulation-page">
            <section className="simulation-shell">
                {/* Page Header */}
                <header className="simulation-page-header">
                    <div>
                        <div className="simulation-page-kicker">
                            🎮 DEEP MARKETS MIND
                        </div>

                        <h1>Simulation World</h1>

                        <p>
                            Explore markets, discover economic events,
                            and learn how the world economy moves.
                        </p>
                    </div>

                    <div className="simulation-world-badge">
                        <span className="world-badge-icon">
                            🌍
                        </span>

                        <div>
                            <span className="world-badge-label">
                                MARKET WORLD
                            </span>

                            <strong>
                                LIVE SIMULATION
                            </strong>
                        </div>
                    </div>
                </header>

                {/* Simulation Clock */}
                <section className="simulation-clock-section">
                    <div className="simulation-clock-header">
                        <div>
                            <div className="section-kicker">
                                ⏱ TIME CONTROL
                            </div>

                            <h2>Simulation Clock</h2>

                            <p>
                                Control the flow of time and watch
                                the economy react.
                            </p>
                        </div>

                        <div className="clock-status-badge">
                            🕐 SIMULATION MODE
                        </div>
                    </div>

                    {/* Simulation Date */}
                    <SimulationControls
                        formattedDateTime={
                            formattedDateTime
                        }
                        isRunning={isRunning}
                        direction={direction}
                        isAtMinimumTime={
                            isAtMinimumTime
                        }
                        speed={speed}
                        SIMULATION_SPEEDS={
                            SIMULATION_SPEEDS
                        }
                        handleStart={
                            handleStart
                        }
                        handleStop={
                            handleStop
                        }
                        handleSpeedChange={
                            handleSpeedChange
                        }
                    />

                    <PricingChart
                        pricingState={pricingState}
                        history={pricingHistory}
                        currencyHistory={
                            currencyHistory
                        }
                        bondHistory={
                            bondHistory
                        }
                        sentimentHistory={
                            sentimentHistory
                        }
                        marketHistory={
                            marketHistory
                        }
                        nepalHistory={
                            nepalHistory
                        }
                        economicHistory={
                            economicHistory
                        }
                        correlationHistory={
                            correlationHistory
                        }
                    />

                    <DemoTradingSection
                        tradingState={tradingState}
                        tradingSymbol={tradingSymbol}
                        setTradingSymbol={setTradingSymbol}
                        tradingOrderType={tradingOrderType}
                        setTradingOrderType={setTradingOrderType}
                        tradingLeverage={tradingLeverage}
                        setTradingLeverage={setTradingLeverage}
                        tradingLotSize={tradingLotSize}
                        setTradingLotSize={setTradingLotSize}
                        tradingPrice={tradingPrice}
                        setTradingPrice={setTradingPrice}
                        tradingSide={tradingSide}
                        setTradingSide={(value: string) =>
                            setTradingSide(
                                value as TradingSide
                            )
                        }
                        selectedInstrument={selectedInstrument}
                        selectedTradingQuote={
                            selectedTradingQuote
                        }
                        selectedPosition={selectedPosition}
                        orderQuantity={orderQuantity}
                        getOrderQuantity={getOrderQuantity}
                        handleClosePosition={
                            handleClosePosition
                        }
                        tradingEngineRef={tradingEngineRef}
                        setTradingState={setTradingState}
                        TRADING_INSTRUMENTS={[
                            ...TRADING_INSTRUMENTS,
                        ]}
                    />

                    <PlayerPerformanceReport
                        performance={
                            playerPerformanceState
                        }
                    />

                    {!quizSession && (
                        <section className="quiz-launch-card">
                            <div className="quiz-launch-content">
                                <div className="quiz-launch-icon">
                                    🧠
                                </div>

                                <div>
                                    <div className="quiz-launch-kicker">
                                        ⭐ BONUS MISSION
                                    </div>

                                    <div className="quiz-launch-title">
                                        AI Knowledge Quiz
                                    </div>

                                    <div className="quiz-launch-description">
                                        Test your knowledge of
                                        macroeconomics, markets
                                        and trading.
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleStartQuiz
                                }
                                className="quiz-launch-button"
                            >
                                <span>
                                    🎯
                                </span>

                                Start 10 Question Quiz
                            </button>
                        </section>
                    )}

                    <QuizSection
                        quizSession={quizSession}
                        selectedQuizAnswer={
                            selectedQuizAnswer
                        }
                        quizResult={quizResult}
                        quizAnswerLocked={
                            quizAnswerLocked
                        }
                        handleStartQuiz={
                            handleStartQuiz
                        }
                        handleResetQuiz={
                            handleResetQuiz
                        }
                        handleQuizAnswer={
                            handleQuizAnswer
                        }
                        handleQuizNext={
                            handleQuizNext
                        }
                    />




                    <NewsEventsSection
                        newsEvents={newsEvents}
                        filteredNewsEvents={filteredNewsEvents}
                        newsFromDate={newsFromDate}
                        newsToDate={newsToDate}
                        setNewsFromDate={setNewsFromDate}
                        setNewsToDate={setNewsToDate}
                    />

                    <EconomicStateSection
                        economicState={economicState}
                    />

                    <BondMarketSection
                        bondState={bondState}
                    />

                    <MarketCorrelationSection
                        correlationState={correlationState}
                    />

                    <NepalMarketSection
                        nepalState={nepalState}
                    />

                    <InternationalMarketsSection
                        marketState={marketState}
                    />

                    <CurrencyIndicesSection
                        currencyState={currencyState}
                    />

                    <SentimentSection
                        sentimentState={sentimentState}
                    />
                </section>
            </section>
        </main>
    );
}
