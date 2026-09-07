export type SimulationDirection = "forward" | "backward";

export type SimulationSpeed =
    | 1
    | 10
    | 100
    | 1_000
    | 10_000
    | 100_000
    | 1_000_000
    | 10_000_000;

export type SimulationStatus = "running" | "stopped";

export interface SimulationClockState {
    currentTime: number;
    speed: SimulationSpeed;
    direction: SimulationDirection;
    status: SimulationStatus;
}