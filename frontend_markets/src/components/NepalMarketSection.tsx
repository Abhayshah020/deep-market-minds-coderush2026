import "./NepalMarketSection.css";

interface NepalMarketSectionProps {
    nepalState: any;
}

export default function NepalMarketSection({
    nepalState,
}: NepalMarketSectionProps) {
    if (!nepalState) {
        return null;
    }

    return (
        <section className="nepal-market-section">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="nepal-header">

                <div className="nepal-header-content">

                    <div className="nepal-label">
                        🇳🇵 NEPAL ECONOMY
                    </div>

                    <h2>
                        Welcome to the
                        <br />
                        <span>Nepal Market!</span>
                    </h2>

                    <p>
                        Explore how Nepal's stock market,
                        money flowing into the country,
                        banks, prices, and companies all
                        work together.
                    </p>

                </div>

                <div className="nepal-flag-card">

                    <div className="nepal-flag">
                        🇳🇵
                    </div>

                    <div>
                        <strong>
                            NEPAL
                        </strong>

                        <span>
                            MARKET ZONE
                        </span>
                    </div>

                </div>

            </div>


            {/* =================================================
                QUICK INTRO
            ================================================= */}

            <div className="nepal-lesson">

                <div className="nepal-lesson-icon">
                    🧭
                </div>

                <div>

                    <strong>
                        YOUR NEPAL MARKET MISSION
                    </strong>

                    <p>
                        Watch the numbers change and
                        discover how different parts of
                        Nepal's economy can influence
                        each other.
                    </p>

                </div>

            </div>


            {/* =================================================
                MARKET OVERVIEW
            ================================================= */}

            <div className="nepal-section-heading">

                <div>
                    <span>
                        📊
                    </span>

                    <h3>
                        Nepal Economy Dashboard
                    </h3>
                </div>

                <small>
                    LIVE SIMULATION
                </small>

            </div>


            <div className="nepal-economic-grid">

                {/* NEPSE */}

                <EconomicCard
                    label="NEPSE Index"
                    value={nepalState.nepseIndex.toFixed(2)}
                />

                {/* REMITTANCE */}

                <EconomicCard
                    label="Monthly Remittance"
                    value={`NPR ${(
                        nepalState.remittance.monthlyInflow /
                        1_000_000_000
                    ).toFixed(2)}B`}
                />

                {/* REMITTANCE GROWTH */}

                <EconomicCard
                    label="Remittance Growth"
                    value={`${nepalState.remittance.growthRate.toFixed(
                        2
                    )}%`}
                />

                {/* LIQUIDITY */}

                <EconomicCard
                    label="Banking Liquidity"
                    value={nepalState.economy.liquidity.bankingLiquidity.toFixed(
                        2
                    )}
                />

                {/* CREDIT */}

                <EconomicCard
                    label="Credit Growth"
                    value={`${nepalState.economy.liquidity.creditGrowth.toFixed(
                        2
                    )}%`}
                />

                {/* INFLATION */}

                <EconomicCard
                    label="Inflation"
                    value={`${nepalState.economy.inflation.toFixed(2)}%`}
                />

            </div>


            {/* =================================================
                SIMPLE EXPLANATION
            ================================================= */}

            <div className="nepal-explanation-grid">

                <div className="nepal-explanation-card">

                    <div className="explanation-icon">
                        📈
                    </div>

                    <div>

                        <strong>
                            NEPSE
                        </strong>

                        <p>
                            A number that helps us see
                            how Nepal's stock market is
                            behaving.
                        </p>

                    </div>

                </div>


                <div className="nepal-explanation-card">

                    <div className="explanation-icon">
                        💸
                    </div>

                    <div>

                        <strong>
                            REMITTANCE
                        </strong>

                        <p>
                            Money sent home by Nepalis
                            working in other countries.
                        </p>

                    </div>

                </div>


                <div className="nepal-explanation-card">

                    <div className="explanation-icon">
                        🏦
                    </div>

                    <div>

                        <strong>
                            BANKING
                        </strong>

                        <p>
                            Shows how much money is
                            available in the banking
                            system.
                        </p>

                    </div>

                </div>


                <div className="nepal-explanation-card">

                    <div className="explanation-icon">
                        🛒
                    </div>

                    <div>

                        <strong>
                            INFLATION
                        </strong>

                        <p>
                            Helps us understand how
                            quickly prices are changing.
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                COMPANIES
            ================================================= */}

            <div className="nepal-companies-header">

                <div>

                    <div className="nepal-label">
                        🏢 STOCK MARKET
                    </div>

                    <h3>
                        Meet Nepal's Companies
                    </h3>

                    <p>
                        These companies are part of
                        the simulated Nepal market.
                    </p>

                </div>

                <div className="company-count">
                    {nepalState.companies.length}
                    <span>
                        COMPANIES
                    </span>
                </div>

            </div>


            <div className="nepal-company-grid">

                {nepalState.companies.map(
                    (company: any) => (
                        <EconomicCard
                            key={company.id}
                            label={company.name}
                            value={`NPR ${company.value.toFixed(2)}`}
                        />
                    ),
                )}

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="nepal-market-footer">

                <span>
                    🇳🇵 Nepal Market
                </span>

                <span>
                    📈 Stocks
                </span>

                <span>
                    💸 Remittance
                </span>

                <span>
                    🏦 Banking
                </span>

                <span>
                    🛒 Inflation
                </span>

            </div>

        </section>
    );
}


interface EconomicCardProps {
    label: string;
    value: string;
}

export function EconomicCard({
    label,
    value,
}: EconomicCardProps) {
    return (
        <div className="nepal-economic-card">

            <div className="economic-card-label">
                {label}
            </div>

            <div className="economic-card-value">
                {value}
            </div>

        </div>
    );
}