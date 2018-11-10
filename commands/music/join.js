
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

        let info = this.group.servers[msg.guild.id];
        if (!info)
            info = this.group.createServerMusicInfo(msg);
        
        msg.member.voiceChannel.join();

    }

}

module.exports = Join;
