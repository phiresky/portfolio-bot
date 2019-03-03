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
		}
		const out: HRes = await res.json()
		return out
	})
}
