import "./SentimentSection.css";

interface SentimentSectionProps {
    sentimentState: any;
}

export default function SentimentSection({
    sentimentState,
}: SentimentSectionProps) {
    if (!sentimentState) {
        return null;
    }

    return (
        <section className="sentiment-section">

            {/* HEADER */}

            <div className="sentiment-header">

                <div>

                    <div className="sentiment-label">
                        <span>🧠</span>
                        MARKET MOOD
                    </div>

                    <h2>
                        What is the
                        <br />
                        <span>market feeling?</span>
                    </h2>

                    <p>
                        Markets are moved by people.
                        Sometimes people feel confident,
                        sometimes nervous, and sometimes
                        they simply don't know what to do.
                    </p>

                </div>

                <div className="sentiment-character">

                    <div className="mood-face">
                        🙂
                    </div>

                    <div className="mood-text">

                        <strong>
                            MARKET MOOD
                        </strong>

                        <span>
                            "How are investors feeling?"
                        </span>

                    </div>

                </div>

            </div>


            {/* SIMPLE LESSON */}

            <div className="sentiment-lesson">

                <div className="lesson-icon">
                    💡
                </div>

                <div>

                    <strong>
                        WHY DOES MOOD MATTER?
                    </strong>

                    <p>
                        When lots of investors become
                        excited or scared at the same time,
                        their decisions can move markets.
                    </p>

                </div>

            </div>


            {/* SENTIMENT CARDS */}

            <div className="sentiment-grid">

                <SentimentCard
                    label="Fear / Greed"
                    value={sentimentState.fearGreed}
                    min={-1}
                    max={1}
                    leftLabel="Fear"
                    rightLabel="Greed"
                />

                <SentimentCard
                    label="Volatility"
                    value={sentimentState.volatility}
                    min={0}
                    max={1}
                    leftLabel="Low"
                    rightLabel="Extreme"
                />

                <SentimentCard
                    label="Momentum"
                    value={sentimentState.momentum}
                    min={-1}
                    max={1}
                    leftLabel="Negative"
                    rightLabel="Positive"
                />

                <SentimentCard
                    label="Market Breadth"
                    value={sentimentState.marketBreadth}
                    min={-1}
                    max={1}
                    leftLabel="Weak"
                    rightLabel="Strong"
                />

                <SentimentCard
                    label="Safe-Haven Demand"
                    value={sentimentState.safeHavenDemand}
                    min={0}
                    max={1}
                    leftLabel="Low"
                    rightLabel="Extreme"
                />

                <SentimentCard
                    label="Credit Risk"
                    value={sentimentState.creditRisk}
                    min={0}
                    max={1}
                    leftLabel="Low"
                    rightLabel="Extreme"
                />

                <SentimentCard
                    label="Put / Call Sentiment"
                    value={sentimentState.putCallSentiment}
                    min={-1}
                    max={1}
                    leftLabel="Bearish"
                    rightLabel="Bullish"
                />

                <SentimentCard
                    label="COT Positioning"
                    value={sentimentState.cotPositioning}
                    min={-1}
                    max={1}
                    leftLabel="Short"
                    rightLabel="Long"
                />

            </div>


            {/* LEARNING PANEL */}

            <div className="sentiment-learning">

                <div className="learning-title">

                    <span>
                        🎮
                    </span>

                    <strong>
                        MARKET MOOD DETECTIVE
                    </strong>

                </div>

                <div className="learning-body">

                    <div className="learning-question">
                        Can you read the market's mood?
                    </div>

                    <p>
                        Watch the indicators above.
                        Strong emotions can create big
                        movements — but remember,
                        emotions can change quickly.
                    </p>

                </div>

            </div>


            {/* LEGEND */}

            <div className="sentiment-footer">

                <span>
                    😨 Fear
                </span>

                <span>
                    😐 Uncertain
                </span>

                <span>
                    😎 Confident
                </span>

                <span>
                    ⚡ High Energy
                </span>

            </div>

        </section>
    );
}


interface SentimentCardProps {
    label: string;
    value: number;
    min: number;
    max: number;
    leftLabel: string;
    rightLabel: string;
}

function SentimentCard({
    label,
    value,
    min,
    max,
    leftLabel,
    rightLabel,
}: SentimentCardProps) {
    const percentage =
        ((value - min) /
            (max - min)) *
        100;

    return (
        <div className="sentiment-card">

            <div className="sentiment-card-top">

                <div className="sentiment-card-icon">
                    {getSentimentIcon(label)}
                </div>

                <span className="sentiment-card-type">
                    INDICATOR
                </span>

            </div>

            <div className="sentiment-card-label">
                {label}
            </div>

            <div className="sentiment-value">
                {value.toFixed(3)}
            </div>

            <div className="sentiment-meter">

                <div
                    className="sentiment-meter-fill"
                    style={{
                        width: `${percentage}%`,
                    }}
                />

                <div
                    className="sentiment-meter-marker"
                    style={{
                        left: `${percentage}%`,
                    }}
                />

            </div>

            <div className="sentiment-range">

                <span>
                    {leftLabel}
                </span>

                <span>
                    {rightLabel}
                </span>

            </div>

        </div>
    );
}


function getSentimentIcon(
    label: string,
) {
    switch (label) {
        case "Fear / Greed":
            return "😨";

        case "Volatility":
            return "⚡";

        case "Momentum":
            return "🚀";

        case "Market Breadth":
            return "🌱";

        case "Safe-Haven Demand":
            return "🛡️";

        case "Credit Risk":
            return "⚠️";

        case "Put / Call Sentiment":
            return "🎯";

        case "COT Positioning":
            return "👥";

        default:
            return "📊";
    }
}