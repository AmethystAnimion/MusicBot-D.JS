
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
        
        let info = this.group.getInfo(msg);

        if (info.currentSong && (info.queue.mode === 0 || info.queue.mode === 3))
            info.queue.__items.unshift(info.currentSong);

        if (info.dispatcher)
            info.dispatcher.end("LEAVE");

        await msg.guild.me.voiceChannel.leave();
        info.logChannelID = null;
        info.dispatcher = null;

        this.group.updateInfo(info);

    }

}

module.exports = Leave;
