import { randomBetween } from "@/app/(protected)/utils/random-initial";
import {
    SentimentState,
} from "./sentiment.types";


export const INITIAL_SENTIMENT_STATE:
    SentimentState = {
    fearGreed:
        randomBetween(
            -0.20,
            0.20
        ),

    volatility:
        randomBetween(
            0.18,
            0.35
        ),

    momentum:
        randomBetween(
            -0.15,
            0.15
        ),

    marketBreadth:
        randomBetween(
            -0.15,
            0.15
        ),

    safeHavenDemand:
        randomBetween(
            0.15,
            0.35
        ),

    creditRisk:
        randomBetween(
            0.10,
            0.30
        ),

    putCallSentiment:
        randomBetween(
            -0.15,
            0.15
        ),

    cotPositioning:
        randomBetween(
            -0.20,
            0.20
        ),
};