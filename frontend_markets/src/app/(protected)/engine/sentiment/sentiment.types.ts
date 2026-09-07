export interface SentimentState {
    fearGreed: number;
    volatility: number;
    momentum: number;
    marketBreadth: number;
    safeHavenDemand: number;
    creditRisk: number;
    putCallSentiment: number;
    cotPositioning: number;
}

export interface SentimentSnapshot {
    timestamp: number;
    state: SentimentState;
}