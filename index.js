// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
// Importat local configuration parameters
require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);