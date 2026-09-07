import {
    QuizQuestion,
} from "./quiz-engine.types";

export const DEMO_QUIZ_QUESTIONS:
    QuizQuestion[] = [
    /*
     * ======================================
     * EASY
     * ======================================
     */

    {
        id: "macro-easy-001",

        question:
            "What usually happens to borrowing costs when a central bank raises interest rates?",

        options: [
            "They usually increase",
            "They usually decrease",
            "They remain exactly unchanged",
            "They become zero",
        ],

        correctAnswer: 0,

        difficulty: "easy",

        category:
            "monetaryPolicy",

        explanation:
            "Higher policy rates generally increase borrowing costs across the economy, which can reduce credit demand and economic activity.",
    },

    {
        id: "macro-easy-002",

        question:
            "What does GDP primarily measure?",

        options: [
            "The total value of goods and services produced",
            "The country's total money supply",
            "The country's foreign reserves only",
            "The number of people employed",
        ],

        correctAnswer: 0,

        difficulty: "easy",

        category:
            "macroeconomics",

        explanation:
            "Gross Domestic Product measures the value of final goods and services produced within an economy during a period.",
    },

    {
        id: "forex-easy-001",

        question:
            "In EUR/USD, which currency is the base currency?",

        options: [
            "USD",
            "EUR",
            "Both",
            "Neither",
        ],

        correctAnswer: 1,

        difficulty: "easy",

        category: "forex",

        explanation:
            "In EUR/USD, EUR is the base currency and USD is the quote currency.",
    },

    {
        id: "trading-easy-001",

        question:
            "What does a market order generally attempt to do?",

        options: [
            "Execute immediately at the available market price",
            "Wait until a specific price is reached",
            "Guarantee a specific execution price",
            "Cancel all existing orders",
        ],

        correctAnswer: 0,

        difficulty: "easy",

        category: "trading",

        explanation:
            "A market order prioritizes execution rather than a guaranteed price.",
    },

    /*
     * ======================================
     * MEDIUM
     * ======================================
     */

    {
        id: "forex-medium-001",

        question:
            "If EUR/USD rises from 1.0800 to 1.0900, what does that generally mean?",

        options: [
            "EUR weakened against USD",
            "EUR strengthened against USD",
            "USD strengthened against EUR",
            "Neither currency changed",
        ],

        correctAnswer: 1,

        difficulty: "medium",

        category: "forex",

        explanation:
            "A higher EUR/USD exchange rate means one euro buys more US dollars, so the euro strengthened relative to the dollar.",
    },

    {
        id: "forex-medium-002",

        question:
            "If USD/CAD falls, which relationship is generally occurring?",

        options: [
            "USD is strengthening against CAD",
            "CAD is strengthening against USD",
            "Both currencies are necessarily weakening",
            "The Canadian economy has stopped growing",
        ],

        correctAnswer: 1,

        difficulty: "medium",

        category: "forex",

        explanation:
            "USD/CAD represents the amount of CAD needed for one USD. A falling pair generally means CAD is gaining value relative to USD.",
    },

    {
        id: "macro-medium-001",

        question:
            "Why can higher inflation eventually lead a central bank to raise interest rates?",

        options: [
            "To increase inflation further",
            "To reduce demand and inflationary pressure",
            "To eliminate unemployment completely",
            "To guarantee stock prices rise",
        ],

        correctAnswer: 1,

        difficulty: "medium",

        category:
            "monetaryPolicy",

        explanation:
            "Higher interest rates can reduce borrowing and spending, helping reduce demand-driven inflationary pressure.",
    },

    {
        id: "risk-medium-001",

        question:
            "What is leverage in trading?",

        options: [
            "Using borrowed exposure to control a larger position",
            "A guaranteed profit mechanism",
            "A method of eliminating market volatility",
            "A type of dividend",
        ],

        correctAnswer: 0,

        difficulty: "medium",

        category: "risk",

        explanation:
            "Leverage allows a trader to control a larger notional position with a smaller amount of capital, increasing both potential gains and losses.",
    },

    /*
     * ======================================
     * HARD
     * ======================================
     */

    {
        id: "macro-hard-001",

        question:
            "Why can a higher US interest-rate differential support USD?",

        options: [
            "It can increase the relative attractiveness of USD-denominated assets",
            "It guarantees US stocks will rise",
            "It automatically lowers US inflation to zero",
            "It forces all currencies to depreciate equally",
        ],

        correctAnswer: 0,

        difficulty: "hard",

        category:
            "monetaryPolicy",

        explanation:
            "Higher relative yields can increase demand for USD-denominated assets, creating upward pressure on the US dollar, although actual FX behavior also depends on expectations and other factors.",
    },

    {
        id: "forex-hard-001",

        question:
            "If USD strengthens broadly while CAD remains unchanged, what would you generally expect for USD/CAD?",

        options: [
            "It should generally rise",
            "It should generally fall",
            "It must become exactly 1.00",
            "It cannot change",
        ],

        correctAnswer: 0,

        difficulty: "hard",

        category: "forex",

        explanation:
            "USD/CAD is USD relative to CAD. If USD appreciates while CAD is unchanged, fewer CAD are required to represent the same relative value? Actually the quote convention means a stronger USD generally pushes USD/CAD higher.",
    },

    {
        id: "markets-hard-001",

        question:
            "Why can rising bond yields pressure equity valuations?",

        options: [
            "Higher yields can increase the discount rate applied to future cash flows",
            "Higher yields always increase corporate earnings",
            "Bond yields determine stock prices directly",
            "Equities cannot coexist with bonds",
        ],

        correctAnswer: 0,

        difficulty: "hard",

        category: "markets",

        explanation:
            "Higher discount rates can reduce the present value of future corporate cash flows, which can put pressure on equity valuations.",
    },

    {
        id: "risk-hard-001",

        question:
            "What is slippage?",

        options: [
            "The difference between the expected execution price and actual execution price",
            "The broker's annual account fee",
            "The difference between GDP and inflation",
            "The spread between two economies",
        ],

        correctAnswer: 0,

        difficulty: "hard",

        category: "risk",

        explanation:
            "Slippage occurs when an order is filled at a different price than the trader expected, often because of market movement or limited liquidity.",
    },

    {
        id: "trading-hard-001",

        question:
            "Why can a stop order experience significant slippage during a fast market move?",

        options: [
            "The market may move beyond the stop price before sufficient liquidity is available",
            "Stop orders always guarantee their stop price",
            "Stops temporarily freeze the market",
            "The trading engine ignores market prices",
        ],

        correctAnswer: 0,

        difficulty: "hard",

        category: "trading",

        explanation:
            "A stop order generally becomes a market order after triggering, so rapid price movement or low liquidity can result in execution away from the stop level.",
    },
];