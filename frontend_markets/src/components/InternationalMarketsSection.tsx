import "./InternationalMarkets.css";

interface InternationalMarketsSectionProps {
    marketState: any;
}

export default function InternationalMarketsSection({
    marketState,
}: InternationalMarketsSectionProps) {
    if (!marketState) {
        return null;
    }

    return (
        <section className="international-section">
            {/* HEADER */}
            <div className="international-header">
                <div>
                    <div className="international-eyebrow">
                        🌎 GLOBAL MARKETPLACE
                    </div>

                    <h2>
                        International Markets
                    </h2>

                    <p>
                        Explore stock markets, commodities,
                        and companies from around the world.
                    </p>
                </div>

                <div className="international-header-icon">
                    📈
                </div>
            </div>

            {/* STOCK INDICES */}
            <div className="market-group">
                <div className="market-group-header">
                    <div className="market-group-icon stocks-icon">
                        📊
                    </div>

                    <div>
                        <h3>
                            Stock Indices
                        </h3>

                        <p>
                            Track how major parts of the
                            global stock market are moving.
                        </p>
                    </div>
                </div>

                <div className="market-assets-grid">
                    {Object.values(
                        marketState.indices
                    ).map((asset: any) => (
                        <MarketAssetCard
                            key={asset.code}
                            asset={asset}
                        />
                    ))}
                </div>
            </div>

            {/* COMMODITIES */}
            <div className="market-group">
                <div className="market-group-header">
                    <div className="market-group-icon commodities-icon">
                        🪙
                    </div>

                    <div>
                        <h3>
                            Commodities
                        </h3>

                        <p>
                            Discover how things like gold,
                            oil, and other resources behave.
                        </p>
                    </div>
                </div>

                <div className="market-assets-grid">
                    {Object.values(
                        marketState.commodities
                    ).map((asset: any) => (
                        <MarketAssetCard
                            key={asset.code}
                            asset={asset}
                        />
                    ))}
                </div>
            </div>

            {/* COMPANIES */}
            <div className="market-group companies-group">
                <div className="market-group-header">
                    <div className="market-group-icon companies-icon">
                        🏢
                    </div>

                    <div>
                        <h3>
                            Simulated Companies
                        </h3>

                        <p>
                            Follow companies and see how
                            business performance can affect
                            their market value.
                        </p>
                    </div>
                </div>

                <div className="companies-grid">
                    {marketState.companies.map(
                        (company: any) => (
                            <CompanyCard
                                key={company.id}
                                company={company}
                            />
                        )
                    )}
                </div>
            </div>
        </section>
    );
}

/* =========================================
   MARKET ASSET CARD
   ========================================= */

function MarketAssetCard({
    asset,
}: {
    asset: {
        name: string;
        value: number;
        supply: number;
        demand: number;
        ohlc: {
            open: number;
            high: number;
            low: number;
            close: number;
        };
    };
}) {
    return (
        <div className="market-asset-card">
            <div className="asset-card-top">
                <div className="asset-icon">
                    📈
                </div>

                <div className="asset-name">
                    {asset.name}
                </div>
            </div>

            <div className="asset-value">
                {asset.value.toFixed(2)}
            </div>

            <div className="asset-value-label">
                Current Market Value
            </div>

            <div className="asset-ohlc">
                <div className="asset-ohlc-item">
                    <span>Open</span>
                    <strong>
                        {asset.ohlc.open.toFixed(2)}
                    </strong>
                </div>

                <div className="asset-ohlc-item high">
                    <span>High</span>
                    <strong>
                        {asset.ohlc.high.toFixed(2)}
                    </strong>
                </div>

                <div className="asset-ohlc-item low">
                    <span>Low</span>
                    <strong>
                        {asset.ohlc.low.toFixed(2)}
                    </strong>
                </div>

                <div className="asset-ohlc-item">
                    <span>Close</span>
                    <strong>
                        {asset.ohlc.close.toFixed(2)}
                    </strong>
                </div>
            </div>

            <div className="asset-balance">
                <div>
                    <span>Demand</span>

                    <strong>
                        {asset.demand.toFixed(1)}
                    </strong>
                </div>

                <div>
                    <span>Supply</span>

                    <strong>
                        {asset.supply.toFixed(1)}
                    </strong>
                </div>
            </div>
        </div>
    );
}

/* =========================================
   COMPANY CARD
   ========================================= */

function CompanyCard({
    company,
}: {
    company: {
        name: string;
        value: number;
        revenue: number;
        earnings: number;
        supply: number;
        demand: number;
        ohlc: {
            open: number;
            high: number;
            low: number;
            close: number;
        };
    };
}) {
    return (
        <div className="company-card">
            <div className="company-header">
                <div className="company-logo">
                    {company.name
                        .charAt(0)
                        .toUpperCase()}
                </div>

                <div>
                    <h3>
                        {company.name}
                    </h3>

                    <span>
                        Simulated Company
                    </span>
                </div>

                <div className="company-status">
                    ● MARKET
                </div>
            </div>

            <div className="company-price">
                ${company.value.toFixed(2)}
            </div>

            <div className="company-price-label">
                Share Value
            </div>

            <div className="company-business-data">
                <div className="business-stat">
                    <span>
                        💰 Revenue
                    </span>

                    <strong>
                        $
                        {(
                            company.revenue /
                            1_000_000_000
                        ).toFixed(2)}
                        B
                    </strong>
                </div>

                <div className="business-stat">
                    <span>
                        💵 Earnings
                    </span>

                    <strong>
                        $
                        {(
                            company.earnings /
                            1_000_000_000
                        ).toFixed(2)}
                        B
                    </strong>
                </div>

                <div className="business-stat">
                    <span>
                        🟢 Demand
                    </span>

                    <strong>
                        {company.demand.toFixed(1)}
                    </strong>
                </div>

                <div className="business-stat">
                    <span>
                        🔵 Supply
                    </span>

                    <strong>
                        {company.supply.toFixed(1)}
                    </strong>
                </div>
            </div>

            <div className="company-ohlc">
                <div>
                    <span>O</span>
                    {company.ohlc.open.toFixed(2)}
                </div>

                <div>
                    <span>H</span>
                    {company.ohlc.high.toFixed(2)}
                </div>

                <div>
                    <span>L</span>
                    {company.ohlc.low.toFixed(2)}
                </div>

                <div>
                    <span>C</span>
                    {company.ohlc.close.toFixed(2)}
                </div>
            </div>
        </div>
    );
}