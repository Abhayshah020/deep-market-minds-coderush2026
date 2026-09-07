export type NewsEventType =
    | "economicReport"
    | "economicNews"
    | "worldEvent"
    | "geopolitical"
    | "climate"
    | "company"
    | "noise";

export type NewsEventFrequency =
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "yearly";

export type NewsEventSeverity =
    | "low"
    | "medium"
    | "high"
    | "extreme";

export interface NewsEvent {
    id: string;

    timestamp: number;

    type: NewsEventType;

    frequency: NewsEventFrequency;

    title: string;

    description: string;

    /**
     * Economic impact.
     *
     * -1.0 = extremely negative
     *  0.0 = neutral
     * +1.0 = extremely positive
     */
    economicEffect: number;

    severity: NewsEventSeverity;
}

export interface NewsEventSnapshot {
    timestamp: number;

    events: NewsEvent[];
}

export interface NewsCorrelationInput {
    economicSensitivity: number;
    marketSensitivity: number;
    bondSensitivity: number;
    currencySensitivity: number;
    nepalSensitivity: number;
}