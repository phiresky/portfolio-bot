export type Nominal<T extends string> = "nominal" & T

export type ISIN = Nominal<"ISIN">
export type WKN = Nominal<"WKN">
export type TickerSymbol = Nominal<"TickerSymbol">
