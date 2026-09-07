import { EconomicCard } from "./NepalMarketSection";
import "./EconomicState.css";

interface EconomicStateSectionProps {
    economicState: any;
}

export default function EconomicStateSection({
    economicState,
}: EconomicStateSectionProps) {
    if (!economicState) {
        return null;
    }

    return (
        <section className="economic-section">
            {/* HEADER */}
            <div className="economic-section-header">
                <div>
                    <div className="economic-eyebrow">
                        🌍 THE WORLD ECONOMY
                    </div>

                    <h2>
                        Economic State
                    </h2>

                    <p>
                        Explore what is happening across
                        the global economy and different
                        regions of the world.
                    </p>
                </div>

                <div className="economic-world-icon">
                    🌎
                </div>
            </div>

            {/* GLOBAL ECONOMY */}
            <div className="global-economy">
                <div className="subsection-header">
                    <div className="subsection-icon">
                        🌐
                    </div>

                    <div>
                        <h3>
                            Global Economy
                        </h3>

                        <p>
                            Big-picture signals that affect
                            markets around the world.
                        </p>
                    </div>
                </div>

                <div className="global-cards">
                    <EconomicCard
                        label="Global Growth"
                        value={`${economicState.global.globalGrowth.toFixed(
                            2
                        )}%`}
                    />

                    <EconomicCard
                        label="Global Inflation"
                        value={`${economicState.global.globalInflation.toFixed(
                            2
                        )}%`}
                    />

                    <EconomicCard
                        label="Risk Appetite"
                        value={economicState.global.riskAppetite.toFixed(
                            3
                        )}
                    />

                    <EconomicCard
                        label="Commodity Demand"
                        value={economicState.global.commodityDemand.toFixed(
                            3
                        )}
                    />

                    <EconomicCard
                        label="Global Liquidity"
                        value={economicState.global.globalLiquidity.toFixed(
                            3
                        )}
                    />
                </div>
            </div>

            {/* REGIONAL ECONOMIES */}
            <div className="regional-section">
                <div className="subsection-header">
                    <div className="subsection-icon">
                        🗺️
                    </div>

                    <div>
                        <h3>
                            Regional Economies
                        </h3>

                        <p>
                            Compare economic conditions
                            across different parts of the world.
                        </p>
                    </div>
                </div>

                <div className="regional-grid">
                    {Object.values(
                        economicState.economies
                    ).map((economy: any) => (
                        <div
                            key={economy.region}
                            className="economy-card"
                        >
                            {/* REGION HEADER */}
                            <div className="economy-card-header">
                                <div className="region-badge">
                                    {economy.region
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div>
                                    <h4>
                                        {economy.region}
                                    </h4>

                                    <span>
                                        Regional Economy
                                    </span>
                                </div>

                                <div className="economy-status">
                                    ● ACTIVE
                                </div>
                            </div>

                            {/* ECONOMIC METRICS */}
                            <div className="economy-metrics">
                                <EconomicCard
                                    label="Interest Rate"
                                    value={`${economy.interestRate.toFixed(
                                        2
                                    )}%`}
                                />

                                <EconomicCard
                                    label="Inflation"
                                    value={`${economy.inflation.toFixed(
                                        2
                                    )}%`}
                                />

                                <EconomicCard
                                    label="GDP Growth"
                                    value={`${economy.gdpGrowth.toFixed(
                                        2
                                    )}%`}
                                />

                                <EconomicCard
                                    label="Employment"
                                    value={economy.employment.toLocaleString()}
                                />

                                <EconomicCard
                                    label="Unemployment"
                                    value={`${economy.unemployment.toFixed(
                                        2
                                    )}%`}
                                />

                                <EconomicCard
                                    label="PMI"
                                    value={economy.pmi.toFixed(1)}
                                />

                                <EconomicCard
                                    label="Retail Sales"
                                    value={`${economy.retailSalesGrowth.toFixed(
                                        2
                                    )}%`}
                                />

                                <EconomicCard
                                    label="Trade Balance"
                                    value={`$${(
                                        economy.tradeBalance /
                                        1_000_000_000
                                    ).toFixed(2)}B`}
                                />

                                <EconomicCard
                                    label="Consumer Confidence"
                                    value={economy.consumerConfidence.toFixed(
                                        1
                                    )}
                                />

                                <EconomicCard
                                    label="Growth Score"
                                    value={economy.growthScore.toFixed(
                                        3
                                    )}
                                />

                                <EconomicCard
                                    label="Policy Pressure"
                                    value={economy.monetaryPolicyPressure.toFixed(
                                        3
                                    )}
                                />

                                <EconomicCard
                                    label="Currency Score"
                                    value={economy.currencyFundamentalScore.toFixed(
                                        3
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}