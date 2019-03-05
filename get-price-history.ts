import { JSDOM } from "jsdom"
import fetch from "node-fetch"
import { diskCached } from "./cache"
import { ISIN } from "./nominal"

async function getOnvistaId(isin: ISIN) {
	return diskCached(`onvista-id:${isin}`, async () => {
		const found = await fetch(
			`https://www.onvista.de/suche.html?SEARCH_VALUE=${isin}`,
		)
		if (!found.ok) {
			console.error(found.status, found.statusText, await found.text())
			throw Error("getOnvistaId")
		}
		const res = await found.text()
		const dom = new JSDOM(res)

		const ele = dom.window.document.querySelector(
			"div.push-quote.with-performance.with-datetime",
		)
		if (!ele) throw Error(`could not find qoute element`)
		return ele.getAttribute("data-notation")
	})
}

type HRes = {
	first: 195.14
	datetimeFirst: {
		localTime: "12:00:00 01.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551441600
	}
	last: 195.42
	datetimeLast: {
		localTime: "12:00:00 01.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551441600
	}
	high: 195.92
	datetimeHigh: {
		localTime: "12:00:00 01.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551441600
	}
	low: 195.1
	datetimeLow: {
		localTime: "12:00:00 01.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551441600
	}
	totalVolume: 0
	totalMoney: 0
	numberPrices: 6
	idTypePriceFirst: 130
	idTypePriceLast: 130
	idTypePriceHigh: 130
	idTypePriceLow: 130
	totalVolumeR2: 0
	totalMoneyR2: 0
}[]

type RLTRes = {
	first: 194.514
	datetimeFirst: {
		localTime: "06:14:15 05.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551766455
	}
	price: 195.701
	datetimePrice: {
		localTime: "15:26:19 05.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551799579
	}
	volume: null
	addendum: null
	money: null
	high: 196.161
	datetimeHigh: {
		localTime: "10:07:04 05.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551780424
	}
	low: 194.498
	datetimeLow: {
		localTime: "06:17:51 05.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551766671
	}
	totalVolume: null
	totalMoney: null
	numberPrices: 5510
	previousLast: 194.795
	datetimePreviousLast: {
		localTime: "20:59:58 04.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551733198
	}
	idTypePriceTotals: null
	performance: 0.906
	performancePct: 0.4651
	ask: 195.819
	datetimeAsk: {
		localTime: "15:26:19 05.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551799579
	}
	volumeAsk: 255
	moneyAsk: null
	numberOrdersAsk: null
	bid: 195.701
	datetimeBid: {
		localTime: "15:26:19 05.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551799579
	}
	volumeBid: 255
	moneyBid: null
	numberOrdersBid: null
	volume4Weeks: 22
	highPrice1Year: 204.901
	datetimeHighPrice1Year: {
		localTime: "12:00:00 22.05.2018"
		localTimeZone: "GMT"
		UTCTimeStamp: 1526990400
	}
	lowPrice1Year: 168.851
	datetimeLowPrice1Year: {
		localTime: "12:00:00 02.01.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1546430400
	}
	performance1Year: 11.108
	performance1YearPct: 6.0176
	idNotation: 119686646
	idTimezone: 1
	idExchange: 18
	codeExchange: "@DE"
	idContributor: 196
	codeContributor: "LUSG"
	idCurrency: 63
	isoCurrency: "EUR"
	idTradingSchedule: 250
	idQualityPrice: 1
	codeQualityPrice: "RLT"
	idSalesProduct: 13005
	idQualityPriceBidAsk: 1
	codeQualityPriceBidAsk: "RLT"
	idSalesProductBidAsk: 13005
	idInstrument: 74890220
	idTypeInstrument: 7
	codeTool: "FUN"
	idUnitPrice: 1
	amount: 1
	sourcePrice: null
	sourceAsk: null
	sourceBid: null
	propertyFlagsPrice: 0
	propertyFlagsAsk: 0
	propertyFlagsBid: 0
}
export async function getHistory(isin: ISIN) {
	const date = new Date().toISOString().substr(0, 10)
	return diskCached(`onvista-history:${isin}:${date}`, async () => {
		const ovid = await getOnvistaId(isin)
		console.log(isin, "=>", ovid)
		if (!ovid) throw Error("no onvista id")
		const body = new URLSearchParams()
		body.append("datetimeTzStartRange", "#*#")
		body.append("timeSpan", "1Y")
		body.append("codeResolution", "1D")
		body.append("idNotation", ovid)
		const res = await fetch(
			"https://www.onvista.de/etf/ajax/snapshotHistory",
			{
				method: "POST",
				body,
			},
		)
		if (!res.ok) {
			console.error(res.status, res.statusText, await res.text())
			throw Error()
		}
		const out: HRes = await res.json()
		return out
	})
}

export async function getRealtimeQuote(isin: ISIN) {
	const ovid = await getOnvistaId(isin)
	const res = await fetch(`https://www.onvista.de/api/quote/${ovid}/RLT`, {
		method: "POST",
	})
	if (!res.ok) {
		console.error(res.status, res.statusText, await res.text())
		throw Error()
	}
	const out: RLTRes = await res.json()
	// console.log(isin, out)
	return out
}
