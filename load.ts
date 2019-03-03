import { getHistory } from "./get-price-history"
import { getInfo } from "./map-ids"
import { getInvestments } from "./parse-csv"
import { MoneyAmount, moneyToString } from "./util"

function compare(pa: MoneyAmount, pb: MoneyAmount, count: number) {
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
		const currentPrice = { value: history[0].last, currency: "EUR" }
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
			"since yesterday",
			compare(
				{ value: history[1].last, currency: "EUR" },
				currentPrice,
				investment.amount,
			),
		)
		// console.log(history[1].datetimeLast.UTCTimeStamp, history[1].last)
		// console.log(history[0].datetimeLast.UTCTimeStamp, history[0].last)
	}
}
go()
