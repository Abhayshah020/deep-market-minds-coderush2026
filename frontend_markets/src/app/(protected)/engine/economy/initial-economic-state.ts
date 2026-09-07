import {
    EconomicRegion,
    EconomicState,
    EconomyState,
} from "./economic-engine.types";

import { randomAround, randomBetween, randomInteger } from "@/app/(protected)/utils/random-initial";

function createEconomy(
    region: EconomicRegion,
    values: Omit<
        EconomyState,
        | "region"
        | "growthScore"
        | "inflationPressure"
        | "monetaryPolicyPressure"
        | "currencyFundamentalScore"
        | "marketFundamentalScore"
    >
): EconomyState {
    return {
        region,

        ...values,

        growthScore: 0,

        inflationPressure: 0,

        monetaryPolicyPressure: 0,

        currencyFundamentalScore: 0,

        marketFundamentalScore: 0,
    };
}

function randomEconomy(
    region: EconomicRegion,
    values: Omit<
        EconomyState,
        | "region"
        | "growthScore"
        | "inflationPressure"
        | "monetaryPolicyPressure"
        | "currencyFundamentalScore"
        | "marketFundamentalScore"
    >
) {
    return createEconomy(
        region,
        {
            interestRate:
                randomAround(
                    values.interestRate,
                    0.05
                ),

            inflation:
                randomAround(
                    values.inflation,
                    0.06
                ),

            gdpGrowth:
                randomAround(
                    values.gdpGrowth,
                    0.12
                ),

            employment:
                randomInteger(
                    Math.round(
                        values.employment *
                        0.997
                    ),
                    Math.round(
                        values.employment *
                        1.003
                    )
                ),

            unemployment:
                randomAround(
                    values.unemployment,
                    0.06
                ),

            pmi:
                randomAround(
                    values.pmi,
                    0.025
                ),

            retailSalesGrowth:
                randomAround(
                    values.retailSalesGrowth,
                    0.20
                ),

            tradeBalance:
                randomAround(
                    values.tradeBalance,
                    0.08
                ),

            consumerConfidence:
                randomAround(
                    values.consumerConfidence,
                    0.04
                ),
        }
    );
}

export const INITIAL_ECONOMIC_STATE:
    EconomicState = {
    global: {
        riskAppetite:
            randomBetween(
                -0.10,
                0.10
            ),

        globalGrowth:
            randomAround(
                2.5,
                0.10
            ),

        globalInflation:
            randomAround(
                3.0,
                0.08
            ),

        commodityDemand:
            randomBetween(
                -0.20,
                0.20
            ),

        globalLiquidity:
            randomBetween(
                -0.15,
                0.15
            ),
    },

    economies: {
        USD:
            randomEconomy(
                "USD",
                {
                    interestRate: 4.50,
                    inflation: 3.0,
                    gdpGrowth: 2.2,
                    employment:
                        159_000_000,
                    unemployment: 4.2,
                    pmi: 51,
                    retailSalesGrowth: 0.3,
                    tradeBalance:
                        -80_000_000_000,
                    consumerConfidence:
                        98,
                }
            ),

        EUR:
            randomEconomy(
                "EUR",
                {
                    interestRate: 2.50,
                    inflation: 2.2,
                    gdpGrowth: 1.0,
                    employment:
                        155_000_000,
                    unemployment: 6.4,
                    pmi: 50,
                    retailSalesGrowth: 0.1,
                    tradeBalance:
                        15_000_000_000,
                    consumerConfidence:
                        95,
                }
            ),

        GBP:
            randomEconomy(
                "GBP",
                {
                    interestRate: 4.00,
                    inflation: 2.8,
                    gdpGrowth: 1.2,
                    employment:
                        34_000_000,
                    unemployment: 4.5,
                    pmi: 51,
                    retailSalesGrowth: 0.2,
                    tradeBalance:
                        -20_000_000_000,
                    consumerConfidence:
                        96,
                }
            ),

        CAD:
            randomEconomy(
                "CAD",
                {
                    interestRate: 3.00,
                    inflation: 2.4,
                    gdpGrowth: 1.5,
                    employment:
                        21_000_000,
                    unemployment: 6.0,
                    pmi: 50,
                    retailSalesGrowth: 0.2,
                    tradeBalance:
                        2_000_000_000,
                    consumerConfidence:
                        98,
                }
            ),

        AUD:
            randomEconomy(
                "AUD",
                {
                    interestRate: 3.60,
                    inflation: 2.7,
                    gdpGrowth: 1.7,
                    employment:
                        14_000_000,
                    unemployment: 4.1,
                    pmi: 51,
                    retailSalesGrowth: 0.3,
                    tradeBalance:
                        5_000_000_000,
                    consumerConfidence:
                        101,
                }
            ),

        NZD:
            randomEconomy(
                "NZD",
                {
                    interestRate: 3.25,
                    inflation: 2.5,
                    gdpGrowth: 1.4,
                    employment:
                        2_700_000,
                    unemployment: 5.0,
                    pmi: 50,
                    retailSalesGrowth: 0.2,
                    tradeBalance:
                        -1_000_000_000,
                    consumerConfidence:
                        99,
                }
            ),

        CHF:
            randomEconomy(
                "CHF",
                {
                    interestRate: 1.00,
                    inflation: 1.2,
                    gdpGrowth: 1.1,
                    employment:
                        5_500_000,
                    unemployment: 2.4,
                    pmi: 50,
                    retailSalesGrowth: 0.2,
                    tradeBalance:
                        3_000_000_000,
                    consumerConfidence:
                        100,
                }
            ),

        CNY:
            randomEconomy(
                "CNY",
                {
                    interestRate: 3.10,
                    inflation: 1.0,
                    gdpGrowth: 4.8,
                    employment:
                        735_000_000,
                    unemployment: 5.1,
                    pmi: 50,
                    retailSalesGrowth: 0.5,
                    tradeBalance:
                        90_000_000_000,
                    consumerConfidence:
                        100,
                }
            ),

        INR:
            randomEconomy(
                "INR",
                {
                    interestRate: 6.25,
                    inflation: 4.0,
                    gdpGrowth: 6.5,
                    employment:
                        600_000_000,
                    unemployment: 4.5,
                    pmi: 56,
                    retailSalesGrowth: 0.7,
                    tradeBalance:
                        -25_000_000_000,
                    consumerConfidence:
                        105,
                }
            ),

        JPY:
            randomEconomy(
                "JPY",
                {
                    interestRate: 0.50,
                    inflation: 2.5,
                    gdpGrowth: 0.8,
                    employment:
                        68_000_000,
                    unemployment: 2.5,
                    pmi: 50,
                    retailSalesGrowth: 0.1,
                    tradeBalance:
                        5_000_000_000,
                    consumerConfidence:
                        98,
                }
            ),

        NPR:
            randomEconomy(
                "NPR",
                {
                    interestRate: 5.50,
                    inflation: 5.0,
                    gdpGrowth: 4.0,
                    employment:
                        17_000_000,
                    unemployment: 10.0,
                    pmi: 51,
                    retailSalesGrowth: 0.4,
                    tradeBalance:
                        -1_500_000_000,
                    consumerConfidence:
                        97,
                }
            ),
    },
};