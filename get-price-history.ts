import { JSDOM } from "jsdom"
import fetch from "node-fetch"
import { diskCached } from "./cache"
import { ISIN } from "./nominal"
import { HRes, RLTRes } from "./types"

async function idFromHtml(isin: string) {
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
	if (ele) return ele.getAttribute("data-notation")
	const ele2 = dom.window.document.querySelector(
		`.WEBSEITE .KURSDATEN [typeof="schema:Offer"]`,
	)
	if (ele2) {
		const attr = ele2.getAttribute("data-push")
		const id = /^(\d+):.*$/.exec(attr || "")?.[1]
		if (id) return id
	}

	throw Error(`could not find qoute element`)
}

async function getOnvistaId(isin: ISIN) {
	return diskCached(`onvista-id:${isin}`, async () => {
		// api returns different id which has different currency
		// eg IE00B44Z5B48 returns 48810243 which returns USD prices, but html uses id 56136190 which returns EUR prices
		/*
		const found = await fetch(
			`https://www.onvista.de/onvista/boxes/assetSearch.json?doSubmit=Suchen&portfolioName=&searchValue=${isin}`,
		)
		if (!found.ok) {
			console.error(found.status, found.statusText, await found.text())
			throw Error("getOnvistaId")
		}
		const ressi: SearchBoxJson = await found.json()
		const iiiid = ressi.onvista.results.asset[0].notationid
		if (iiiid) {
			return String(iiiid)
		}

		console.warn("could not get notationid from json, fallback to html")
		*/
		return idFromHtml(isin)
	})
}

export async function getHistoryRaw(
	isin: ISIN,
	fromDate: Date | null,
	timespan: string,
) {
	const ovid = await getOnvistaId(isin)
	console.log(isin, "=>", ovid)
	if (!ovid) throw Error("no onvista id")
	const body = new URLSearchParams()
	let start = "#*#"
	if (fromDate !== null) {
		start = fromDate.toLocaleDateString("de-DE", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		})
		console.log("from", start, "span", timespan)
	}
	body.append("datetimeTzStartRange", start)
	body.append("timeSpan", timespan)
	body.append("codeResolution", "1D")
	body.append("idNotation", ovid)
	const res = await fetch("https://www.onvista.de/etf/ajax/snapshotHistory", {
		method: "POST",
		body,
	})
	if (!res.ok) {
		console.error(res.status, res.statusText, await res.text())
		throw Error()
	}
	const out: HRes = await res.json()
	return out
}

export async function getHistory(isin: ISIN, length: null | number = 100) {
	const date = new Date().toISOString().substr(0, 10)
	return diskCached(`onvista-history-v2:${isin}:${length}:${date}`, () => {
		let fromDate = null
		if (length !== null) {
			fromDate = new Date()
			fromDate.setDate(fromDate.getDate() - length)
		}
		return getHistoryRaw(isin, fromDate, "5Y")
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
