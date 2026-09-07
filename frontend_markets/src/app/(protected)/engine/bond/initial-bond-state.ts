import { randomBetween } from "@/app/(protected)/utils/random-initial";
import {
    BondState,
} from "./bond-engine.types";



const us2yYield =
    randomBetween(
        3.50,
        4.75
    );

const us10yYield =
    randomBetween(
        4.00,
        5.25
    );

export const INITIAL_BOND_STATE:
    BondState = {
    us2yYield,

    us10yYield,

    yieldSpread:
        us2yYield -
        us10yYield,
};