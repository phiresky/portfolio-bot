// just to improve inference

export type HRes = {
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
export type HistoryEntry = HRes[0]

export type RLTRes = {
	first: 194.514
	datetimeFirst: {
		localTime: "06:14:15 05.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551766455
	}
	price: 195.701
	datetimePrice: {
		localTime: "15:26:19 05.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551799579
	}
	volume: null
	addendum: null
	money: null
	high: 196.161
	datetimeHigh: {
		localTime: "10:07:04 05.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551780424
	}
	low: 194.498
	datetimeLow: {
		localTime: "06:17:51 05.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551766671
	}
	totalVolume: null
	totalMoney: null
	numberPrices: 5510
	previousLast: 194.795
	datetimePreviousLast: {
		localTime: "20:59:58 04.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551733198
	}
	idTypePriceTotals: null
	performance: 0.906
	performancePct: 0.4651
	ask: 195.819
	datetimeAsk: {
		localTime: "15:26:19 05.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551799579
	}
	volumeAsk: 255
	moneyAsk: null
	numberOrdersAsk: null
	bid: 195.701
	datetimeBid: {
		localTime: "15:26:19 05.03.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1551799579
	}
	volumeBid: 255
	moneyBid: null
	numberOrdersBid: null
	volume4Weeks: 22
	highPrice1Year: 204.901
	datetimeHighPrice1Year: {
		localTime: "12:00:00 22.05.2018"
		localTimeZone: "GMT"
		UTCTimeStamp: 1526990400
	}
	lowPrice1Year: 168.851
	datetimeLowPrice1Year: {
		localTime: "12:00:00 02.01.2019"
		localTimeZone: "GMT"
		UTCTimeStamp: 1546430400
	}
	performance1Year: 11.108
	performance1YearPct: 6.0176
	idNotation: 119686646
	idTimezone: 1
	idExchange: 18
	codeExchange: "@DE"
	idContributor: 196
	codeContributor: "LUSG"
	idCurrency: 63
	isoCurrency: "EUR"
	idTradingSchedule: 250
	idQualityPrice: 1
	codeQualityPrice: "RLT"
	idSalesProduct: 13005
	idQualityPriceBidAsk: 1
	codeQualityPriceBidAsk: "RLT"
	idSalesProductBidAsk: 13005
	idInstrument: 74890220
	idTypeInstrument: 7
	codeTool: "FUN"
	idUnitPrice: 1
	amount: 1
	sourcePrice: null
	sourceAsk: null
	sourceBid: null
	propertyFlagsPrice: 0
	propertyFlagsAsk: 0
	propertyFlagsBid: 0
}

export type SearchBoxJson = {
	onvista: {
		addata: {
			iscurrency: false
			searchvalue: "FDAXC1"
			name: "DAX FUTURE (FDAX) - EUX/C1"
			nsin: null
			searchlink: "/zertifikate/suche/vergleich.html?SEARCH_VALUE=FDAXC1&ID_GROUP_ISSUER=53882&CAT_ID=15&STEP=2"
			mobile: true
			isapp: false
			mobiletrackingid: "20034035"
			mobilederivativetype: "KnockoutCertificate"
			mobilederivativetypename: "Knock-Outs"
			trackingid: "8389542"
			derivativetype: "KnockoutCertificate"
			derivativetypename: "Knock-Outs"
			issuerid: 53882
		}
		results: {
			asset: [
				{
					name: "SPDR MSCI ACWI UCITS ETF - USD ACC"
					assetname: "SPDR MSCI ACWI UCITS ETF - USD ACC"
					shortname: "SPDR MSCI ACWI UCITS ETF - USD ACC"
					snapshotlink: "https://www.onvista.de/fonds/SPDR-MSCI-ACWI-UCITS-ETF-USD-ACC-Fonds-IE00B44Z5B48"
					type: "Fonds"
					subtype: null
					assettype: "Fund"
					nsin: "A1JJTC"
					isin: "IE00B44Z5B48"
					notationid: 48810243
					id: "40903376"
					symbol: "SPYY"
				},
			]
			supplierNews: [
				{
					headline: "Tesla \u00fcberrascht mit Quartalsgewinn \u2013 Apple erwartet sinkende iPhone-Ums\u00e4tze"
					url: "https://www.onvista.de/news/tesla-ueberrascht-mit-quartalsgewinn-apple-erwartet-sinkende-iphone-umsaetze-356062671"
					timestamp: 1588671600
					supplier: "HSBC"
					source: "HSBC"
					id: 356062671
				},
			]
		}
	}
}
