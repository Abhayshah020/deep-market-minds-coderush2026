export interface BondState {
    us2yYield: number;
    us10yYield: number;
    yieldSpread: number;
}

export interface BondStateSnapshot {
    timestamp: number;
    state: BondState;
}