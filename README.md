# takoyaki-bot
Bot for a private discord server.

This repo can also be used as a starting template for any Discord.js based bot. 

<h1>How To Setup</h1>
<h2>Clone the repo</h2>

```
git clone https://github.com/arzulo/takoyaki-bot.git
```

<h2>Install node dependencies</h2>

```
npm install
```

<h2>Establish `.env` at root directory</h2>

A file named `.env` needs to be created at the root directory of this checkout.  This contains sensitive local environment information that is to NOT be committed into the repo (removed in the included `.gitignore`).

The following fields need to be addded into the `.env` file
```
BOT_TOKEN=<BOT TOKEN HERE>
```

Your discord bot token can be found under the Bot settings in your [Discord applications page] (https://discord.com/developers/applications)

1. Select Application
2. Bot (under settings)
	1. Create a new bot if not already established
3. Reset Token (make sure you save it to your password manager!)