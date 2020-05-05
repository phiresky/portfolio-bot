export type Nominal<T extends string> = { _type: T } & T

export type ISIN = Nominal<"ISIN">
export type WKN = Nominal<"WKN">
export type TickerSymbol = Nominal<"TickerSymbol">
