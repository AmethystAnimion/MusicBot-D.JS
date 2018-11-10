
const { SubCommand } = require("../../base/SubCommand.js");
const MusicUtil = require("../../modules/music-util.js");

class Join extends SubCommand {

    constructor (client, group) {

        super(client, {

            group,
            name: "join",
            description: "Joins the voice channel you're in.",
            category: "Music",
            usage: "join",
            guildOnly: true,
            isGlobal: true,
            cooldownTime: 10

        });

    }

    async run (msg, args) {

        if (!msg.member.voiceChannel)
            return await msg.channel.send("Please join a voice channel first before using this command.");
        
        if (msg.guild.me.voiceChannelID === msg.member.voiceChannelID)
            return await msg.channel.send("I'm already in the voice channel.");

        let info = this.group.servers[msg.guild.id];
        if (!info)
            info = this.group.createServerMusicInfo(msg);
        
        await msg.member.voiceChannel.join();
        info.logChannelID = msg.channel.id;

    }

}

module.exports = Join;
