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
	while (!(result.data[0] as string[]).includes("Bestand")) {
		result.data.shift()
	}
	const [h, ...data] = result.data
	const get = (z: any[], header: string) => z[h.indexOf(header)]
	const investments: Investment[] = data
		.filter(inp => get(inp, "ISIN"))
		.map(inp => {
			const isin = get(inp, "ISIN")

			const bp = parseGermanNumber(get(inp, "Kaufkurs"))
			const bpc = get(inp, "Kaufkurs Currency")
			const amount = parseGermanNumber(get(inp, "Bestand"))

			if (get(inp, "Kaufwert")) {
				const bv = parseGermanNumber(get(inp, "Kaufwert"))
				const bvc = get(inp, "Kaufwert Currency")

				if (bvc !== bpc) throw Error("imposs")
				const bv2 = bp * amount

				if (Math.abs(1 - bv / bv2) > 1e-6) {
					console.log(bv, bv2)
					throw Error(`integrity of ${isin}`)
				}
			}

			return {
				isin,
				amount,
				buyPrice: {
					value: bp,
					currency: bpc,
				},
			}
		})
	return investments
}
