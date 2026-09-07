export type EconomicRegion =
    | "USD"
    | "EUR"
    | "GBP"
    | "CAD"
    | "AUD"
    | "NZD"
    | "CHF"
    | "CNY"
    | "INR"
    | "JPY"
    | "NPR";

export interface EconomicIndicators {
    /*
     * Monetary policy
     */
    interestRate: number;

    /*
     * Prices
     */
    inflation: number;

    /*
     * Growth
     */
    gdpGrowth: number;

    /*
     * Labour market
     */
    employment: number;

    unemployment: number;

    /*
     * Business activity
     */
    pmi: number;

    /*
     * Consumption
     */
    retailSalesGrowth: number;

    /*
     * External sector
     */
    tradeBalance: number;

    /*
     * Consumer confidence
     */
    consumerConfidence: number;
}

export interface EconomyState
    extends EconomicIndicators {
    region: EconomicRegion;

    /*
     * Composite economic conditions.
     *
     * -1 = very weak
     *  0 = neutral
     * +1 = very strong
     */
    growthScore: number;

    inflationPressure: number;

    monetaryPolicyPressure: number;

    currencyFundamentalScore: number;

    marketFundamentalScore: number;
}

export interface EconomicState {
    /*
     * Global environment.
     *
     * These are broad global factors rather
     * than belonging to one currency.
     */
    global: {
        riskAppetite: number;

        globalGrowth: number;

        globalInflation: number;

        commodityDemand: number;

        globalLiquidity: number;
    };

    /*
     * Individual economies.
     */
    economies: Record<
        EconomicRegion,
        EconomyState
    >;
}

export type EconomicIndicator =
    | "interestRate"
    | "inflation"
    | "gdp"
    | "employment"
    | "unemployment"
    | "pmi"
    | "retailSales"
    | "tradeBalance"
    | "consumerConfidence";

export type EconomicFrequency =
    | "monthly"
    | "quarterly"
    | "event";

export interface EconomicIndicatorSchedule {
    region:
        | EconomicRegion
        | "GLOBAL";

    indicator: EconomicIndicator;

    frequency: EconomicFrequency;

    lastUpdated:
        number | null;
}

export interface EconomicStateSnapshot {
    timestamp: number;

    state: EconomicState;

    schedules:
        EconomicIndicatorSchedule[];
}