"use client";

import Link from "next/link";
import "./landing.css";

const features = [
    {
        number: "01",
        icon: "🌎",
        title: "Explore",
        description:
            "Enter a living world of currencies, stocks, commodities, bonds, economies, and global events.",
    },
    {
        number: "02",
        icon: "🎯",
        title: "Make Decisions",
        description:
            "Buy, sell, wait, observe, or take a risk. Every decision changes your journey.",
    },
    {
        number: "03",
        icon: "⚡",
        title: "Face the Market",
        description:
            "Markets move because the world moves. News, inflation, interest rates, sentiment, and surprises can change everything.",
    },
    {
        number: "04",
        icon: "🧠",
        title: "Level Up",
        description:
            "Build your financial thinking through experimentation, mistakes, probability, and experience.",
    },
];

const markets = [
    {
        icon: "💱",
        name: "FOREX",
        description: "Currencies & exchange rates",
    },
    {
        icon: "📈",
        name: "STOCKS",
        description: "Companies & indexes",
    },
    {
        icon: "🪙",
        name: "COMMODITIES",
        description: "Gold, oil & resources",
    },
    {
        icon: "🏦",
        name: "BONDS",
        description: "Interest rates & debt",
    },
    {
        icon: "🌐",
        name: "MACRO",
        description: "The global economy",
    },
    {
        icon: "💭",
        name: "SENTIMENT",
        description: "What the crowd thinks",
    },
];

const events = [
    {
        type: "ECONOMIC EVENT",
        title: "Central Bank Raises Rates",
        impact: "HIGH",
        color: "orange",
    },
    {
        type: "MARKET NEWS",
        title: "Global Growth Surprises",
        impact: "MEDIUM",
        color: "cyan",
    },
    {
        type: "MARKET SENTIMENT",
        title: "Investors Become Nervous",
        impact: "HIGH",
        color: "pink",
    },
];

export default function HomePage() {
    return (
        <main className="landing-page">

            {/* ================= NAVBAR ================= */}

            <nav className="navbar">
                <div className="nav-inner">

                    <Link
                        href="/"
                        className="logo"
                    >
                        <span className="logo-mark">
                            D
                        </span>

                        <span className="logo-text">
                            DEEP MARKETS
                            <small>MIND</small>
                        </span>
                    </Link>

                    <div className="nav-links">
                        <a href="#about">
                            About
                        </a>

                        <a href="#markets">
                            Markets
                        </a>

                        <a href="#how-it-works">
                            How To Play
                        </a>
                    </div>

                    <Link
                        href="/auth"
                        className="nav-button"
                    >
                        PLAY NOW
                        <span>→</span>
                    </Link>

                </div>
            </nav>


            {/* ================= HERO ================= */}

            <section className="hero">

                <div className="hero-background-shape shape-one" />
                <div className="hero-background-shape shape-two" />

                <div className="hero-content">

                    <div className="game-status">
                        <span className="status-dot" />
                        PLAYER 01
                        <span className="status-divider">
                            /
                        </span>
                        READY
                    </div>

                    <div className="hero-eyebrow">
                        🎮 THE MACROECONOMIC ADVENTURE
                    </div>

                    <h1>
                        LEARN.
                        <br />
                        <span>
                            PLAY.
                        </span>
                        <br />
                        <strong>
                            SPECULATE.
                        </strong>
                    </h1>

                    <p className="hero-description">
                        Welcome to a financial world where
                        economies move, markets react, and
                        your decisions matter.
                    </p>

                    <p className="hero-description-small">
                        Learn economics by actually
                        experiencing it.
                    </p>

                    <div className="hero-actions">

                        <Link
                            href="/auth"
                            className="primary-button"
                        >
                            <span>▶</span>
                            START GAME
                        </Link>

                        <a
                            href="#how-it-works"
                            className="secondary-button"
                        >
                            HOW TO PLAY
                        </a>

                    </div>

                    <div className="hero-footnote">
                        <span>✓</span>
                        No financial experience required
                    </div>

                </div>


                {/* ================= GAME HUD ================= */}

                <div className="hero-game">

                    <div className="game-window">

                        <div className="window-header">

                            <div className="window-title">
                                <span>
                                    ◈
                                </span>
                                MARKET WORLD
                            </div>

                            <div className="window-controls">
                                <span>−</span>
                                <span>□</span>
                                <span>×</span>
                            </div>

                        </div>

                        <div className="game-map">

                            <div className="map-label label-one">
                                🌎 GLOBAL ECONOMY
                            </div>

                            <div className="map-label label-two">
                                📊 MARKETS
                            </div>

                            <div className="map-label label-three">
                                ⚡ EVENTS
                            </div>

                            <div className="floating-coin coin-one">
                                $
                            </div>

                            <div className="floating-coin coin-two">
                                €
                            </div>

                            <div className="floating-coin coin-three">
                                ¥
                            </div>

                            <div className="game-chart">

                                <div className="chart-top">

                                    <div>
                                        <small>
                                            GLOBAL MARKET
                                        </small>

                                        <strong>
                                            8,421.72
                                        </strong>
                                    </div>

                                    <span className="positive">
                                        +12.48%
                                    </span>

                                </div>

                                <div className="chart-area">

                                    <div className="chart-grid-line line-1" />
                                    <div className="chart-grid-line line-2" />
                                    <div className="chart-grid-line line-3" />
                                    <div className="chart-grid-line line-4" />

                                    <svg
                                        viewBox="0 0 600 230"
                                        preserveAspectRatio="none"
                                    >
                                        <defs>
                                            <linearGradient
                                                id="chartGradient"
                                                x1="0"
                                                x2="0"
                                                y1="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopOpacity="0.4"
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopOpacity="0"
                                                />
                                            </linearGradient>
                                        </defs>

                                        <polygon
                                            points="
                                                0,190
                                                40,180
                                                70,190
                                                100,150
                                                135,165
                                                170,125
                                                210,140
                                                245,100
                                                280,120
                                                315,75
                                                350,95
                                                390,55
                                                425,75
                                                465,40
                                                500,60
                                                540,25
                                                600,12
                                                600,230
                                                0,230
                                            "
                                            fill="url(#chartGradient)"
                                        />

                                        <polyline
                                            points="
                                                0,190
                                                40,180
                                                70,190
                                                100,150
                                                135,165
                                                170,125
                                                210,140
                                                245,100
                                                280,120
                                                315,75
                                                350,95
                                                390,55
                                                425,75
                                                465,40
                                                500,60
                                                540,25
                                                600,12
                                            "
                                            fill="none"
                                            strokeWidth="5"
                                        />

                                    </svg>

                                    <div className="chart-bubble">
                                        +12.48%
                                    </div>

                                </div>

                            </div>

                            <div className="market-ticker">

                                <div>
                                    <span>
                                        EUR/USD
                                    </span>

                                    <strong>
                                        1.1742
                                    </strong>

                                    <small>
                                        +0.42%
                                    </small>
                                </div>

                                <div>
                                    <span>
                                        GOLD
                                    </span>

                                    <strong>
                                        3,621
                                    </strong>

                                    <small>
                                        +1.13%
                                    </small>
                                </div>

                                <div>
                                    <span>
                                        S&P 500
                                    </span>

                                    <strong>
                                        6,482
                                    </strong>

                                    <small>
                                        +0.76%
                                    </small>
                                </div>

                            </div>

                        </div>

                        <div className="game-footer">

                            <span>
                                LEVEL 01
                            </span>

                            <div className="xp-bar">
                                <span />
                            </div>

                            <span>
                                240 XP
                            </span>

                        </div>

                    </div>

                </div>

            </section>


            {/* ================= INTRO ================= */}

            <section
                id="about"
                className="intro-section"
            >

                <div className="section-container">

                    <div className="pixel-label">
                        <span>★</span>
                        WELCOME TO THE WORLD
                        <span>★</span>
                    </div>

                    <div className="intro-grid">

                        <div>

                            <h2>
                                WHAT IF
                                <br />
                                <span>
                                    ECONOMICS
                                </span>
                                <br />
                                WAS A GAME?
                            </h2>

                        </div>

                        <div className="intro-copy">

                            <p className="big-copy">
                                Instead of memorizing
                                charts and definitions,
                                <strong>
                                    {" "}step inside the
                                    economy.
                                </strong>
                            </p>

                            <p>
                                Watch currencies move.
                                Follow economic events.
                                Discover why investors
                                become excited or scared.
                                Make decisions and see
                                what happens next.
                            </p>

                            <p>
                                Deep Markets Mind transforms
                                macroeconomics and financial
                                markets into an interactive
                                learning adventure.
                            </p>

                            <div className="pixel-divider">
                                ✦ ───────── ✦
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* ================= HOW TO PLAY ================= */}

            <section
                id="how-it-works"
                className="features-section"
            >

                <div className="section-container">

                    <div className="section-heading">

                        <div className="pixel-label">
                            <span>▶</span>
                            HOW TO PLAY
                        </div>

                        <h2>
                            FOUR STEPS.
                            <br />
                            <span>
                                INFINITE POSSIBILITIES.
                            </span>
                        </h2>

                        <p>
                            You don't need to be an economist.
                            Just be curious.
                        </p>

                    </div>

                    <div className="features-grid">

                        {features.map(
                            (feature) => (
                                <div
                                    className="feature-card"
                                    key={
                                        feature.number
                                    }
                                >

                                    <div className="feature-top">

                                        <span className="feature-number">
                                            {feature.number}
                                        </span>

                                        <span className="feature-icon">
                                            {feature.icon}
                                        </span>

                                    </div>

                                    <h3>
                                        {feature.title}
                                    </h3>

                                    <p>
                                        {feature.description}
                                    </p>

                                    <div className="card-arrow">
                                        →
                                    </div>

                                </div>
                            ),
                        )}

                    </div>

                </div>

            </section>


            {/* ================= MARKETS ================= */}

            <section
                id="markets"
                className="markets-section"
            >

                <div className="section-container">

                    <div className="markets-heading">

                        <div>
                            <div className="pixel-label">
                                <span>◆</span>
                                YOUR PLAYGROUND
                            </div>

                            <h2>
                                EXPLORE THE
                                <br />
                                <span>
                                    MARKET WORLD
                                </span>
                            </h2>
                        </div>

                        <p>
                            The economy is a giant
                            interconnected game.
                            Every market influences
                            another.
                        </p>

                    </div>

                    <div className="markets-grid">

                        {markets.map(
                            (market, index) => (
                                <div
                                    className={`market-card market-card-${index + 1}`}
                                    key={
                                        market.name
                                    }
                                >

                                    <div className="market-icon">
                                        {market.icon}
                                    </div>

                                    <div className="market-number">
                                        0{index + 1}
                                    </div>

                                    <h3>
                                        {market.name}
                                    </h3>

                                    <p>
                                        {market.description}
                                    </p>

                                    <span className="market-arrow">
                                        ↗
                                    </span>

                                </div>
                            ),
                        )}

                    </div>

                </div>

            </section>


            {/* ================= EVENTS ================= */}

            <section className="events-section">

                <div className="section-container">

                    <div className="events-header">

                        <div>

                            <div className="pixel-label">
                                <span>!</span>
                                THE WORLD NEVER STOPS
                            </div>

                            <h2>
                                SOMETHING IS
                                <br />
                                <span>
                                    ALWAYS HAPPENING.
                                </span>
                            </h2>

                        </div>

                        <p>
                            Markets react to the world.
                            In the game, unexpected
                            events can change everything.
                        </p>

                    </div>


                    <div className="events-board">

                        <div className="board-header">
                            <span>
                                LIVE EVENT FEED
                            </span>

                            <span className="live">
                                ● LIVE
                            </span>
                        </div>

                        {events.map(
                            (event, index) => (
                                <div
                                    className={`event-row event-${event.color}`}
                                    key={index}
                                >

                                    <div className="event-icon">
                                        {index === 0
                                            ? "🏦"
                                            : index === 1
                                                ? "🌎"
                                                : "😰"}
                                    </div>

                                    <div className="event-info">

                                        <small>
                                            {event.type}
                                        </small>

                                        <strong>
                                            {event.title}
                                        </strong>

                                    </div>

                                    <span className="event-impact">
                                        {event.impact}
                                    </span>

                                </div>
                            ),
                        )}

                    </div>

                </div>

            </section>


            {/* ================= AGE ================= */}

            <section className="age-section">

                <div className="age-inner">

                    <div className="level-badge">
                        LEVEL ∞
                    </div>

                    <div className="pixel-label">
                        <span>★</span>
                        EVERYONE CAN PLAY
                        <span>★</span>
                    </div>

                    <h2>
                        CURIOUS AT 5?
                        <br />
                        <span>
                            CURIOUS AT 60?
                        </span>
                    </h2>

                    <p>
                        There is no age requirement for
                        curiosity. Start simple. Ask
                        questions. Experiment. Make
                        mistakes. Discover how the world
                        works.
                    </p>

                    <div className="age-tags">

                        <span>
                            🧒 BEGINNERS
                        </span>

                        <span>
                            🎓 STUDENTS
                        </span>

                        <span>
                            👨‍👩‍👧 FAMILIES
                        </span>

                        <span>
                            📚 LEARNERS
                        </span>

                        <span>
                            📈 TRADERS
                        </span>

                    </div>

                </div>

            </section>


            {/* ================= CTA ================= */}

            <section className="cta-section">

                <div className="cta-stars">
                    ✦　★　✦　★　✦
                </div>

                <div className="cta-inner">

                    <div className="cta-label">
                        READY PLAYER ONE?
                    </div>

                    <h2>
                        THE MARKET
                        <br />
                        <span>
                            IS WAITING.
                        </span>
                    </h2>

                    <p>
                        Enter the simulation.
                        <br />
                        Make your first decision.
                        <br />
                        See where it takes you.
                    </p>

                    <Link
                        href="/auth"
                        className="cta-button"
                    >
                        <span>▶</span>
                        START YOUR JOURNEY
                        <span>→</span>
                    </Link>

                    <small>
                        Educational simulation ·
                        Not financial advice
                    </small>

                </div>

                <div className="cta-ground">
                    $　€　¥　₿　₽　£　₹
                </div>

            </section>


            {/* ================= FOOTER ================= */}

            <footer className="footer">

                <div className="footer-inner">

                    <div className="footer-brand">

                        <Link
                            href="/"
                            className="logo"
                        >
                            <span className="logo-mark">
                                D
                            </span>

                            <span className="logo-text">
                                DEEP MARKETS
                                <small>MIND</small>
                            </span>
                        </Link>

                        <p>
                            Learn markets.
                            <br />
                            Understand risk.
                            <br />
                            Build your mind.
                        </p>

                    </div>

                    <div className="footer-stats">

                        <div>
                            <strong>
                                ∞
                            </strong>

                            <span>
                                POSSIBILITIES
                            </span>
                        </div>

                        <div>
                            <strong>
                                01
                            </strong>

                            <span>
                                PLAYER
                            </span>
                        </div>

                        <div>
                            <strong>
                                24/7
                            </strong>

                            <span>
                                CURIOSITY
                            </span>
                        </div>

                    </div>

                    <div className="footer-right">
                        © 2026 Deep Markets Mind
                    </div>

                </div>

            </footer>

        </main>
    );
}