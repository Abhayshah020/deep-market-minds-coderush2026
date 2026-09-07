import {
    NewsEvent,
} from "./news-event.types";

export const DEMO_NEWS_EVENTS: Omit<
    NewsEvent,
    "id" | "timestamp"
>[] = [
    /*
     * DAILY
     */

    {
        type: "economicNews",

        frequency: "daily",

        title:
            "Consumer Confidence Shows Moderate Change",

        description:
            "Household confidence changes slightly as consumers react to current economic conditions.",

        economicEffect: 0.2,

        severity: "low",
    },

    {
        type: "economicNews",

        frequency: "daily",

        title:
            "Markets React to New Economic Information",

        description:
            "New information creates a modest change in economic sentiment.",

        economicEffect: -0.2,

        severity: "low",
    },

    /*
     * WEEKLY
     */

    {
        type: "economicReport",

        frequency: "weekly",

        title:
            "Weekly Economic Activity Shows Strength",

        description:
            "Recent economic activity indicates moderate improvement.",

        economicEffect: 0.4,

        severity: "medium",
    },

    {
        type: "economicReport",

        frequency: "weekly",

        title:
            "Weekly Economic Activity Weakens",

        description:
            "Recent economic activity indicates a moderate slowdown.",

        economicEffect: -0.4,

        severity: "medium",
    },

    /*
     * MONTHLY
     */

    {
        type: "economicReport",

        frequency: "monthly",

        title:
            "Inflation Report Beats Expectations",

        description:
            "Monthly inflation data shows stronger-than-expected price stability.",

        economicEffect: 0.6,

        severity: "high",
    },

    {
        type: "economicReport",

        frequency: "monthly",

        title:
            "Inflation Rises Unexpectedly",

        description:
            "Monthly inflation data comes in above expectations.",

        economicEffect: -0.6,

        severity: "high",
    },

    {
        type: "economicReport",

        frequency: "monthly",

        title:
            "Employment Report Shows Strong Job Creation",

        description:
            "Employment data shows stronger-than-expected job creation.",

        economicEffect: 0.7,

        severity: "high",
    },

    /*
     * QUARTERLY
     */

    {
        type: "economicReport",

        frequency: "quarterly",

        title:
            "GDP Growth Beats Expectations",

        description:
            "Quarterly economic growth comes in stronger than expected.",

        economicEffect: 0.8,

        severity: "high",
    },

    {
        type: "economicReport",

        frequency: "quarterly",

        title:
            "GDP Growth Contracts Unexpectedly",

        description:
            "Quarterly economic growth contracts more than expected.",

        economicEffect: -0.9,

        severity: "extreme",
    },

    /*
     * YEARLY
     */

    {
        type: "worldEvent",

        frequency: "yearly",

        title:
            "Major Global Economic Agreement",

        description:
            "Major economies announce a significant long-term economic agreement.",

        economicEffect: 0.8,

        severity: "high",
    },

    /*
     * GEOPOLITICAL
     *
     * These are modeled as weekly opportunities
     * for the demo. Later we can use probability
     * distributions instead.
     */

    {
        type: "geopolitical",

        frequency: "weekly",

        title:
            "Geopolitical Tensions Escalate",

        description:
            "Tensions between major countries increase significantly.",

        economicEffect: -0.7,

        severity: "high",
    },

    {
        type: "geopolitical",

        frequency: "weekly",

        title:
            "Major Ceasefire Announced",

        description:
            "Conflicting parties announce a major ceasefire agreement.",

        economicEffect: 0.8,

        severity: "high",
    },

    {
        type: "geopolitical",

        frequency: "yearly",

        title:
            "Major Military Conflict Escalates",

        description:
            "A major international conflict expands unexpectedly.",

        economicEffect: -1.0,

        severity: "extreme",
    },

    /*
     * CLIMATE
     */

    {
        type: "climate",

        frequency: "monthly",

        title:
            "Severe Weather Disrupts Production",

        description:
            "Extreme weather conditions disrupt infrastructure and production.",

        economicEffect: -0.7,

        severity: "high",
    },

    {
        type: "climate",

        frequency: "yearly",

        title:
            "Major Natural Disaster",

        description:
            "A major natural disaster causes widespread economic disruption.",

        economicEffect: -1.0,

        severity: "extreme",
    },

    /*
     * COMPANY
     */

    {
        type: "company",

        frequency: "monthly",

        title:
            "Major Company Reports Strong Earnings",

        description:
            "A major company reports significantly stronger-than-expected earnings.",

        economicEffect: 0.7,

        severity: "high",
    },

    {
        type: "company",

        frequency: "monthly",

        title:
            "Major Company Announces Large-Scale Layoffs",

        description:
            "A major company announces significant workforce reductions.",

        economicEffect: -0.6,

        severity: "high",
    },

    /*
     * CONTROLLED NOISE
     */

    {
        type: "noise",

        frequency: "daily",

        title:
            "Minor Market Rumor",

        description:
            "A small piece of uncertain information affects economic sentiment.",

        economicEffect: 0,

        severity: "low",
    },
];