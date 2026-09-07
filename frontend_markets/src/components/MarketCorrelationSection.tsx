import { EconomicCard } from "./NepalMarketSection";

interface MarketCorrelationSectionProps {
    correlationState: any;
}

export default function MarketCorrelationSection({
    correlationState,
}: MarketCorrelationSectionProps) {
    if (!correlationState) {
        return null;
    }

    return (
        <section
            style={{
                marginTop: "30px",
                padding: "28px",
                border: "2px solid #e4e8f3",
                borderRadius: "20px",
                background: "#ffffff",
                boxShadow:
                    "0 8px 24px rgba(54, 68, 100, 0.07)",
            }}
        >
            {/* HEADER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            background: "#eef4ff",
                            color: "#4267b2",
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                        }}
                    >
                        <span
                            style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "#5b8def",
                            }}
                        />

                        MARKET CONNECTIONS
                    </div>

                    <h2
                        style={{
                            margin: "12px 0 6px",
                            fontSize: "26px",
                            lineHeight: 1.2,
                            color: "#202b45",
                        }}
                    >
                        How Markets Move Together
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            maxWidth: "650px",
                            color: "#6d7890",
                            fontSize: "14px",
                            lineHeight: 1.6,
                        }}
                    >
                        Markets are connected. When one market
                        changes, other markets can sometimes move
                        with it.
                    </p>
                </div>

                <div
                    style={{
                        padding: "12px 15px",
                        borderRadius: "14px",
                        background: "#fff8e8",
                        border: "1px solid #f4dfad",
                        color: "#8a681b",
                        fontSize: "12px",
                        fontWeight: 700,
                    }}
                >
                    💡 Watch the connections
                </div>
            </div>

            {/* CORRELATION CARDS */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(190px, 1fr))",
                    gap: "16px",
                    marginTop: "26px",
                }}
            >
                <div
                    style={{
                        padding: "18px",
                        borderRadius: "16px",
                        background: "#f4f8ff",
                        border: "1px solid #dce8ff",
                    }}
                >
                    <EconomicCard
                        label="Stocks"
                        value={correlationState.aggregate.stocks.toFixed(
                            3
                        )}
                    />
                </div>

                <div
                    style={{
                        padding: "18px",
                        borderRadius: "16px",
                        background: "#f5fbf7",
                        border: "1px solid #dceede",
                    }}
                >
                    <EconomicCard
                        label="Commodities"
                        value={correlationState.aggregate.commodities.toFixed(
                            3
                        )}
                    />
                </div>

                <div
                    style={{
                        padding: "18px",
                        borderRadius: "16px",
                        background: "#fff7f0",
                        border: "1px solid #f5dfca",
                    }}
                >
                    <EconomicCard
                        label="Currencies"
                        value={correlationState.aggregate.currencies.toFixed(
                            3
                        )}
                    />
                </div>

                <div
                    style={{
                        padding: "18px",
                        borderRadius: "16px",
                        background: "#f8f4ff",
                        border: "1px solid #e5dafa",
                    }}
                >
                    <EconomicCard
                        label="NEPSE"
                        value={correlationState.aggregate.nepse.toFixed(
                            3
                        )}
                    />
                </div>
            </div>

            {/* SIMPLE EXPLANATION */}
            <div
                style={{
                    marginTop: "22px",
                    padding: "16px 18px",
                    borderRadius: "15px",
                    background: "#f8f9fc",
                    border: "1px solid #e7eaf1",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                }}
            >
                <div
                    style={{
                        width: "34px",
                        height: "34px",
                        minWidth: "34px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#eaf0ff",
                        fontSize: "17px",
                    }}
                >
                    🔗
                </div>

                <div>
                    <div
                        style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            color: "#303b55",
                            marginBottom: "3px",
                        }}
                    >
                        What does correlation mean?
                    </div>

                    <div
                        style={{
                            fontSize: "12px",
                            color: "#788297",
                            lineHeight: 1.5,
                        }}
                    >
                        A higher positive number means two markets
                        tend to move in the same direction. A negative
                        number means they tend to move in opposite
                        directions.
                    </div>
                </div>
            </div>
        </section>
    );
}