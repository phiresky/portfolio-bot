import { promises as fs } from "fs"
import { debounce } from "lodash"

const cache: { [name: string]: unknown } = {}

const fname = ".cache.json"
const toDisk = debounce(
	async () => {
		console.log("writing cache")
		await fs.writeFile(fname, JSON.stringify(cache, null, "\t"))
	},
	1000,
	{
		maxWait: 2000,
	},
)

let inited = false
async function init() {
	if (inited) return
	try {
		Object.assign(cache, JSON.parse(await fs.readFile(fname, "utf8")))
	} catch (e) {
		if (e.code !== "ENOENT") throw e
	}
	inited = true
}

export async function diskCached<T>(
	key: string,
	getter: () => Promise<T>,
): Promise<T> {
	if (!inited) await init()
	if (!(key in cache)) {
		cache[key] = await getter()
		toDisk()
	}
	return cache[key] as T
}
