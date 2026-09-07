import { EconomicCard } from "./NepalMarketSection";
import "./DemoTradingSection.css";

interface DemoTradingSectionProps {
    tradingState: any;
    tradingSymbol: string;
    setTradingSymbol: (value: string) => void;
    tradingOrderType: any;
    setTradingOrderType: (value: any) => void;
    tradingLeverage: number;
    setTradingLeverage: (value: number) => void;
    tradingLotSize: number;
    setTradingLotSize: (value: number) => void;
    tradingPrice: number | "";
    setTradingPrice: (value: number | "") => void;
    tradingSide: string;
    setTradingSide: (value: string) => void;
    selectedInstrument: any;
    selectedTradingQuote: any;
    selectedPosition: any;
    orderQuantity: number;
    getOrderQuantity: () => number;
    handleClosePosition: (symbol: string) => void;
    tradingEngineRef: React.MutableRefObject<any>;
    setTradingState: (value: any) => void;
    TRADING_INSTRUMENTS: any[];
}

export default function DemoTradingSection({
    tradingState,
    tradingSymbol,
    setTradingSymbol,
    tradingOrderType,
    setTradingOrderType,
    tradingLeverage,
    setTradingLeverage,
    tradingLotSize,
    setTradingLotSize,
    tradingPrice,
    setTradingPrice,
    setTradingSide,
    selectedInstrument,
    selectedTradingQuote,
    selectedPosition,
    orderQuantity,
    getOrderQuantity,
    handleClosePosition,
    tradingEngineRef,
    setTradingState,
    TRADING_INSTRUMENTS,
}: DemoTradingSectionProps) {
    if (!tradingState) {
        return null;
    }

    const handleOrder = (side: "buy" | "sell") => {
        setTradingSide(side);

        const engine = tradingEngineRef.current;

        if (!engine || !selectedInstrument) {
            return;
        }

        const quantity = getOrderQuantity();

        if (quantity <= 0) {
            return;
        }

        const result =
            tradingOrderType === "market"
                ? engine.placeMarketOrder(
                    tradingSymbol,
                    side,
                    quantity
                )
                : tradingOrderType === "limit"
                    ? engine.placeLimitOrder(
                        tradingSymbol,
                        side,
                        quantity,
                        Number(tradingPrice)
                    )
                    : engine.placeStopOrder(
                        tradingSymbol,
                        side,
                        quantity,
                        Number(tradingPrice)
                    );

        if (result.success) {
            setTradingState(engine.getState());
        }
    };

    return (
        <section className="trading-section">

            {/* =================================================
                HERO / ACCOUNT HEADER
            ================================================= */}

            <div className="trading-hero">

                <div className="trading-hero-content">

                    <div className="trading-kicker">
                        🎮 YOUR TRADING LAB
                    </div>

                    <h2>
                        Ready to
                        <br />
                        <span>make a trade?</span>
                    </h2>

                    <p>
                        You have virtual money. Pick a
                        market, choose your strategy,
                        and see what happens!
                    </p>

                    <div className="virtual-badge">
                        <span>🪙</span>
                        DEMO MONEY · $100,000
                    </div>

                </div>

                <div className="trading-hero-illustration">

                    <div className="coin coin-one">
                        $
                    </div>

                    <div className="coin coin-two">
                        $
                    </div>

                    <div className="trading-controller">
                        <span>▲</span>
                        <span>◆</span>
                        <span>●</span>
                    </div>

                    <div className="hero-chart">
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>

                </div>

            </div>


            {/* =================================================
                ACCOUNT SCOREBOARD
            ================================================= */}

            <div className="account-board">

                <div className="board-title">

                    <span className="board-icon">
                        💰
                    </span>

                    <div>
                        <strong>
                            MY MONEY
                        </strong>

                        <small>
                            Keep an eye on your game score
                        </small>
                    </div>

                </div>

                <div className="account-stats">

                    <div className="account-stat cash-stat">
                        <span>💵 CASH</span>

                        <strong>
                            $
                            {tradingState.cash.toLocaleString(
                                "en-US",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </strong>
                    </div>

                    <div className="account-stat equity-stat">
                        <span>🏆 EQUITY</span>

                        <strong>
                            $
                            {tradingState.equity.toLocaleString(
                                "en-US",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </strong>
                    </div>

                    <div className="account-stat">
                        <span>📊 OPEN P&L</span>

                        <strong>
                            $
                            {tradingState.unrealizedPnL.toLocaleString(
                                "en-US",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </strong>
                    </div>

                    <div className="account-stat">
                        <span>🎯 CLOSED P&L</span>

                        <strong>
                            $
                            {tradingState.realizedPnL.toLocaleString(
                                "en-US",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </strong>
                    </div>

                    <div className="account-stat total-stat">
                        <span>⭐ TOTAL SCORE</span>

                        <strong>
                            $
                            {tradingState.totalPnL.toLocaleString(
                                "en-US",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                HOW TO TRADE
            ================================================= */}

            <div className="trading-steps">

                <div className="step">
                    <span>1</span>
                    <div>
                        <strong>Pick a market</strong>
                        <small>
                            Choose what you want to trade.
                        </small>
                    </div>
                </div>

                <div className="step-arrow">
                    →
                </div>

                <div className="step">
                    <span>2</span>
                    <div>
                        <strong>Choose your trade</strong>
                        <small>
                            Buy if you think it goes up.
                        </small>
                    </div>
                </div>

                <div className="step-arrow">
                    →
                </div>

                <div className="step">
                    <span>3</span>
                    <div>
                        <strong>Watch the result</strong>
                        <small>
                            Learn from what happens.
                        </small>
                    </div>
                </div>

            </div>


            {/* =================================================
                ORDER PANEL
            ================================================= */}

            <div className="order-panel">

                <div className="panel-heading">

                    <div className="panel-heading-icon">
                        🎯
                    </div>

                    <div>
                        <span>
                            STEP 1
                        </span>

                        <h3>
                            Build Your Trade
                        </h3>

                        <p>
                            Choose your market and decide
                            how you want to play.
                        </p>
                    </div>

                </div>


                <div className="order-form-grid">

                    {/* INSTRUMENT */}

                    <div className="trade-field">

                        <label>
                            🌍 MARKET
                        </label>

                        <select
                            value={tradingSymbol}
                            onChange={(event) => {
                                const symbol =
                                    event.target.value;

                                setTradingSymbol(symbol);

                                const quote =
                                    tradingState?.quotes[
                                    symbol
                                    ];

                                if (
                                    quote &&
                                    tradingOrderType !==
                                    "market"
                                ) {
                                    setTradingPrice(
                                        quote.mid
                                    );
                                } else {
                                    setTradingPrice("");
                                }
                            }}
                        >

                            <optgroup label="💱 Currency">

                                {TRADING_INSTRUMENTS
                                    .filter(
                                        (instrument) =>
                                            instrument.assetType ===
                                            "currency"
                                    )
                                    .map(
                                        (instrument) => (
                                            <option
                                                key={
                                                    instrument.symbol
                                                }
                                                value={
                                                    instrument.symbol
                                                }
                                            >
                                                {
                                                    instrument.label
                                                }
                                            </option>
                                        )
                                    )}

                            </optgroup>

                            <optgroup label="🇳🇵 Nepal">

                                {TRADING_INSTRUMENTS
                                    .filter(
                                        (instrument) =>
                                            instrument.assetType ===
                                            "nepalIndex"
                                    )
                                    .map(
                                        (instrument) => (
                                            <option
                                                key={
                                                    instrument.symbol
                                                }
                                                value={
                                                    instrument.symbol
                                                }
                                            >
                                                {
                                                    instrument.label
                                                }
                                            </option>
                                        )
                                    )}

                            </optgroup>

                        </select>

                        {selectedInstrument && (
                            <small className="field-hint">
                                {selectedInstrument.assetType}
                            </small>
                        )}

                    </div>


                    {/* ORDER TYPE */}

                    <div className="trade-field">

                        <label>
                            🧩 ORDER TYPE
                        </label>

                        <select
                            value={tradingOrderType}
                            onChange={(event) => {
                                const type =
                                    event.target.value;

                                setTradingOrderType(type);

                                if (type === "market") {
                                    setTradingPrice("");
                                    return;
                                }

                                const quote =
                                    tradingState?.quotes[
                                    tradingSymbol
                                    ];

                                if (quote) {
                                    setTradingPrice(
                                        quote.mid
                                    );
                                }
                            }}
                        >

                            <option value="market">
                                Market — Trade Now
                            </option>

                            <option value="limit">
                                Limit — Wait for Price
                            </option>

                            <option value="stop">
                                Stop — Start at Price
                            </option>

                        </select>

                    </div>


                    {/* LEVERAGE */}

                    <div className="trade-field">

                        <label>
                            ⚡ LEVERAGE
                        </label>

                        <select
                            value={tradingLeverage}
                            onChange={(event) =>
                                setTradingLeverage(
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                        >

                            {[1, 2, 5, 10, 20, 30, 50, 100, 200].map(
                                (leverage) => (
                                    <option
                                        key={leverage}
                                        value={leverage}
                                    >
                                        1:{leverage}
                                    </option>
                                )
                            )}

                        </select>

                        <small className="field-hint">
                            Higher leverage = bigger risk
                        </small>

                    </div>


                    {/* LOT SIZE */}

                    <div className="trade-field">

                        <label>
                            📦 LOT SIZE
                        </label>

                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={tradingLotSize}
                            onChange={(event) =>
                                setTradingLotSize(
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                        />

                        <small className="field-hint">
                            How big should your trade be?
                        </small>

                    </div>


                    {/* LIMIT / STOP */}

                    {tradingOrderType !== "market" && (
                        <div className="trade-field">

                            <label>
                                🎯{" "}
                                {tradingOrderType ===
                                    "limit"
                                    ? "LIMIT PRICE"
                                    : "STOP PRICE"}
                            </label>

                            <input
                                type="number"
                                step="any"
                                value={tradingPrice}
                                onChange={(event) =>
                                    setTradingPrice(
                                        event.target
                                            .value === ""
                                            ? ""
                                            : Number(
                                                event
                                                    .target
                                                    .value
                                            )
                                    )
                                }
                            />

                            <small className="field-hint">
                                Set the price where
                                your order activates.
                            </small>

                        </div>
                    )}

                </div>

            </div>


            {/* =================================================
                ORDER PREVIEW
            ================================================= */}

            {selectedTradingQuote && (
                <div className="trade-preview">

                    <div className="preview-heading">

                        <span>
                            🧮
                        </span>

                        <div>
                            <strong>
                                TRADE PREVIEW
                            </strong>

                            <small>
                                Here's what your trade
                                looks like.
                            </small>
                        </div>

                    </div>

                    <div className="preview-grid">

                        <div className="preview-card">
                            <span>📦 LOTS</span>
                            <strong>
                                {tradingLotSize.toFixed(2)}
                            </strong>
                        </div>

                        <div className="preview-card">
                            <span>⚡ LEVERAGE</span>
                            <strong>
                                1:{tradingLeverage}
                            </strong>
                        </div>

                        <div className="preview-card">
                            <span>🔢 UNITS</span>
                            <strong>
                                {orderQuantity.toLocaleString()}
                            </strong>
                        </div>

                        <div className="preview-card">
                            <span>💵 NOTIONAL</span>
                            <strong>
                                $
                                {(
                                    orderQuantity *
                                    selectedTradingQuote.mid
                                ).toLocaleString(
                                    "en-US",
                                    {
                                        minimumFractionDigits:
                                            2,
                                        maximumFractionDigits:
                                            2,
                                    }
                                )}
                            </strong>
                        </div>

                        <div className="preview-card margin-card">
                            <span>🔐 EST. MARGIN</span>
                            <strong>
                                $
                                {(
                                    (orderQuantity *
                                        selectedTradingQuote.mid) /
                                    tradingLeverage
                                ).toLocaleString(
                                    "en-US",
                                    {
                                        minimumFractionDigits:
                                            2,
                                        maximumFractionDigits:
                                            2,
                                    }
                                )}
                            </strong>
                        </div>

                    </div>

                </div>
            )}


            {/* =================================================
                LIVE QUOTE
            ================================================= */}

            {selectedTradingQuote && (
                <div className="quote-panel">

                    <div className="quote-heading">

                        <span className="live-dot" />

                        <div>
                            <strong>
                                LIVE MARKET QUOTE
                            </strong>

                            <small>
                                {tradingSymbol}
                            </small>
                        </div>

                    </div>

                    <div className="quote-grid">

                        <div className="quote-value bid">
                            <span>
                                BUYERS WANT
                            </span>

                            <strong>
                                {selectedTradingQuote.bid.toFixed(
                                    5
                                )}
                            </strong>

                            <small>
                                BID
                            </small>
                        </div>

                        <div className="quote-value ask">
                            <span>
                                SELLERS WANT
                            </span>

                            <strong>
                                {selectedTradingQuote.ask.toFixed(
                                    5
                                )}
                            </strong>

                            <small>
                                ASK
                            </small>
                        </div>

                        <div className="quote-value">
                            <span>
                                MIDDLE PRICE
                            </span>

                            <strong>
                                {selectedTradingQuote.mid.toFixed(
                                    5
                                )}
                            </strong>

                            <small>
                                MID
                            </small>
                        </div>

                        <div className="quote-value">
                            <span>
                                PRICE GAP
                            </span>

                            <strong>
                                {selectedTradingQuote.spread.toFixed(
                                    5
                                )}
                            </strong>

                            <small>
                                SPREAD
                            </small>
                        </div>

                        <div className="quote-value">
                            <span>
                                TINY GAP
                            </span>

                            <strong>
                                {selectedTradingQuote.spreadBps.toFixed(
                                    2
                                )}
                            </strong>

                            <small>
                                BASIS POINTS
                            </small>
                        </div>

                    </div>

                </div>
            )}


            {/* =================================================
                BUY / SELL
            ================================================= */}

            <div className="trade-actions">

                <div className="action-title">
                    <span>
                        STEP 2
                    </span>

                    <h3>
                        What do you think?
                    </h3>

                    <p>
                        Do you think the price will go
                        up or down?
                    </p>
                </div>

                <div className="action-buttons">

                    <button
                        type="button"
                        disabled={
                            !selectedInstrument ||
                            tradingLotSize <= 0
                        }
                        onClick={() =>
                            handleOrder("buy")
                        }
                        className="buy-button"
                    >
                        <span className="action-emoji">
                            🚀
                        </span>

                        <span>
                            <strong>
                                BUY
                            </strong>

                            <small>
                                I think it goes UP
                            </small>
                        </span>

                        {selectedInstrument && (
                            <b>
                                {tradingLotSize.toFixed(
                                    2
                                )} Lot
                            </b>
                        )}
                    </button>


                    <button
                        type="button"
                        disabled={
                            !selectedInstrument ||
                            tradingLotSize <= 0
                        }
                        onClick={() =>
                            handleOrder("sell")
                        }
                        className="sell-button"
                    >
                        <span className="action-emoji">
                            🪂
                        </span>

                        <span>
                            <strong>
                                SELL
                            </strong>

                            <small>
                                I think it goes DOWN
                            </small>
                        </span>

                        {selectedInstrument && (
                            <b>
                                {tradingLotSize.toFixed(
                                    2
                                )} Lot
                            </b>
                        )}
                    </button>

                </div>

                <div className="risk-note">
                    💡 <strong>Remember:</strong>{" "}
                    Markets can move in either
                    direction. There are no guaranteed
                    wins!
                </div>

            </div>


            {/* =================================================
                SELECTED POSITION
            ================================================= */}

            {selectedPosition &&
                selectedPosition.quantity !== 0 && (
                    <div className="position-panel">

                        <div className="position-header">

                            <div className="position-title">

                                <div className="position-icon">
                                    🎒
                                </div>

                                <div>
                                    <span>
                                        YOUR OPEN TRADE
                                    </span>

                                    <h3>
                                        {
                                            selectedPosition.symbol
                                        }
                                    </h3>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    handleClosePosition(
                                        selectedPosition.symbol
                                    )
                                }
                                className="close-position-button"
                            >
                                ✕ Close Trade
                            </button>

                        </div>


                        <div className="position-grid">

                            <div className="position-card">
                                <span>
                                    🔢 UNITS
                                </span>

                                <strong>
                                    {selectedPosition.quantity.toLocaleString()}
                                </strong>
                            </div>

                            <div className="position-card">
                                <span>
                                    🎯 ENTRY PRICE
                                </span>

                                <strong>
                                    {selectedPosition.averageEntryPrice.toFixed(
                                        5
                                    )}
                                </strong>
                            </div>

                            <div className="position-card">
                                <span>
                                    📍 CURRENT PRICE
                                </span>

                                <strong>
                                    {selectedPosition.currentPrice.toFixed(
                                        5
                                    )}
                                </strong>
                            </div>

                            <div className="position-card">
                                <span>
                                    💰 MARKET VALUE
                                </span>

                                <strong>
                                    $
                                    {selectedPosition.marketValue.toLocaleString(
                                        "en-US",
                                        {
                                            minimumFractionDigits:
                                                2,
                                            maximumFractionDigits:
                                                2,
                                        }
                                    )}
                                </strong>
                            </div>

                            <div className="position-card">
                                <span>
                                    📈 OPEN P&L
                                </span>

                                <strong>
                                    $
                                    {selectedPosition.unrealizedPnL.toLocaleString(
                                        "en-US",
                                        {
                                            minimumFractionDigits:
                                                2,
                                            maximumFractionDigits:
                                                2,
                                        }
                                    )}
                                </strong>
                            </div>

                            <div className="position-card">
                                <span>
                                    🏁 CLOSED P&L
                                </span>

                                <strong>
                                    $
                                    {selectedPosition.realizedPnL.toLocaleString(
                                        "en-US",
                                        {
                                            minimumFractionDigits:
                                                2,
                                            maximumFractionDigits:
                                                2,
                                        }
                                    )}
                                </strong>
                            </div>

                        </div>

                    </div>
                )}


            {/* =================================================
                ORDER HISTORY
            ================================================= */}

            <div className="orders-panel">

                <div className="orders-header">

                    <div>

                        <div className="orders-kicker">
                            📋 STEP 3
                        </div>

                        <h3>
                            Your Trading Diary
                        </h3>

                        <p>
                            Every decision you make is
                            recorded here.
                        </p>

                    </div>

                    <div className="orders-count">
                        {tradingState.orders.length}
                        <span>
                            ORDERS
                        </span>
                    </div>

                </div>


                <div className="orders-table-wrapper">

                    <table className="orders-table">

                        <thead>
                            <tr>
                                {[
                                    "ID",
                                    "Market",
                                    "Side",
                                    "Type",
                                    "Quantity",
                                    "Price",
                                    "Status",
                                    "Filled",
                                ].map((header) => (
                                    <th key={header}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>

                            {tradingState.orders
                                .slice()
                                .reverse()
                                .slice(0, 10)
                                .map((order: any) => (
                                    <tr key={order.id}>

                                        <td>
                                            <span className="order-id">
                                                {order.id}
                                            </span>
                                        </td>

                                        <td>
                                            <strong>
                                                {order.symbol}
                                            </strong>
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    order.side ===
                                                        "buy"
                                                        ? "side-badge buy"
                                                        : "side-badge sell"
                                                }
                                            >
                                                {order.side ===
                                                    "buy"
                                                    ? "🚀 BUY"
                                                    : "🪂 SELL"}
                                            </span>

                                        </td>

                                        <td>
                                            <span className="type-badge">
                                                {order.type.toUpperCase()}
                                            </span>
                                        </td>

                                        <td>
                                            {order.quantity.toLocaleString()}
                                        </td>

                                        <td>
                                            {order.filledPrice !==
                                                null
                                                ? order.filledPrice.toFixed(
                                                    5
                                                )
                                                : order.price ??
                                                order.stopPrice ??
                                                "—"}
                                        </td>

                                        <td>
                                            <span className="status-badge">
                                                {order.status}
                                            </span>
                                        </td>

                                        <td>
                                            {order.filledQuantity.toLocaleString()}
                                        </td>

                                    </tr>
                                ))}

                            {tradingState.orders.length ===
                                0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="empty-orders"
                                        >
                                            <span>
                                                🐣
                                            </span>

                                            <strong>
                                                No trades yet!
                                            </strong>

                                            <small>
                                                Your first trading
                                                adventure will
                                                appear here.
                                            </small>
                                        </td>
                                    </tr>
                                )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =================================================
                EDUCATIONAL FOOTER
            ================================================= */}

            <div className="trading-tip">

                <div className="tip-icon">
                    🧠
                </div>

                <div>

                    <strong>
                        TRADER TIP
                    </strong>

                    <p>
                        Good traders don't try to guess
                        every move. They observe, make a
                        plan, understand the risk, and
                        learn from what happens next.
                    </p>

                </div>

            </div>

        </section>
    );
}