
function roleAssigner(message, user, add_or_remove) {

	// Check if we are in the proper channel
	if(message.message.channelId != process.env.ROLE_MANAGER_CHANNEL_ID) {
		console.log("Emoji was not triggered in the role manager channel.\n");
		return;
	}

	let role_id;
	let emoji_react = message._emoji.name;

	// Figure out which emote was marked
	switch(emoji_react) {
		case "🎨":
			role_id=process.env.ARTIST_ROLE_ID;
			break;
		case "🎵":
			role_id=process.env.SOUND_ROLE_ID;
			break;
		case "💾":
			role_id=process.env.PROGRAMMER_ROLE_ID;
			break;
		case "🎮":
			role_id=process.env.TESTER_ROLE_ID;
			break;
		case "🎥":
			role_id=process.env.TWITCH_ROLE_ID;
			break;
		default: 
			role_id=null;
			console.log("Emoji not available for role selection...");
			return; // return early if null value passed in...
			break;
	}

	// Get role and guild object
	let guild = message.message.guild;
	let role = guild.roles.cache.get(role_id);
	if(role === undefined) {
		console.log("Role came back as undefined...\n");
	}

	// Search for the member object of this user and add/remove the role
	guild.members.fetch(user)
	.then( member => {
		switch(add_or_remove) {
		case "add":
			// message.member.roles.add(role).then(message.channel.send("Role added!"));
				member.roles.add(role)
				.then(console.log("Role " + role.name + " added to user '"+user.username+"'!"))
				.catch(console.error);
				break;
			case "remove":
				member.roles.remove(role)
				.then(console.log("Role " + role.name + " removed from user '"+user.username+"'!"))
				.catch(console.error);
				break;
		}
	});
	return;
}

// Run this on client ready
function roleManagerInit() {
	// Cache the message that we are using for role checking
	client.channels.fetch(process.env.ROLE_MANAGER_CHANNEL_ID)
	.then(channel => { 
		// channel.messages.fetch(process.env.ROLE_MANAGER_MESSAGE_ID)
		channel.messages.fetch()
	});

	// Establish what to do on reactionAdd event 
	client.on('messageReactionAdd', async (message, user) => {
		roleAssigner(message, user, 'add');
	});
	// Establish what to do on reactionARemove event 
	client.on('messageReactionRemove', async (message, user) => {
		roleAssigner(message, user, 'remove');
	});

}

module.exports = {
	roleManagerInit,
	roleAssigner
}