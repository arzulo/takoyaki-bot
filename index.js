// Require the necessary discord.js classes
const { Client, Intents} = require('discord.js');
// Import events
const RoleManager = require("./src/role_assigner.js");
// Importat local configuration parameters
require('dotenv').config();

// Create a new client instance
client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

// client.on('messageReactionAdd', async message => {
// 	RoleManager.roleAssigner(message)
// });

// When the client is ready, run this code (only once)
client.once('ready', () => {

	RoleManager.roleManagerInit();
	console.log('Ready!');
});

client.on("messageCreate", msg => {
	let str = msg.content;
	switch(str) {
		case "!ping":
			msg.channel.send("Pong!");
			break;
	}
});

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);