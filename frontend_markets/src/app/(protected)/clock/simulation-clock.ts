import {
    SimulationClockState,
    SimulationDirection,
    SimulationSpeed,
    SimulationStatus,
} from "./simulation-clock.types";

export class SimulationClock {
    private currentTime: number;

    /**
     * Earliest time the simulation is allowed
     * to reach.
     */
    private readonly minimumTime: number;

    private speed: SimulationSpeed;
    private direction: SimulationDirection;
    private status: SimulationStatus;

    private lastRealTime: number | null = null;

    constructor(initialTime: number = Date.now()) {
        this.currentTime = initialTime;

        this.minimumTime = initialTime;

        this.speed = 1;

        this.direction = "forward";

        this.status = "stopped";
    }

    start(): void {
        if (this.status === "running") {
            return;
        }

        this.status = "running";

        this.lastRealTime = performance.now();
    }

    stop(): void {
        this.update();

        this.status = "stopped";

        this.lastRealTime = null;
    }

    setDirection(
        direction: SimulationDirection
    ): void {
        this.update();

        this.direction = direction;

        if (this.status === "running") {
            this.lastRealTime = performance.now();
        }
    }

    setSpeed(
        speed: SimulationSpeed
    ): void {
        this.update();

        this.speed = speed;

        if (this.status === "running") {
            this.lastRealTime = performance.now();
        }
    }

    // update(): void {
    //     if (
    //         this.status !== "running" ||
    //         this.lastRealTime === null
    //     ) {
    //         return;
    //     }

    //     const now = performance.now();

    //     const realElapsedMilliseconds =
    //         now - this.lastRealTime;

    //     const simulationElapsedMilliseconds =
    //         realElapsedMilliseconds *
    //         this.speed;

    //     if (
    //         this.direction === "forward"
    //     ) {
    //         this.currentTime +=
    //             simulationElapsedMilliseconds;
    //     } else {
    //         this.currentTime -=
    //             simulationElapsedMilliseconds;

    //         /*
    //          * Enforce minimum simulation time.
    //          */
    //         if (
    //             this.currentTime <=
    //             this.minimumTime
    //         ) {
    //             this.currentTime =
    //                 this.minimumTime;

    //             this.status = "stopped";

    //             this.lastRealTime = null;
    //         }
    //     }

    //     this.lastRealTime = now;
    // }

    update(): void {
        if (
            this.status !== "running" ||
            this.lastRealTime === null
        ) {
            return;
        }

        const now = performance.now();

        const realElapsedMilliseconds =
            now - this.lastRealTime;

        const simulationElapsedMilliseconds =
            realElapsedMilliseconds *
            this.speed;

        this.lastRealTime = now;

        if (
            this.direction === "forward"
        ) {
            this.currentTime +=
                simulationElapsedMilliseconds;

            return;
        }

        this.currentTime -=
            simulationElapsedMilliseconds;

        if (
            this.currentTime <=
            this.minimumTime
        ) {
            this.currentTime =
                this.minimumTime;

            this.status = "stopped";

            this.lastRealTime = null;
        }
    }

    getTime(): number {
        this.update();

        return this.currentTime;
    }

    getSpeed(): SimulationSpeed {
        return this.speed;
    }

    getDirection(): SimulationDirection {
        return this.direction;
    }

    getStatus(): SimulationStatus {
        return this.status;
    }

    getMinimumTime(): number {
        return this.minimumTime;
    }

    getState(): SimulationClockState {
        this.update();

        return {
            currentTime: this.currentTime,
            speed: this.speed,
            direction: this.direction,
            status: this.status,
        };
    }
}