import { JSDOM } from "jsdom"
import fetch from "node-fetch"
import { diskCached } from "./cache"
import { ISIN } from "./nominal"
import { HRes, RLTRes } from "./types"

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

export async function getHistory(isin: ISIN, length: null | number = 100) {
	const date = new Date().toISOString().substr(0, 10)
	return diskCached(`onvista-history:${isin}:${date}`, async () => {
		const ovid = await getOnvistaId(isin)
		console.log(isin, "=>", ovid)
		if (!ovid) throw Error("no onvista id")
		const body = new URLSearchParams()
		let start = "#*#"
		if (length !== null) {
			const fromdate = new Date()
			fromdate.setDate(fromdate.getDate() - length)
			start = fromdate.toLocaleDateString("de-DE")
			console.log("from", start)
		}
		body.append("datetimeTzStartRange", start)
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
