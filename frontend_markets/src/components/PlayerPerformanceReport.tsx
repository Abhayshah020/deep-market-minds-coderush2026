

import { PerformanceRiskLevel, PlayerPerformanceState } from "@/app/(protected)/engine/player-performance/player-performance-engine.types";
import "./PlayerPerformanceReport.css";

interface PlayerPerformanceReportProps {
    performance: PlayerPerformanceState | null;
}

export default function PlayerPerformanceReport({
    performance,
}: PlayerPerformanceReportProps) {
    if (!performance) {
        return (
            <section className="performance-report performance-loading">
                <div className="performance-loading-badge">
                    PLAYER STATS
                </div>

                <h2>Player Performance</h2>

                <p>Loading your trading performance...</p>
            </section>
        );
    }

    const formatMoney = (value: number) => {
        const sign = value >= 0 ? "+" : "-";

        return `${sign}$${Math.abs(value).toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;
    };

    const formatPercent = (value: number) =>
        `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

    const score = Math.round(
        performance.overallPerformanceScore
    );

    const getScoreColor = (value: number) => {
        if (value >= 80) return "#16a34a";
        if (value >= 60) return "#ca8a04";
        if (value >= 40) return "#ea580c";

        return "#dc2626";
    };

    const getRiskColor = (
        risk: PerformanceRiskLevel
    ) => {
        switch (risk) {
            case "low":
                return "#16a34a";

            case "moderate":
                return "#ca8a04";

            case "high":
                return "#ea580c";

            case "critical":
                return "#dc2626";

            default:
                return "#666";
        }
    };

    const getPnLColor = (value: number) => {
        if (value > 0) return "#16a34a";
        if (value < 0) return "#dc2626";

        return "#666";
    };

    const Metric = ({
        label,
        value,
        subValue,
        valueColor,
    }: {
        label: string;
        value: string | number;
        subValue?: string;
        valueColor?: string;
    }) => (
        <div className="performance-metric">
            <div className="performance-metric-label">
                {label}
            </div>

            <div
                className="performance-metric-value"
                style={{
                    color:
                        valueColor ?? "#241b42",
                }}
            >
                {value}
            </div>

            {subValue && (
                <div className="performance-metric-subvalue">
                    {subValue}
                </div>
            )}
        </div>
    );

    const DetailRow = ({
        label,
        value,
        valueColor,
    }: {
        label: string;
        value: string | number;
        valueColor?: string;
    }) => (
        <div className="performance-detail-row">
            <span className="performance-detail-label">
                {label}
            </span>

            <span
                className="performance-detail-value"
                style={{
                    color:
                        valueColor ?? "#241b42",
                }}
            >
                {value}
            </span>
        </div>
    );

    return (
        <section className="performance-report">
            {/* Header */}
            <div className="performance-header">
                <div>
                    <div className="performance-eyebrow">
                        PLAYER SCORECARD
                    </div>

                    <h2>Player Performance</h2>

                    <p>
                        See how well you are trading,
                        managing risk, and making decisions.
                    </p>
                </div>

                {/* Grade */}
                <div className="performance-grade-box">
                    <div
                        className="performance-grade"
                        style={{
                            borderColor:
                                getScoreColor(score),
                            color:
                                getScoreColor(score),
                        }}
                    >
                        {performance.performanceGrade}
                    </div>

                    <div>
                        <div className="performance-grade-label">
                            Performance Score
                        </div>

                        <div className="performance-score">
                            {score}/100
                        </div>
                    </div>
                </div>
            </div>

            {/* Score Explanation */}
            <div className="performance-score-guide">
                <span className="guide-icon">🎮</span>

                <div>
                    <strong>YOUR TRADING SCORE</strong>
                    <p>
                        A higher score means you are doing
                        a better job balancing profits,
                        risk, and discipline.
                    </p>
                </div>
            </div>

            {/* Account Performance */}
            <div className="performance-section">
                <div className="performance-section-heading">
                    <span className="section-icon">💰</span>

                    <div>
                        <h3>Account Performance</h3>
                        <p>
                            How your trading account is
                            doing right now.
                        </p>
                    </div>
                </div>

                <div className="performance-metric-grid">
                    <Metric
                        label="Initial Balance"
                        value={`$${performance.initialBalance.toLocaleString(
                            "en-US",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}`}
                    />

                    <Metric
                        label="Current Equity"
                        value={`$${performance.currentEquity.toLocaleString(
                            "en-US",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}`}
                    />

                    <Metric
                        label="Total P/L"
                        value={formatMoney(
                            performance.totalPnL
                        )}
                        valueColor={getPnLColor(
                            performance.totalPnL
                        )}
                        subValue={formatPercent(
                            performance.returnPercent
                        )}
                    />

                    <Metric
                        label="Realized P/L"
                        value={formatMoney(
                            performance.realizedPnL
                        )}
                        valueColor={getPnLColor(
                            performance.realizedPnL
                        )}
                    />

                    <Metric
                        label="Unrealized P/L"
                        value={formatMoney(
                            performance.unrealizedPnL
                        )}
                        valueColor={getPnLColor(
                            performance.unrealizedPnL
                        )}
                    />

                    <Metric
                        label="Peak Equity"
                        value={`$${performance.peakEquity.toLocaleString(
                            "en-US",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}`}
                    />
                </div>
            </div>

            {/* Trading Statistics */}
            <div className="performance-section">
                <div className="performance-section-heading">
                    <span className="section-icon">📊</span>

                    <div>
                        <h3>Trading Statistics</h3>
                        <p>
                            Your trading record and results.
                        </p>
                    </div>
                </div>

                <div className="performance-metric-grid">
                    <Metric
                        label="Total Trades"
                        value={performance.totalTrades}
                    />

                    <Metric
                        label="Win Rate"
                        value={`${performance.winRate.toFixed(
                            1
                        )}%`}
                        subValue={`${performance.winningTrades} wins`}
                    />

                    <Metric
                        label="Losses"
                        value={performance.losingTrades}
                    />

                    <Metric
                        label="Breakeven"
                        value={performance.breakevenTrades}
                    />

                    <Metric
                        label="Profit Factor"
                        value={
                            Number.isFinite(
                                performance.profitFactor
                            )
                                ? performance.profitFactor.toFixed(
                                    2
                                )
                                : "∞"
                        }
                    />

                    <Metric
                        label="Risk / Reward"
                        value={
                            Number.isFinite(
                                performance.riskRewardRatio
                            )
                                ? performance.riskRewardRatio.toFixed(
                                    2
                                )
                                : "∞"
                        }
                    />

                    <Metric
                        label="Expectancy"
                        value={formatMoney(
                            performance.expectancy
                        )}
                        valueColor={getPnLColor(
                            performance.expectancy
                        )}
                    />

                    <Metric
                        label="Average Win"
                        value={formatMoney(
                            performance.averageWin
                        )}
                        valueColor="#16a34a"
                    />

                    <Metric
                        label="Average Loss"
                        value={formatMoney(
                            -Math.abs(
                                performance.averageLoss
                            )
                        )}
                        valueColor="#dc2626"
                    />

                    <Metric
                        label="Largest Win"
                        value={formatMoney(
                            performance.largestWin
                        )}
                        valueColor="#16a34a"
                    />

                    <Metric
                        label="Largest Loss"
                        value={formatMoney(
                            -Math.abs(
                                performance.largestLoss
                            )
                        )}
                        valueColor="#dc2626"
                    />
                </div>
            </div>

            {/* Drawdown */}
            <div className="performance-panel performance-drawdown">
                <div className="performance-panel-heading">
                    <span className="section-icon">📉</span>

                    <div>
                        <h3>Drawdown</h3>
                        <p>
                            How far your account has fallen
                            from its peak.
                        </p>
                    </div>
                </div>

                <div className="performance-detail-grid">
                    <DetailRow
                        label="Peak Equity"
                        value={`$${performance.peakEquity.toLocaleString(
                            "en-US",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}`}
                    />

                    <DetailRow
                        label="Current Drawdown"
                        value={formatMoney(
                            -Math.abs(
                                performance.currentDrawdown
                            )
                        )}
                        valueColor="#dc2626"
                    />

                    <DetailRow
                        label="Maximum Drawdown"
                        value={formatMoney(
                            -Math.abs(
                                performance.maxDrawdown
                            )
                        )}
                        valueColor="#dc2626"
                    />

                    <DetailRow
                        label="Drawdown"
                        value={formatPercent(
                            -Math.abs(
                                performance.drawdownPercent
                            )
                        )}
                        valueColor="#dc2626"
                    />
                </div>
            </div>

            {/* Risk Management + Position Sizing */}
            <div className="performance-two-column">
                <div className="performance-panel">
                    <div className="performance-panel-heading">
                        <span className="section-icon">🛡️</span>

                        <div>
                            <h3>Risk Management</h3>
                            <p>
                                How carefully you protect
                                your trading account.
                            </p>
                        </div>
                    </div>

                    <DetailRow
                        label="Risk Level"
                        value={
                            performance.riskManagement
                                .riskLevel
                        }
                        valueColor={getRiskColor(
                            performance.riskManagement
                                .riskLevel
                        )}
                    />

                    <DetailRow
                        label="Average Risk / Trade"
                        value={`${performance.riskManagement.averageRiskPerTrade.toFixed(
                            2
                        )}%`}
                    />

                    <DetailRow
                        label="Maximum Risk / Trade"
                        value={`${performance.riskManagement.maxRiskPerTrade.toFixed(
                            2
                        )}%`}
                    />

                    <DetailRow
                        label="Risk Violations"
                        value={
                            performance.riskManagement
                                .riskViolations
                        }
                        valueColor={
                            performance.riskManagement
                                .riskViolations > 0
                                ? "#dc2626"
                                : "#16a34a"
                        }
                    />

                    <DetailRow
                        label="Oversized Trades"
                        value={
                            performance.riskManagement
                                .oversizedTrades
                        }
                    />

                    <DetailRow
                        label="Stop Loss Usage"
                        value={`${performance.riskManagement.stopLossUsage.toFixed(
                            1
                        )}%`}
                    />

                    <DetailRow
                        label="Position Concentration"
                        value={`${performance.riskManagement.positionConcentration.toFixed(
                            1
                        )}%`}
                    />
                </div>

                <div className="performance-panel">
                    <div className="performance-panel-heading">
                        <span className="section-icon">📦</span>

                        <div>
                            <h3>Position Sizing</h3>
                            <p>
                                How large your trading
                                positions are.
                            </p>
                        </div>
                    </div>

                    <DetailRow
                        label="Average Position"
                        value={performance.positionSizing.averagePositionSize.toLocaleString(
                            "en-US"
                        )}
                    />

                    <DetailRow
                        label="Largest Position"
                        value={performance.positionSizing.largestPositionSize.toLocaleString(
                            "en-US"
                        )}
                    />

                    <DetailRow
                        label="Average Notional"
                        value={`$${performance.positionSizing.averageNotional.toLocaleString(
                            "en-US",
                            {
                                maximumFractionDigits: 2,
                            }
                        )}`}
                    />

                    <DetailRow
                        label="Largest Notional"
                        value={`$${performance.positionSizing.largestNotional.toLocaleString(
                            "en-US",
                            {
                                maximumFractionDigits: 2,
                            }
                        )}`}
                    />

                    <DetailRow
                        label="Sizing Consistency"
                        value={`${performance.positionSizing.sizingConsistency.toFixed(
                            1
                        )}%`}
                    />

                    <DetailRow
                        label="Oversized Position Rate"
                        value={`${performance.positionSizing.oversizedPositionRate.toFixed(
                            1
                        )}%`}
                    />
                </div>
            </div>

            {/* Behaviour */}
            <div className="performance-panel performance-behaviour">
                <div className="performance-panel-heading">
                    <span className="section-icon">🧠</span>

                    <div>
                        <h3>Trading Behaviour</h3>
                        <p>
                            What your trading habits tell
                            us about your strategy.
                        </p>
                    </div>
                </div>

                <div className="performance-detail-grid">
                    <DetailRow
                        label="Behaviour"
                        value={
                            performance.behavior.behavior
                        }
                    />

                    <DetailRow
                        label="Trades / Hour"
                        value={performance.behavior.tradesPerHour.toFixed(
                            2
                        )}
                    />

                    <DetailRow
                        label="Trades / Day"
                        value={performance.behavior.tradesPerDay.toFixed(
                            2
                        )}
                    />

                    <DetailRow
                        label="Consecutive Wins"
                        value={
                            performance.behavior
                                .consecutiveWins
                        }
                    />

                    <DetailRow
                        label="Consecutive Losses"
                        value={
                            performance.behavior
                                .consecutiveLosses
                        }
                    />

                    <DetailRow
                        label="Revenge Trading"
                        value={`${performance.behavior.revengeTradingScore.toFixed(
                            1
                        )}/100`}
                    />

                    <DetailRow
                        label="Overtrading"
                        value={`${performance.behavior.overtradingScore.toFixed(
                            1
                        )}/100`}
                    />

                    <DetailRow
                        label="Consistency"
                        value={`${performance.behavior.consistencyScore.toFixed(
                            1
                        )}/100`}
                    />

                    <DetailRow
                        label="Discipline"
                        value={`${performance.behavior.disciplineScore.toFixed(
                            1
                        )}/100`}
                    />
                </div>
            </div>

            {/* Learning Footer */}
            <div className="performance-learning">
                <div className="learning-character">
                    🧑‍🚀
                </div>

                <div>
                    <strong>MARKET COACH</strong>
                    <p>
                        Making money is only one part of
                        trading. Good traders also control
                        risk, position size, and emotions.
                    </p>
                </div>
            </div>
        </section>
    );
}