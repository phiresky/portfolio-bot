import { getHistory, getRealtimeQuote } from "./get-price-history"
import { getInfo } from "./map-ids"
import { getInvestments } from "./parse-csv"
import { HistoryEntry, RLTRes } from "./types"
import { MoneyAmount, moneyToString } from "./util"

export function compare(pa: MoneyAmount, pb: MoneyAmount, count: number) {
	if (pa.currency !== pb.currency) throw Error("impossib")
	const rel = pb.value / pa.value - 1
	const abs = (pb.value - pa.value) * count
	return `${(rel * 100).toFixed(1)}%, ${moneyToString(
		{
			value: abs,
			currency: pa.currency,
		},
		0,
		true,
	)}`
}

export function rltToPrice(p: RLTRes): MoneyAmount {
	return {
		value: p.bid || p.price,
		currency: "EUR",
	}
}
export const hresToPrice = (h: HistoryEntry): MoneyAmount => ({
	value: h.last,
	currency: "EUR",
})

async function go() {
	const investments = await getInvestments()
	investments.sort(
		(a, b) => -(b.amount * b.buyPrice.value - a.amount * a.buyPrice.value),
	)
	for (const investment of investments) {
		console.log("---------")
		// console.log(investment)
		const info = await getInfo(investment.isin)
		const history = await getHistory(investment.isin)
		const rlt = await getRealtimeQuote(investment.isin)
		const lastClose = { value: history[0].last, currency: "EUR" }
		const lastCloseDate = new Date(
			history[0].datetimeLast.UTCTimeStamp * 1000,
		)
			.toISOString()
			.slice(0, 10)
		const currentPrice = rltToPrice(rlt)
		console.log(
			`${info.name} (ISIN ${investment.isin}): ${moneyToString(
				{
					value: investment.amount * currentPrice.value,
					currency: currentPrice.currency,
				},
				0,
				false,
			)}`,
		)
		console.log(
			"since start",
			compare(investment.buyPrice, currentPrice, investment.amount),
		)
		console.log(
			`since close on ${lastCloseDate}`,
			compare(lastClose, currentPrice, investment.amount),
		)
		// console.log(history[1].datetimeLast.UTCTimeStamp, history[1].last)
		// console.log(history[0].datetimeLast.UTCTimeStamp, history[0].last)
	}
}
if (require.main === module) {
	go()
}
