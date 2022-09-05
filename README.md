# takoyaki-bot
Bot for a private discord server.

This repo can also be used as a starting template for any Discord.js based bot. 
The setup guide below is intended to be ran on an Debian based system (Ubuntu 20.04 was used for me).

<h1>How To Setup</h1>
<h2>Clone the repo</h2>

```bash
git clone https://github.com/arzulo/takoyaki-bot.git
```
<br>
<h2>Install the latest version of Node.js and npm</h2>

Node.js is the backend technology we'll be using to run the bot and npm is a JS package manager.

```bash
# Using Ubuntu
curl -fsSL https://deb.nodesource.com/setup_17.x | sudo -E bash -
sudo apt-get install -y nodejs
```
<br>
<h2>Install node dependencies</h2>

```bash
npm install
```
<br>
<h2>Establish `.env` environment information at root directory</h2>

A file named `.env` needs to be created at the root directory of this checkout.  This contains sensitive local environment information that is to NOT be committed into the repo (removed in the included `.gitignore`).

The following fields need to be addded into the `.env` file
```js
BOT_TOKEN=<BOT TOKEN HERE>
ROLE_MANAGER_CHANNEL_ID=<ID OF CHANNEL TO CHECK ROLE MANAGEMENT>
MUSIC_CHANNEL_IDS=<String of channel IDs separated by spaced>
ARTIST_ROLE_ID=<ID OF ARTIST ROLE>
SOUND_ROLE_ID=<ID OF SOUND ROLE>
PROGRAMMER_ROLE_ID=<ID OF PROGRAMMER ROLE>
TESTER_ROLE_ID=<ID OF TESTER ROLE>
TWITCH_ROLE_ID=<ID OF TWITCH NOTIF ROLE>
```

If `ROLE_MANAGER_CHANNEL_ID` is left blank or absent, the role manager will be not be initialized.
If `MUSIC_CHANNEL_IDS` is populated by a spaced separated list of strings (Ex: `MUSIC_CHANNEL_IDS="123451 423556 234234"`) then the bot will only accept music links posted in those channel ids.  If absent or empty, it will work globally.

Your discord bot token can be found under the Bot settings in your [Discord applications page](https://discord.com/developers/applications)

1. Select Application
2. Bot (under settings)
	1. Create a new bot if not already established
3. Reset Token (make sure you save it to your password manager!)

<br>
<h1>Running your bot</h1>

To run the bot, simply run this from the root directory.

```bash
node index.js
```

***Happy botting!***
