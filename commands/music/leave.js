
const { SubCommand } = require("../../base/SubCommand.js");
const MusicUtil = require("../../modules/music-util.js");

class Leave extends SubCommand {

    constructor (client, group) {

        super(client, {

            group,
            name: "leave",
            description: "Leaves the voice channel the bot is in.",
            category: "Music",
            usage: "leave",
            guildOnly: true,
            isGlobal: true,
            cooldownTime: 10

        });

    }

    async run (msg, args) {

        if (!msg.guild.me.voiceChannel)
            return await msg.channel.send("I can't leave a channel that I'm not in!");
        
        let info = this.group.servers[msg.guild.id];
        if (!info)
            return await msg.guild.me.voiceChannel.leave();

        if (info.dispatcher)
            info.dispatcher.end();
        
        await msg.guild.me.voiceChannel.leave();
        info.logChannelID = null;

    }

}

module.exports = Leave;
