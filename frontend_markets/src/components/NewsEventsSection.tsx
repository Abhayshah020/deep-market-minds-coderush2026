import { NewsEvent } from "@/app/(protected)/engine/news-event/news-event.types";
import "./NewsEventsSection.css";

interface NewsEventsSectionProps {
    newsEvents: any[];
    filteredNewsEvents: any[];
    newsFromDate: string;
    newsToDate: string;
    setNewsFromDate: (value: string) => void;
    setNewsToDate: (value: string) => void;
}

export default function NewsEventsSection({
    newsEvents,
    filteredNewsEvents,
    newsFromDate,
    newsToDate,
    setNewsFromDate,
    setNewsToDate,
}: NewsEventsSectionProps) {
    if (newsEvents.length === 0) {
        return null;
    }

    const clearFilters = () => {
        setNewsFromDate("");
        setNewsToDate("");
    };

    return (
        <section className="news-section">

            {/* HEADER */}

            <div className="news-header">

                <div className="news-heading">

                    <div className="news-label">
                        <span>📰</span>
                        MARKET NEWS ROOM
                    </div>

                    <h2>
                        What's
                        <br />
                        <span>happening?</span>
                    </h2>

                    <p>
                        Markets are always reacting to
                        something. Discover simulated
                        economic, world, climate, company,
                        and geopolitical events.
                    </p>

                </div>

                <div className="news-board">

                    <div className="board-pin" />

                    <span className="board-icon">
                        📌
                    </span>

                    <strong>
                        STAY CURIOUS
                    </strong>

                    <small>
                        Every event can
                        change the market.
                    </small>

                </div>

            </div>


            {/* FILTER PANEL */}

            <div className="news-filters">

                <div className="filter-heading">

                    <span>
                        🔎
                    </span>

                    <div>
                        <strong>
                            Explore the news
                        </strong>

                        <small>
                            Pick a date range to investigate
                            past events.
                        </small>
                    </div>

                </div>

                <div className="filter-controls">

                    <div className="date-control">

                        <label htmlFor="news-from">
                            FROM
                        </label>

                        <input
                            id="news-from"
                            type="date"
                            value={newsFromDate}
                            onChange={(event) =>
                                setNewsFromDate(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                    <div className="date-arrow">
                        →
                    </div>

                    <div className="date-control">

                        <label htmlFor="news-to">
                            TO
                        </label>

                        <input
                            id="news-to"
                            type="date"
                            value={newsToDate}
                            onChange={(event) =>
                                setNewsToDate(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                    <button
                        type="button"
                        className="apply-filter-button"
                        onClick={() => {
                            setNewsFromDate(
                                newsFromDate
                            );
                            setNewsToDate(
                                newsToDate
                            );
                        }}
                    >
                        <span>🔍</span>
                        Apply Filter
                    </button>

                    <button
                        type="button"
                        className="clear-filter-button"
                        onClick={clearFilters}
                    >
                        Clear
                    </button>

                    <button
                        type="button"
                        className="latest-news-button"
                        onClick={clearFilters}
                    >
                        ✨ Latest News
                    </button>

                </div>

            </div>


            {/* RESULT SUMMARY */}

            <div className="news-summary">

                <div className="summary-count">

                    <span className="summary-number">
                        {filteredNewsEvents.length}
                    </span>

                    <div>
                        <strong>
                            News Events
                        </strong>

                        <small>
                            showing from{" "}
                            {newsEvents.length} total
                        </small>
                    </div>

                </div>

                <div className="summary-message">
                    🎮 Keep exploring — every event
                    teaches you something about markets.
                </div>

            </div>


            {/* NEWS LIST */}

            <div className="news-list">

                {[...filteredNewsEvents]
                    .reverse()
                    .map((event) => (
                        <NewsEventCard
                            key={event.id}
                            event={event}
                        />
                    ))}

            </div>


            {/* EMPTY STATE */}

            {filteredNewsEvents.length === 0 && (
                <div className="news-empty">

                    <div className="empty-icon">
                        🔭
                    </div>

                    <h3>
                        No news found
                    </h3>

                    <p>
                        Try choosing a different
                        date range and investigate
                        another part of the market story.
                    </p>

                    <button
                        type="button"
                        onClick={clearFilters}
                    >
                        Show Latest News
                    </button>

                </div>
            )}

        </section>
    );
}


interface NewsEventCardProps {
    event: NewsEvent;
}

function NewsEventCard({
    event,
}: NewsEventCardProps) {
    const effect =
        event.economicEffect;

    const effectLabel =
        effect > 0.05
            ? "Positive"
            : effect < -0.05
                ? "Negative"
                : "Neutral";

    const effectSign =
        effect > 0
            ? "+"
            : "";

    const formattedDate =
        new Date(
            event.timestamp
        ).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "2-digit",
            }
        );

    const formattedTime =
        new Date(
            event.timestamp
        ).toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }
        );

    return (
        <article
            className={`news-card ${effectLabel.toLowerCase()}`}
        >

            {/* IMPACT STRIPE */}

            <div className="news-card-stripe" />


            {/* CARD HEADER */}

            <div className="news-card-header">

                <div className="event-heading">

                    <div className="event-type">
                        <span>●</span>
                        {event.type}
                    </div>

                    <h3>
                        {event.title}
                    </h3>

                </div>


                {/* EFFECT */}

                <div className="economic-effect">

                    <span className="effect-label">
                        MARKET IMPACT
                    </span>

                    <strong>
                        {effectSign}
                        {effect.toFixed(2)}
                    </strong>

                    <span className="effect-status">
                        {effectLabel ===
                            "Positive"
                            ? "▲"
                            : effectLabel ===
                                "Negative"
                                ? "▼"
                                : "●"}

                        {" "}

                        {effectLabel}
                    </span>

                </div>

            </div>


            {/* DATE / FREQUENCY */}

            <div className="event-meta">

                <span>
                    📅 {formattedDate}
                </span>

                <span>
                    🕐 {formattedTime}
                </span>

                <span>
                    🔄 {event.frequency}
                </span>

            </div>


            {/* DESCRIPTION */}

            <div className="event-description">

                <span className="description-icon">
                    💬
                </span>

                <p>
                    {event.description}
                </p>

            </div>


            {/* SEVERITY */}

            <div className="event-bottom">

                <div className="severity">

                    <span>
                        Event Strength
                    </span>

                    <strong>
                        {event.severity}
                    </strong>

                </div>

                <div className="learn-more">
                    MARKET EVENT
                    <span>
                        →
                    </span>
                </div>

            </div>

        </article>
    );
}