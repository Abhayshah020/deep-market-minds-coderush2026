/**
 * Random number between min and max.
 */
export function randomBetween(
    min: number,
    max: number
): number {
    return (
        min +
        Math.random() *
            (max - min)
    );
}

/**
 * Random integer between min and max.
 */
export function randomInteger(
    min: number,
    max: number
): number {
    return Math.round(
        randomBetween(
            min,
            max
        )
    );
}

/**
 * Random percentage movement around
 * a base value.
 *
 * Example:
 *
 * randomAround(100, 0.05)
 *
 * -> 95 to 105
 */
export function randomAround(
    value: number,
    percentage: number
): number {
    const variation =
        value *
        percentage;

    return randomBetween(
        value - variation,
        value + variation
    );
}

/**
 * Random OHLC around a base value.
 *
 * Ensures:
 *
 * high >= max(open, close)
 * low  <= min(open, close)
 */
export function randomOHLC(
    value: number,
    volatility = 0.01
) {
    const open =
        randomAround(
            value,
            volatility
        );

    const close =
        randomAround(
            value,
            volatility
        );

    const upperWick =
        randomBetween(
            0,
            volatility
        );

    const lowerWick =
        randomBetween(
            0,
            volatility
        );

    const high =
        Math.max(
            open,
            close
        ) *
        (1 + upperWick);

    const low =
        Math.max(
            0.000001,
            Math.min(
                open,
                close
            ) *
                (1 -
                    lowerWick)
        );

    return {
        open,
        high,
        low,
        close,
    };
}