import { promises as fs } from "fs"
import * as Papa from "papaparse"
import { Investment } from "./util"

function parseGermanNumber(number: string): number {
	return parseFloat(number.replace(/[.]/g, "").replace(/,/g, "."))
}

export async function getInvestments() {
	const result = Papa.parse(await fs.readFile("./depot.csv", "utf8"), {
		delimiter: ";",
	})
	do {
		result.data.shift()
	} while (result.data[0][0] !== "Bestand")
	const [h, ...data] = result.data
	const get = (z: any[], header: string) => z[h.indexOf(header)]
	const investments: Investment[] = data
		.filter(inp => get(inp, "ISIN"))
		.map(inp => {
			const isin = get(inp, "ISIN")
			const bv = parseGermanNumber(get(inp, "Kaufwert"))
			const bvc = get(inp, "Kaufwert Currency")
			const bp = parseGermanNumber(get(inp, "Kaufkurs"))
			const amount = parseGermanNumber(get(inp, "Bestand"))
			if (bvc !== get(inp, "Kaufkurs Currency")) throw Error("imposs")

			const bv2 = bp * amount

			if (Math.abs(1 - bv / bv2) > 1e-6) {
				console.log(bv, bv2)
				throw Error(`integrity of ${isin}`)
			}
			return {
				isin,
				amount,
				buyPrice: {
					value: bp,
					currency: bvc,
				},
			}
		})
	return investments
}
