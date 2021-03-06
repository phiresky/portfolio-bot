import { ISIN } from "./nominal"

export interface MoneyAmount {
	value: number
	currency: string
}

function currencyToString(currency: string) {
	return ({ EUR: "€", USD: "$" } as any)[currency] || currency
}
export function moneyToString(
	x: MoneyAmount,
	round: number,
	explicitPlus: boolean,
) {
	const THINSPACE = "\u202f"
	const thousandSep = Math.abs(x.value) >= 10000 ? THINSPACE : ""
	const str = x.value
		.toLocaleString("en-US", {
			minimumFractionDigits: round,
			maximumFractionDigits: round,
		})
		.replace(/,/g, thousandSep)

	const o = `${str} ${currencyToString(x.currency)}`
	if (explicitPlus && x.value >= 0) return `+${o}`
	return o
}
export interface Investment {
	isin: ISIN
	// wkn: WKN
	amount: number
	buyPrice: MoneyAmount
}
