
// Require classes
const { QueryType } = require("discord-player");

async function musicPlayerDeploy(message) {

	if (message.content === "!deploy" && message.author.id === client.application?.owner?.id) {
		await message.guild.commands.set([
		{
			name: "play",
			description: "Plays a song from youtube",
			options: [
			{
				name: "query",
				type: 3,
				description: "The song you want to play",
				required: true
			}
			]
		},
		{
			name: "skip",
			description: "Skip to the current song"
		},
		{
			name: "queue",
			description: "See the queue"
		},
		{
			name: "stop",
			description: "Stop the player"
		},
		]);

		await message.reply("Deployed!");
	}
	
}

function musicPlayerInit(GuildMember) {
	// Class handlers required for the discord music player 
	player.on("error", (queue, error) => {
	    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
	});
	player.on("connectionError", (queue, error) => {
	    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
	});
	player.on("trackStart", (queue, track) => {
	    queue.metadata.send(`🎶 | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`);
	});
	
	player.on("trackAdd", (queue, track) => {
	    queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
	});
	
	player.on("botDisconnect", (queue) => {
	    queue.metadata.send("❌ | I was manually disconnected from the voice channel, clearing queue!");
	});
	
	player.on("channelEmpty", (queue) => {
	    queue.metadata.send("❌ | Nobody is in the voice channel, leaving...");
	});
	
	player.on("queueEnd", (queue) => {
	    queue.metadata.send("✅ | Queue finished!");
	});


	// Setup interaction between the slash commands
	client.on("interactionCreate", async (interaction) => {
		if(process.env.MUSIC_CHANNEL_IDS && !process.env.MUSIC_CHANNEL_IDS.split(' ').includes(interaction.channelId)) {
			interaction.reply({
			    content: "Unauthorized",
			    ephemeral: true
			});
			return;
		}
		if (!interaction.isCommand() || !interaction.guildId) return;

		if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
		return void interaction.reply({ content: "You are not in a voice channel!", ephemeral: true });
		}

		// if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) {
		// if(interaction.member.voice.channelId){
		// return void interaction.reply({ content: "You are not in my voice channel!", ephemeral: true });
		// }

		// Playing interaction
		if (interaction.commandName === "play") {
			await interaction.deferReply();

			const query = interaction.options.get("query").value;
			const searchResult = await player
				.search(query, {
				requestedBy: interaction.user,
				searchEngine: QueryType.AUTO
				})
				.catch(() => {});
				if (!searchResult || !searchResult.tracks.length) return void interaction.followUp({ content: "No results were found!" });
				const queue = await player.createQueue(interaction.guild, {
					metadata: interaction.channel
				});
		
				try {
					if (!queue.playing) await queue.connect(interaction.member.voice.channel);
				} catch {
					void player.deleteQueue(interaction.guildId);
					return void interaction.followUp({ content: "Could not join your voice channel!" });
				}
		
				await interaction.followUp({ content: `⏱ | Loading your ${searchResult.playlist ? "playlist" : "track"}...` });
				searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
				if (!queue.playing) await queue.play();
		}
		// Skipping interaction
		else if (interaction.commandName === "skip") {
			await interaction.deferReply();
			const queue = player.getQueue(interaction.guildId);
			if (!queue || !queue.playing) return void interaction.followUp({ content: "❌ | No music is being played!" });
			const currentTrack = queue.current;
			const success = queue.skip();
			return void interaction.followUp({
				content: success ? `✅ | Skipped **${currentTrack}**!` : "❌ | Something went wrong!"
			});
		} else if (interaction.commandName === "stop") { 	// Stopping interaction 
			await interaction.deferReply();
			const queue = player.getQueue(interaction.guildId);
			if (!queue || !queue.playing) return void interaction.followUp({ content: "❌ | No music is being played!" });
			queue.destroy();
			return void interaction.followUp({ content: "🛑 | Stopped the player!" });
		}  else {
			interaction.reply({
			    content: "Unknown command!",
			    ephemeral: true
			});
		}



	});

}

module.exports = {
	musicPlayerInit,
	musicPlayerDeploy
}