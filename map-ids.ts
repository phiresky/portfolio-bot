import fetch from "node-fetch"
import { diskCached } from "./cache"
import { ISIN, TickerSymbol } from "./nominal"

type MappingArg = {
	idType: "ID_ISIN"
	idValue: "DE000A0RPAM5"
	micCode?: string
}[]
type MappingResp = {
	data: [
		{
			figi: "BBG000D86NK8"
			name: "SPDR MSCI EUROPE"
			ticker: TickerSymbol
			exchCode: "GT"
			compositeFIGI: "BBG000D86FJ7"
			uniqueID: "EQ0000000000517174"
			securityType: "ETP"
			marketSector: "Equity"
			shareClassFIGI: "BBG001SB5845"
			uniqueIDFutOpt: null
			securityType2: "Mutual Fund"
			securityDescription: "SPYE"
		}
	]
}[]

export type Info = MappingResp[0]["data"][0]
export function getInfo(isin: ISIN): Promise<Info> {
	return diskCached(`ISIN:${isin}`, async () => {
		const url = "https://api.openfigi.com/v2/mapping"
		const arg = [
			{
				idType: "ID_ISIN",
				idValue: isin as string,
				micCode: "XETR",
			},
		] as MappingArg
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(arg),
		})
		if (!res.ok) {
			console.error(url, arg, res.status, res.statusText)
			console.error(await res.text())
			throw Error("invalid response")
		}
		const o: MappingResp = await res.json()
		if (o.length !== 1) throw Error(`got ${o.length} responses not 1`)
		const m = o[0]
		if (m.data.length !== 1)
			throw Error(`got 1.. ${m.data.length} responses not 1`)
		return m.data[0]
	})
}
