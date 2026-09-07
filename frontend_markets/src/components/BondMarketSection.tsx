
import "./BondMarketSection.css";

interface BondMarketSectionProps {
    bondState: any;
}

interface BondMarketSectionProps {
    bondState: any;
}

export default function BondMarketSection({
    bondState,
}: BondMarketSectionProps) {
    if (!bondState) {
        return null;
    }

    const spread = bondState.yieldSpread;

    const spreadType =
        spread > 0
            ? "LONG-TERM HIGHER"
            : spread < 0
                ? "INVERTED"
                : "FLAT";

    const spreadDescription =
        spread > 0
            ? "Investors are asking for more return to lend money for longer."
            : spread < 0
                ? "Short-term yields are higher than long-term yields. The bond market is sending a warning signal."
                : "Short-term and long-term yields are almost the same.";

    return (
        <section className="bond-section">

            {/* HEADER */}

            <div className="bond-header">

                <div className="bond-title-area">

                    <div className="bond-game-label">
                        <span>🏦</span>
                        ECONOMY SCHOOL
                    </div>

                    <h2>
                        The Bond
                        <br />
                        <span>World</span>
                    </h2>

                    <p>
                        Imagine lending money to a
                        country. Bonds help us understand
                        how much return investors want for
                        lending for different lengths of
                        time.
                    </p>

                </div>

                <div className="bond-character">
                    <div className="character-coin">
                        $
                    </div>

                    <div className="character-text">
                        <strong>
                            BOND BUDDY
                        </strong>

                        <span>
                            "Let's learn!"
                        </span>
                    </div>
                </div>

            </div>


            {/* SIMPLE EXPLANATION */}

            <div className="bond-lesson">

                <div className="lesson-icon">
                    💡
                </div>

                <div>

                    <strong>
                        WHAT IS A BOND?
                    </strong>

                    <p>
                        A bond is like an IOU. You lend
                        money today, and the borrower
                        promises to pay you back later
                        with interest.
                    </p>

                </div>

            </div>


            {/* YIELD CARDS */}

            <div className="bond-cards">

                {/* 2 YEAR */}

                <div className="bond-card short-term">

                    <div className="bond-card-top">

                        <span className="bond-icon">
                            🐣
                        </span>

                        <span className="bond-duration">
                            2 YEARS
                        </span>

                    </div>

                    <span className="bond-card-label">
                        SHORT-TERM LOAN
                    </span>

                    <strong className="bond-value">
                        {bondState.us2yYield.toFixed(3)}%
                    </strong>

                    <p>
                        What investors expect when
                        lending money for about two
                        years.
                    </p>

                    <div className="bond-meter">

                        <div
                            style={{
                                width: `${Math.min(
                                    Math.max(
                                        bondState.us2yYield *
                                        15,
                                        5,
                                    ),
                                    100,
                                )}%`,
                            }}
                        />

                    </div>

                </div>


                {/* 10 YEAR */}

                <div className="bond-card long-term">

                    <div className="bond-card-top">

                        <span className="bond-icon">
                            🚀
                        </span>

                        <span className="bond-duration">
                            10 YEARS
                        </span>

                    </div>

                    <span className="bond-card-label">
                        LONG-TERM LOAN
                    </span>

                    <strong className="bond-value">
                        {bondState.us10yYield.toFixed(3)}%
                    </strong>

                    <p>
                        What investors expect when
                        lending money for a much
                        longer time.
                    </p>

                    <div className="bond-meter">

                        <div
                            style={{
                                width: `${Math.min(
                                    Math.max(
                                        bondState.us10yYield *
                                        15,
                                        5,
                                    ),
                                    100,
                                )}%`,
                            }}
                        />

                    </div>

                </div>


                {/* SPREAD */}

                <div
                    className={`bond-card spread-card ${spread < 0
                            ? "warning"
                            : ""
                        }`}
                >

                    <div className="bond-card-top">

                        <span className="bond-icon">
                            ⚖️
                        </span>

                        <span className="bond-duration">
                            DIFFERENCE
                        </span>

                    </div>

                    <span className="bond-card-label">
                        2Y → 10Y SPREAD
                    </span>

                    <strong className="bond-value">
                        {spread >= 0
                            ? "+"
                            : ""}
                        {spread.toFixed(3)}%
                    </strong>

                    <p>
                        The difference between
                        short-term and long-term
                        borrowing costs.
                    </p>

                    <div className="spread-status">
                        <span>
                            {spread >= 0
                                ? "▲"
                                : "▼"}
                        </span>

                        {spreadType}
                    </div>

                </div>

            </div>


            {/* LEARNING PANEL */}

            <div className="bond-learning">

                <div className="learning-title">

                    <span>
                        🎮
                    </span>

                    <strong>
                        MARKET DETECTIVE
                    </strong>

                </div>

                <div className="learning-content">

                    <div className="learning-question">
                        What is the bond market
                        telling us?
                    </div>

                    <div className="learning-answer">

                        <span className="answer-icon">
                            {spread >= 0
                                ? "🌤️"
                                : "⚠️"}
                        </span>

                        <div>

                            <strong>
                                {spread >= 0
                                    ? "The yield curve is positive."
                                    : "The yield curve is inverted."}
                            </strong>

                            <p>
                                {spreadDescription}
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* MINI LEGEND */}

            <div className="bond-footer">

                <span>
                    🐣 2Y = Shorter lending
                </span>

                <span>
                    🚀 10Y = Longer lending
                </span>

                <span>
                    ⚖️ Spread = Difference
                </span>

            </div>

        </section>
    );
}