
// var a = T.get('search/tweets', {q: 'nasa', result_type: 'popular'}, function(err, data, response) {
//   console.log(data)
// });

// var c = T.get('statuses/lookup', {id: '1607959686916997121,1608854225576165378', tweet_mode: 'extended'}, function(err, data, response) {
//   console.log(data)
// });
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const https = require('https');
const fs = require('fs');
const { execSync } = require("child_process");
const fetch = require('node-fetch');
const path = require("path");





// Slash command deployment for twitter grabber
async function twitterGrabberDeploy(message) {
	if (message.content === "!deploy" && message.author.id === client.application?.owner?.id) {
		await message.guild.commands.set([
		{
			name: "download_media",
			description: "Downloads media from tweet",
			options: [
				{
					name: "tweet",
					type: 3, // string
					description: "Link to the tweet",
					required: true
				}, 
				{
					name: "scale",
					type: 4, // integer
					description: "(IN PIXELS) Width scale of the .gif output, height computed automatically to keep scaling.",
					required: false
				},
				{
					name: "fps",
					type: 4, // integer
					description: "Set the FPS for the output .gif file.",
					required: false
				}
			]
		}
		]);

		await message.reply("Deployed twitter grabber commands!");
	}
	
}

async function twitterGrabberInit(GuildMember) {

	// Setup interaction between the slash commands
	client.on("interactionCreate", async (interaction) => {



		// Delete the previous files.... super janky soolution
		const directory = "media";
		fs.readdir(directory, (err, files) => {
		  if (err) {
			console.log(err);
		  }
		  for (var cfile of files) {
			if(cfile == ".gitkeep") {
				continue
			}
		    fs.unlink(path.join(directory, cfile), (err) => {
		      if (err) {
			console.log(err);
		      };
		    });
		  }
		});

		// Check if the member belongs here
		if (!interaction.isCommand() || !interaction.guildId) return;
		if (!(interaction.member instanceof GuildMember)) {
			return void interaction.reply({ content: "You are not a member of the server!", ephemeral: true });
		}


		// Playing interaction
		switch(interaction.commandName) {
			case "download_media":
				// Defer the reply while we prep the message
				await interaction.deferReply();

				var tweet_url_split = interaction.options.get("tweet").value.split("/");
				var tweet_id = tweet_url_split[tweet_url_split.length-1];

				// Exit if not a proper tweet URL
				if(isNaN(Number(tweet_id))) {
					interaction.reply({
						content: "Unable to find tweet ID in URL provided.",
						ephemeral: true
					});
					return;
				}

				var c = twitapi.get('statuses/show', {id: tweet_id, tweet_mode: 'extended'}, function(err, data, response) {

					// Check if the tweet has media attatched
					if(!data.hasOwnProperty('extended_entities')) {
						interaction.reply({
							content: "Tweet doesn't contain any media to download.",
							ephemeral: true
						});
						return;
					}

					var media =data.extended_entities.media[0]; 


					switch(media.type) {
						case "photo":

							var media_split = media.media_url.split(".");
							var extension = media_split[media_split.length-1];

							var photoEmbed = new EmbedBuilder()
								.setColor(0x0099FF)
								.setTitle("Media from " + data.user.name)
								.setDescription(media.media_url)
								.setFooter({text: "Original tweet: " + interaction.options.get("tweet").value})
								.setURL(interaction.options.get("tweet").value)
								.setImage(media.media_url)
								.addFields({name: "Media type", value: "."+extension}) 

							interaction.editReply({
								// files: [media.media_url]
								embeds: [photoEmbed]
							});
							return;
						break;

						case "animated_gif":
							var video = media.video_info.variants[0];
							// Grab the extension type of the video
							var video_split = video.url.split(".");
							var extension = video_split[video_split.length-1];

							// We need to download the MP4 first
							var uuid = v4uuid();
							var filename = uuid+"."+extension;
							var filepath = "media/"+filename;
							var file = fs.createWriteStream(filepath);
							// Download the .mp4 so we can convert it to a gif
							const request = https.get(video.url, function(response) {
								response.pipe(file);

								// after download completed close filestream and post
								file.on("finish", () => {
									file.close();

									try {
										// Convert the video to a gif
										var gif_filepath = "media/"+uuid+".gif";

										// Figure out if the user supplies a scale or FPS 
										var scale = interaction.options.get("scale") === null ? "" : `scale=${interaction.options.get("scale").value}:-1:flags=lanczos,`;
										var fps = interaction.options.get("fps") === null ? "" : `fps=${interaction.options.get("fps").value},`;
										execSync(`ffmpeg -i ${filepath} -vf "${fps}${scale}split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 ${gif_filepath}`)

										// Get file stats on the file
										var stats = fs.statSync(gif_filepath)
										var fileSizeInBytes = stats.size;
										// Convert the file size to megabytes (optional)
										var fileSizeInMegabytes = fileSizeInBytes / (1024*1024);

										// Discord max file size upload limit is 8MB... can't post if it's larger
										if(fileSizeInMegabytes >= 8) {
											interaction.editReply(`The GIF downloaded is too large (${fileSizeInMegabytes} MB / 8MB).  Either scale the image or limit the FPS in the next request.`)
											return;
										}

										// If the message is an OKAY size, then continue to post it.
										// Create a new message attachment
										var attach = new AttachmentBuilder(gif_filepath, "output.gif");
										var gifEmbed = new EmbedBuilder()
											.setColor(0x0099FF)
											.setTitle("Media from " + data.user.name)
											.setDescription(`Original MP4: ${video.url}`)
											.setFooter({text: "Original tweet: " + interaction.options.get("tweet").value})
											.setURL(interaction.options.get("tweet").value)
											.setImage('attachment://output.gif')
											.addFields({name: "Media type", value: ".gif"});

										// Edit the reply with the final embed
										interaction.editReply({
											embeds: [gifEmbed],
											files: [attach]
										})


										// Delete the .mp4 file
										fs.unlink(filepath, function(err) {
											if(err && err.code == 'ENOENT') {
												// file doens't exist
												console.info("File doesn't exist, won't remove it.");
											} else if (err) {
												// other errors, e.g. maybe we don't have enough permission
												console.error("Error occurred while trying to remove file");
											} else {
												console.info(`MP4 removed`);
											}
										});

									} catch(e) {
										console.log("Something went wrong with the download");
										interaction.editReply("Something went wrong...");
										return;
									}

								}); // end file finish writing
							}); // end HTTPS file get

							
							return;
						break;
					} // end of switch
				}); // end twitter api get
		} // end switch interaction
	}); // end on client interaction grab

}

module.exports = {
	twitterGrabberDeploy,
	twitterGrabberInit	
}
