import Telegraf from "telegraf"
import { format as timeago } from "timeago.js"
import { getHistory, getRealtimeQuote } from "./get-price-history"
import { compare } from "./load"
import { getInfo } from "./map-ids"
import { getInvestments } from "./parse-csv"
import { Investment, MoneyAmount, moneyToString } from "./util"

const token = process.env.BOT_TOKEN
const adminId = process.env.BOT_ADMIN

const ignoreSmallerThan = 15000

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
async function makeBot() {
	if (!token) throw Error(`supply bot token as env BOT_TOKEN`)
	const bot = new Telegraf(token)

	bot.use((ctx, next) => {
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
				const current = { value: rlt.bid, currency: "EUR" }
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
		ctx.replyWithHTML(
			await makeComparison(investments, timeString, async investment => {
				const history = await getHistory(investment.isin)
				const rlt = await getRealtimeQuote(investment.isin)
				const current = { value: rlt.bid, currency: "EUR" }
				return {
					last: { value: history[0].last, currency: "EUR" },
					current,
				}
			}),
		)
	})
	bot.command("before", async ctx => {
		const timeString = `Between the market close two days ago and yesterday`
		ctx.replyWithHTML(
			await makeComparison(investments, timeString, async investment => {
				const history = await getHistory(investment.isin)
				const current = { value: history[0].last, currency: "EUR" }
				return {
					last: { value: history[1].last, currency: "EUR" },
					current,
				}
			}),
		)
	})
	bot.command("sinceStart", async ctx => {
		const timeString = `Since the beginning`
		ctx.replyWithHTML(
			await makeComparison(investments, timeString, async investment => {
				const rlt = await getRealtimeQuote(investment.isin)
				const current = { value: rlt.bid, currency: "EUR" }
				return {
					last: investment.buyPrice,
					current,
				}
			}),
		)
	})
	;(bot as any).launch()
}

makeBot()