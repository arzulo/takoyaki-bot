// Require the necessary discord.js classes
const { Client, GuildMember, GatewayIntentBits} = require('discord.js');

// Class handlers required for the discord music player 
const { Player} = require("discord-player");


// Import events
const RoleManager = require("./src/role_assigner.js");

// Import music player events
const MusicPlayer = require("./src/music_player.js");

// Importat local configuration parameters
require('dotenv').config();

// Create a new client instance
// client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES] });
client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.MessageContent
] });
player = new Player(client);

// client.on('messageReactionAdd', async message => {
// 	RoleManager.roleAssigner(message)
// });

// When the client is ready, run this code (only once)
client.once('ready', () => {

	RoleManager.roleManagerInit();
	MusicPlayer.musicPlayerInit(GuildMember); // init music player
	console.log('Ready!');
});


// Simple logs
client.on("error", console.error);
client.on("warn", console.warn);


// Check messages
client.on("messageCreate", async msg => {

	// Exit if the message doesn't come from a person within the guild
	if (msg.author.bot || !msg.guild) return;
    	if (!client.application?.owner) await client.application?.fetch();

	// Check for music deployment
	MusicPlayer.musicPlayerDeploy(msg);

	let str = msg.content;
	switch(str) {
		case "!ping":
			msg.channel.send("Pong!");
			break;
	}
});

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);