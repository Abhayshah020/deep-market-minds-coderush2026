import "./CurrencyIndicesSection.css";

interface CurrencyIndicesSectionProps {
    currencyState: any;
}

export default function CurrencyIndicesSection({
    currencyState,
}: CurrencyIndicesSectionProps) {
    if (!currencyState) {
        return null;
    }

    return (
        <section className="currency-section">

            {/* HEADER */}

            <div className="currency-header">

                <div className="currency-heading">

                    <div className="currency-label">
                        <span>🌍</span>
                        GLOBAL CURRENCY BOARD
                    </div>

                    <h2>
                        Currency
                        <br />
                        <span>Power</span>
                    </h2>

                    <p>
                        Every currency has a strength
                        score. Watch the numbers move
                        and discover which currencies
                        are getting stronger or weaker.
                    </p>

                </div>

                <div className="currency-explainer">

                    <div className="explainer-icon">
                        ⚡
                    </div>

                    <div>
                        <strong>
                            POWER LEVEL
                        </strong>

                        <span>
                            100 = Starting Point
                        </span>

                        <small>
                            Higher score means
                            stronger currency.
                        </small>
                    </div>

                </div>

            </div>


            {/* SIMPLE LESSON */}

            <div className="currency-lesson">

                <div className="lesson-badge">
                    💡
                </div>

                <div className="lesson-text">

                    <strong>
                        HOW DOES THIS WORK?
                    </strong>

                    <p>
                        Think of each currency as a
                        player in a game. The index
                        starts around <b>100</b>. As
                        market conditions change, its
                        power level can rise or fall.
                    </p>

                </div>

                <div className="lesson-scale">

                    <span>WEAKER</span>

                    <div className="scale-bar">
                        <div />
                    </div>

                    <span>STRONGER</span>

                </div>

            </div>


            {/* CURRENCY GRID */}

            <div className="currency-grid">

                {Object.values(currencyState).map(
                    (currency: any) => (
                        <CurrencyCard
                            key={currency.currency}
                            currency={currency.currency}
                            strength={currency.strength}
                            ohlc={currency.ohlc}
                        />
                    ),
                )}

            </div>


            {/* FOOTER EXPLANATION */}

            <div className="currency-footer">

                <div className="footer-icon">
                    🎮
                </div>

                <div>

                    <strong>
                        MARKET WATCH
                    </strong>

                    <p>
                        Keep an eye on these power
                        levels. Changes in currencies
                        can influence other markets
                        around the world.
                    </p>

                </div>

            </div>

        </section>
    );
}


/* =====================================================
   CURRENCY CARD
===================================================== */

interface CurrencyCardProps {
    currency: string;
    strength: number;
    ohlc: {
        open: number;
        high: number;
        low: number;
        close: number;
    };
}

function CurrencyCard({
    currency,
    strength,
    ohlc,
}: CurrencyCardProps) {

    const displayStrength =
        strength.toFixed(3);

    return (
        <div className="currency-card">

            {/* CARD HEADER */}

            <div className="currency-card-header">

                <div className="currency-avatar">
                    {currency
                        .slice(0, 2)
                        .toUpperCase()}
                </div>

                <div>

                    <span className="currency-code">
                        {currency}
                    </span>

                    <span className="currency-type">
                        CURRENCY INDEX
                    </span>

                </div>

                <span className="power-icon">
                    ⚡
                </span>

            </div>


            {/* STRENGTH */}

            <div className="strength-area">

                <span className="strength-label">
                    POWER LEVEL
                </span>

                <strong className="strength-value">
                    {displayStrength}
                </strong>

                <span className="strength-base">
                    BASE = 100
                </span>

            </div>


            {/* POWER BAR */}

            <div className="power-bar-wrapper">

                <div className="power-bar">

                    <div
                        className="power-fill"
                        style={{
                            width: `${Math.min(
                                Math.max(
                                    strength,
                                    0,
                                ),
                                100,
                            )}%`,
                        }}
                    />

                </div>

                <div className="power-scale">

                    <span>
                        0
                    </span>

                    <span>
                        100
                    </span>

                </div>

            </div>


            {/* OHLC */}

            <div className="ohlc-heading">
                TODAY'S MOVEMENT
            </div>

            <div className="ohlc-grid">

                <CurrencyOHLCItem
                    label="OPEN"
                    value={ohlc.open}
                />

                <CurrencyOHLCItem
                    label="HIGH"
                    value={ohlc.high}
                />

                <CurrencyOHLCItem
                    label="LOW"
                    value={ohlc.low}
                />

                <CurrencyOHLCItem
                    label="CLOSE"
                    value={ohlc.close}
                />

            </div>

        </div>
    );
}


/* =====================================================
   OHLC ITEM
===================================================== */

interface CurrencyOHLCItemProps {
    label: string;
    value: number;
}

function CurrencyOHLCItem({
    label,
    value,
}: CurrencyOHLCItemProps) {
    return (
        <div className="ohlc-item">

            <span className="ohlc-label">
                {label}
            </span>

            <strong className="ohlc-value">
                {value.toFixed(3)}
            </strong>

        </div>
    );
}