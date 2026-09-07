export type NepalCompanyId =
    | "NABIL"
    | "NLIC"
    | "F1"
    | "SHIVM";

export interface NepalOHLC {
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface NepalLiquidityState {
    bankingLiquidity: number;
    creditGrowth: number;
    liquidityPressure: number;
}

export interface RemittanceState {
    monthlyInflow: number;
    annualInflow: number;
    growthRate: number;
}

export interface NepalEconomicState {
    liquidity: NepalLiquidityState;

    inflation: number;

    economicActivity: number;

    consumerDemand: number;
}

export interface NepalCompanyState {
    id: NepalCompanyId;

    name: string;

    sector: string;

    value: number;

    revenue: number;

    earnings: number;

    supply: number;

    demand: number;

    ohlc: NepalOHLC;
}

export interface NepalMarketState {
    nepseIndex: number;

    nepseOHLC: NepalOHLC;

    remittance: RemittanceState;

    economy: NepalEconomicState;

    companies: NepalCompanyState[];
}

export interface NepalMarketSnapshot {
    timestamp: number;

    state: NepalMarketState;
}

export interface NepalCorrelationInput {
    globalMarketInfluence: number;
    currencyInfluence: number;
    bondInfluence: number;
    economicInfluence: number;
    newsInfluence: number;
}

export interface NepalMarketCorrelationInput {
    influence: NepalCorrelationInput;
}