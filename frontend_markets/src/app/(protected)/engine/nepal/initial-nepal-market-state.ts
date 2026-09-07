import { randomAround, randomBetween, randomOHLC } from "@/app/(protected)/utils/random-initial";
import {
    NepalMarketState,
} from "./nepal-engine.types";


function createNepalOHLC(
    value: number,
    volatility = 0.02
) {
    return randomOHLC(
        randomAround(
            value,
            0.04
        ),
        volatility
    );
}

export const INITIAL_NEPAL_MARKET_STATE:
    NepalMarketState = {
    nepseIndex:
        createNepalOHLC(
            2600,
            0.012
        ).close,

    nepseOHLC:
        createNepalOHLC(
            2600,
            0.012
        ),

    remittance: {
        monthlyInflow:
            randomAround(
                190_000_000_000,
                0.05
            ),

        annualInflow:
            randomAround(
                2_280_000_000_000,
                0.05
            ),

        growthRate:
            randomAround(
                8,
                0.15
            ),
    },

    economy: {
        liquidity: {
            bankingLiquidity:
                randomAround(
                    100,
                    0.05
                ),

            creditGrowth:
                randomAround(
                    6,
                    0.10
                ),

            liquidityPressure:
                randomBetween(
                    -0.15,
                    0.15
                ),
        },

        inflation:
            randomAround(
                5,
                0.08
            ),

        economicActivity:
            randomAround(
                100,
                0.04
            ),

        consumerDemand:
            randomAround(
                100,
                0.05
            ),
    },

    companies: [
        {
            id: "NABIL",
            name: "Nabil Bank",
            sector: "Banking",

            value:
                createNepalOHLC(
                    520
                ).close,

            revenue:
                randomAround(
                    18_000_000_000,
                    0.05
                ),

            earnings:
                randomAround(
                    6_000_000_000,
                    0.08
                ),

            supply:
                randomAround(
                    100,
                    0.08
                ),

            demand:
                randomAround(
                    100,
                    0.08
                ),

            ohlc:
                createNepalOHLC(
                    520
                ),
        },

        {
            id: "NLIC",
            name:
                "Nepal Life Insurance",
            sector: "Insurance",

            value:
                createNepalOHLC(
                    720
                ).close,

            revenue:
                randomAround(
                    15_000_000_000,
                    0.05
                ),

            earnings:
                randomAround(
                    2_500_000_000,
                    0.08
                ),

            supply:
                randomAround(
                    100,
                    0.08
                ),

            demand:
                randomAround(
                    100,
                    0.08
                ),

            ohlc:
                createNepalOHLC(
                    720
                ),
        },

        {
            id: "SHIVM",
            name:
                "Shivam Cement",
            sector:
                "Manufacturing",

            value:
                createNepalOHLC(
                    560
                ).close,

            revenue:
                randomAround(
                    12_000_000_000,
                    0.05
                ),

            earnings:
                randomAround(
                    1_500_000_000,
                    0.08
                ),

            supply:
                randomAround(
                    100,
                    0.08
                ),

            demand:
                randomAround(
                    100,
                    0.08
                ),

            ohlc:
                createNepalOHLC(
                    560
                ),
        },

        {
            id: "F1",
            name: "F1 Soft",
            sector: "Software",

            value:
                createNepalOHLC(
                    460
                ).close,

            revenue:
                randomAround(
                    5_000_000_000,
                    0.05
                ),

            earnings:
                randomAround(
                    1_100_000_000,
                    0.08
                ),

            supply:
                randomAround(
                    110,
                    0.08
                ),

            demand:
                randomAround(
                    90,
                    0.08
                ),

            ohlc:
                createNepalOHLC(
                    460
                ),
        },
    ],
};