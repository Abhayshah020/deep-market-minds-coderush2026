"use client";

import "./SimulationControls.css";

interface SimulationControlsProps {
    formattedDateTime: string;
    isRunning: boolean;
    direction: "forward" | "backward";
    isAtMinimumTime: boolean;
    speed: number;
    SIMULATION_SPEEDS: number[];
    handleStart: (
        direction: "forward" | "backward",
    ) => void;
    handleStop: () => void;
    handleSpeedChange: (
        simulationSpeed: number,
    ) => void;
}

export default function SimulationControls({
    formattedDateTime,
    isRunning,
    direction,
    isAtMinimumTime,
    speed,
    SIMULATION_SPEEDS,
    handleStart,
    handleStop,
    handleSpeedChange,
}: SimulationControlsProps) {
    return (
        <section className="simulation-controls">

            {/* HEADER */}

            <div className="simulation-controls-header">

                <div>
                    <div className="simulation-kicker">
                        🎮 SIMULATION CONTROL
                    </div>

                    <h2>
                        Time Machine
                    </h2>

                    <p>
                        Move through the economy and
                        watch the market change over time.
                    </p>
                </div>

                <div
                    className={
                        isRunning
                            ? "simulation-status running"
                            : "simulation-status stopped"
                    }
                >
                    <span className="status-dot" />

                    {isRunning
                        ? "RUNNING"
                        : "STOPPED"}
                </div>

            </div>


            {/* CURRENT TIME */}

            <div className="simulation-time-card">

                <div className="time-icon">
                    🕐
                </div>

                <div className="time-content">

                    <span className="time-label">
                        SIMULATION TIME
                    </span>

                    <strong>
                        {formattedDateTime}
                    </strong>

                </div>

                <div className="time-direction">

                    <span>
                        DIRECTION
                    </span>

                    <strong>
                        {direction === "forward"
                            ? "→ FORWARD"
                            : "← BACKWARD"}
                    </strong>

                </div>

            </div>


            {/* CONTROLS */}

            <div className="simulation-section">

                <div className="simulation-section-title">

                    <span>
                        ⏯
                    </span>

                    <div>
                        <strong>
                            CONTROL THE CLOCK
                        </strong>

                        <small>
                            Choose where time should move
                        </small>
                    </div>

                </div>


                <div className="direction-controls">

                    <button
                        type="button"
                        className="time-button backward"
                        disabled={
                            isAtMinimumTime
                        }
                        onClick={() =>
                            handleStart(
                                "backward",
                            )
                        }
                    >
                        <span className="button-icon">
                            ◀◀
                        </span>

                        <span>
                            <strong>
                                Backward
                            </strong>

                            <small>
                                Go to the past
                            </small>
                        </span>
                    </button>


                    <button
                        type="button"
                        className="time-button stop"
                        onClick={
                            handleStop
                        }
                    >
                        <span className="button-icon">
                            ■
                        </span>

                        <span>
                            <strong>
                                Stop
                            </strong>

                            <small>
                                Pause time
                            </small>
                        </span>
                    </button>


                    <button
                        type="button"
                        className="time-button forward"
                        onClick={() =>
                            handleStart(
                                "forward",
                            )
                        }
                    >
                        <span>
                            <strong>
                                Forward
                            </strong>

                            <small>
                                Explore the future
                            </small>
                        </span>

                        <span className="button-icon">
                            ▶▶
                        </span>
                    </button>

                </div>

            </div>


            {/* SPEED */}

            <div className="simulation-section speed-section">

                <div className="simulation-section-title">

                    <span>
                        ⚡
                    </span>

                    <div>
                        <strong>
                            SIMULATION SPEED
                        </strong>

                        <small>
                            How fast should time move?
                        </small>
                    </div>

                </div>


                <div className="speed-options">

                    {SIMULATION_SPEEDS.map(
                        (
                            simulationSpeed,
                        ) => (
                            <button
                                key={
                                    simulationSpeed
                                }
                                type="button"
                                className={
                                    speed ===
                                    simulationSpeed
                                        ? "speed-button active"
                                        : "speed-button"
                                }
                                onClick={() =>
                                    handleSpeedChange(
                                        simulationSpeed,
                                    )
                                }
                            >
                                <span className="speed-number">
                                    1:
                                    {simulationSpeed.toLocaleString()}
                                </span>

                                <span className="speed-label">
                                    {simulationSpeed ===
                                    1
                                        ? "Normal"
                                        : simulationSpeed <
                                            10
                                            ? "Fast"
                                            : "Very Fast"}
                                </span>

                            </button>
                        ),
                    )}

                </div>

            </div>


            {/* SIMPLE EXPLANATION */}

            <div className="simulation-tip">

                <div className="tip-icon">
                    💡
                </div>

                <div>

                    <strong>
                        MARKET DETECTIVE TIP
                    </strong>

                    <p>
                        Try moving forward slowly and
                        watch how prices, economic
                        conditions, and markets react
                        to changes over time.
                    </p>

                </div>

            </div>

        </section>
    );
}