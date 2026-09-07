import { randomAround, randomOHLC } from "@/app/(protected)/utils/random-initial";
import {
    MarketState,
    StockIndexCode,
    CommodityCode,
    CompanyState,
} from "./market-engine.types";

const createAsset = (
    code:
        | StockIndexCode
        | CommodityCode,
    name: string,
    value: number,
    volatility = 0.015
) => {
    const initialValue =
        randomAround(
            value,
            0.03
        );

    const ohlc =
        randomOHLC(
            initialValue,
            volatility
        );

    return {
        code,

        name,

        value:
            ohlc.close,

        ohlc,

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
    };
};

const createCompany = (
    id: string,
    name: string,
    value: number,
    revenue: number,
    earnings: number
): CompanyState => {
    const initialValue =
        randomAround(
            value,
            0.05
        );

    const ohlc =
        randomOHLC(
            initialValue,
            0.02
        );

    return {
        id,

        name,

        revenue:
            randomAround(
                revenue,
                0.05
            ),

        earnings:
            randomAround(
                earnings,
                0.08
            ),

        supply:
            randomAround(
                100,
                0.10
            ),

        demand:
            randomAround(
                100,
                0.10
            ),

        value:
            ohlc.close,

        ohlc,
    };
};

export const INITIAL_MARKET_STATE:
    MarketState = {
    indices: {
        SP500:
            createAsset(
                "SP500",
                "S&P 500",
                5000,
                0.010
            ),

        NASDAQ:
            createAsset(
                "NASDAQ",
                "NASDAQ Composite",
                16000,
                0.014
            ),

        DOW:
            createAsset(
                "DOW",
                "Dow Jones",
                39000,
                0.009
            ),

        FTSE100:
            createAsset(
                "FTSE100",
                "FTSE 100",
                8000,
                0.010
            ),

        DAX:
            createAsset(
                "DAX",
                "DAX",
                18000,
                0.012
            ),

        CAC40:
            createAsset(
                "CAC40",
                "CAC 40",
                7500,
                0.011
            ),

        NIKKEI225:
            createAsset(
                "NIKKEI225",
                "Nikkei 225",
                39000,
                0.013
            ),

        HANGSENG:
            createAsset(
                "HANGSENG",
                "Hang Seng",
                18000,
                0.018
            ),

        NIFTY50:
            createAsset(
                "NIFTY50",
                "NIFTY 50",
                22000,
                0.012
            ),

        ASX200:
            createAsset(
                "ASX200",
                "ASX 200",
                7800,
                0.011
            ),
    },

    commodities: {
        GOLD:
            createAsset(
                "GOLD",
                "Gold",
                2300,
                0.012
            ),

        OIL:
            createAsset(
                "OIL",
                "Crude Oil",
                80,
                0.025
            ),

        COPPER:
            createAsset(
                "COPPER",
                "Copper",
                4.2,
                0.020
            ),
    },

    companies: [
        createCompany(
            "company-001",
            "Apex Technologies",
            250,
            120_000_000_000,
            18_000_000_000
        ),

        createCompany(
            "company-002",
            "Global Energy Corp",
            150,
            95_000_000_000,
            11_000_000_000
        ),

        createCompany(
            "company-003",
            "Nova Consumer",
            100,
            60_000_000_000,
            7_000_000_000
        ),
    ],
};