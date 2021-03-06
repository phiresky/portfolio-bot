import Telegraf, { ContextMessageUpdate } from "telegraf"
import { format as timeago } from "timeago.js"
import { getHistory, getRealtimeQuote } from "./get-price-history"
import { compare, hresToPrice, rltToPrice } from "./load"
import { getInfo } from "./map-ids"
import { getInvestments } from "./parse-csv"
import { HistoryEntry } from "./types"
import { Investment, MoneyAmount, moneyToString } from "./util"

const token = process.env.BOT_TOKEN
let adminId = process.env.BOT_ADMIN
if (!adminId) {
	console.warn(
		"warning: env.BOT_ADMIN not set --- admin will be set to the first user that messages the bot",
	)
}

const ignoreSmallerThan = +(process.env.ignoreSmallerThan || 0)

function iso8601(date: Date) {
	return date.toJSON().substr(0, 10)
}

function historyFind(h: HistoryEntry[], date: Date): HistoryEntry {
	const searchTime = date.getTime() / 1000
	const o = h.reduce((a, b) =>
		Math.abs(a.datetimeLast.UTCTimeStamp - searchTime) <
		Math.abs(b.datetimeLast.UTCTimeStamp - searchTime)
			? a
			: b,
	)
	if (!o) throw Error("h empty")
	return o
}

async function makeComparison(
	investments: Investment[],
	timeString: string,
	getPrice: (
		investment: Investment,
	) => Promise<{ last: MoneyAmount; current: MoneyAmount }>,
) {
	let totalBefore = 0
	let totalAfter = 0
	let resp = ""
	for (const investment of investments) {
		const { amount } = investment
		const { last, current } = await getPrice(investment)

		totalBefore += amount * last.value
		totalAfter += amount * current.value

		resp += `${compare(last, current, amount)} ${
			(await getInfo(investment.isin)).name
		}\n`
	}

	resp += `<i>${compare(
		{ value: totalBefore, currency: "EUR" },
		{ value: totalAfter, currency: "EUR" },
		1,
	)} Total</i>`

	return `${timeString}, you have <b>${
		totalAfter >= totalBefore ? "made" : "lost"
	} ${moneyToString(
		{ value: Math.abs(totalAfter - totalBefore), currency: "EUR" },
		2,
		false,
	)}</b>.\n\n${resp}`
}

async function between(
	ctx: ContextMessageUpdate,
	investments: Investment[],
	fromN: number,
	toN: number,
	overrideTimeString?: string,
) {
	const ago = (days: number) => {
		const d = new Date()
		d.setDate(d.getDate() - days)
		return d
	}
	const fromD = ago(fromN)
	const toD = ago(toN)
	const doRealtime = toN === 0
	const timeString =
		overrideTimeString ||
		`Between ${iso8601(fromD)} and ${doRealtime ? "now" : iso8601(toD)}`

	ctx.replyWithHTML(
		await makeComparison(investments, timeString, async investment => {
			const history = await getHistory(investment.isin, 5 * 365)
			const laste = historyFind(history, fromD)
			console.log(
				iso8601(fromD),
				"nearest:",
				laste.datetimeLast.localTime,
			)
			const current = doRealtime
				? rltToPrice(await getRealtimeQuote(investment.isin))
				: hresToPrice(historyFind(history, toD))
			return {
				last: hresToPrice(laste),
				current,
			}
		}),
	)
}

async function makeBot() {
	if (!token) throw Error(`supply bot token as env BOT_TOKEN`)
	const bot = new Telegraf(token)

	bot.on("message", (ctx, next) => {
		if (!adminId && ctx.from) {
			adminId = String(ctx.from.id)
			console.warn(`BOT_ADMIN set to ${adminId}`)
		}
		console.log("msg", ctx.message && ctx.message.text, ctx.from)
		if (next && ctx.from && String(ctx.from.id) === adminId)
			(next as any)(ctx)
		else {
			console.log(
				"msg from unknown user",
				ctx.message && ctx.message.text,
				ctx.from,
			)
		}
	})

	const investments = (await getInvestments())
		.sort(
			(a, b) => b.amount * b.buyPrice.value - a.amount * a.buyPrice.value,
		)
		.filter(v => v.amount * v.buyPrice.value > ignoreSmallerThan)

	const last = new Map(
		investments.map(i => [
			i.isin,
			{
				date: new Date(0),
				price: i.buyPrice,
			},
		]),
	)

	bot.command("sinceLast", async ctx => {
		const timeString = `Since the last check ${timeago(
			last.get(investments[0].isin)!.date,
		)}`
		ctx.replyWithHTML(
			await makeComparison(investments, timeString, async investment => {
				//  const history = await getHistory(isin)
				const rlt = await getRealtimeQuote(investment.isin)
				const current = rltToPrice(rlt)
				const o = last.get(investment.isin)
				if (!o) throw Error(`could not find ${investment.isin}`)
				const lastPrice = o.price
				o.date = new Date(rlt.datetimeBid.UTCTimeStamp * 1000)
				o.price = current

				return {
					last: lastPrice,
					current,
				}
			}),
		)
	})
	bot.command("sinceYesterday", async ctx => {
		const timeString = `Since the market close yesterday`
		await between(ctx, investments, 1, 0, timeString)
	})
	bot.command("before", async ctx => {
		const timeString = `Between the market close two days ago and yesterday`
		await between(ctx, investments, 2, 1, timeString)
	})

	bot.command("between", async ctx => {
		const [_, from, to = "0"] = ctx.message!.text!.split(/\s+/g)
		const fromN = +from
		const toN = +to
		await between(ctx, investments, fromN, toN)
	})
	bot.command("sinceStart", async ctx => {
		const timeString = `Since the beginning`
		ctx.replyWithHTML(
			await makeComparison(investments, timeString, async investment => {
				const rlt = await getRealtimeQuote(investment.isin)
				const current = rltToPrice(rlt)
				return {
					last: investment.buyPrice,
					current,
				}
			}),
		)
	})
	bot.on("message", ctx => {
		ctx.replyWithHTML(`
<b>Available commands:</b>

/between &lt;A&gt; &lt;B&gt; show difference between closing time A days ago to B days ago.  0 days ago means the current live price instead of closing price
/sinceYesterday = /between 1 0
/before = /between 2 1
/sinceLast - show difference since last /sinceLast request
/sinceStart - show difference compared to your original buy price
		`)
	})
	;(bot as any).launch()
}

makeBot()
