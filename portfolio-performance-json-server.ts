/**
 * http server to supply data to portfolio-performance
 *
 * https://help.portfolio-performance.info/kursdaten_laden/#dynamische-kursdaten-urls
 *
 * configure as:
 *
 * Kurs URL: http://localhost:3000/historical-courses?curreny={CURRENCY}&month={DATE:yyyy-MM}&isin={ISIN}
 *
 * Path to Date: $[*].datetimeLast.UTCTimeStamp
 *
 * Path to Course: $[*].last
 */
import Router from "@koa/router"
import Koa from "koa"
import { getHistoryRaw } from "./get-price-history"
import { ISIN } from "./nominal"

const app = new Koa()

app.listen(3000)

const router = new Router()

router.get("/historical-courses", async (ctx) => {
	console.log(ctx.request.url)
	// console.log(ctx.request.query)
	const { isin, month, currency } = ctx.request.query
	const date = new Date(`${month}-01`)
	const history = await getHistoryRaw(isin as ISIN, date, "1M")
	ctx.response.body = history
})

app.use(router.routes())
