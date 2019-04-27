## Setup

```
yarn # install dependencies
```

Create a file called depot.csv with the following contents:

```
Bestand;ISIN;Kaufkurs;Kaufkurs Currency
123;IE00B3YLTY66;100,00;EUR
```

Then ask [BotFather](https://t.me/botfather) for a bot token and start the bot with

```
export BOT_TOKEN=123:AbcE34n
yarn bot
```

##

<b>Available commands:</b>

-   /between &lt;A&gt; &lt;B&gt; show difference between closing time A days ago to B days ago
-   /sinceYesterday = /between 1 0
-   /before = /between 2 1
-   /sinceLast - show difference since last /sinceLast request
-   /sinceStart - show difference compared to your original buy price
