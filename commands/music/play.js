
const { SubCommand } = require("../../base/SubCommand.js");
const MusicUtil = require("../../modules/music-util.js");

class Play extends SubCommand {

    constructor (client, group) {

        super(client, {

            group,
            name: "play",
            description: "Plays a song.",
            category: "Music",
            usage: "play [yt-url/query]",
            guildOnly: true,
            isGlobal: true,
            cooldownTime: 5

        });

    }

    async run (msg, args) {

        if (!msg.member.voiceChannel)
            return await msg.channel.send("Please join a voice channel first before using this command.");
        
        if (!msg.guild.me.voiceChannel)
            return await msg.channel.send("Please let me join the voice channel first before using this command.");
        
        if (msg.guild.me.voiceChannelID !== msg.member.voiceChannelID)
            return await msg.channel.send("You're in the wrong voice channel. Come and join us.");

        let info = this.group.servers[msg.guild.id];
        if (!info)
            info = this.group.createServerMusicInfo(msg);
        
        if (args.length) {

            console.log(require("util").inspect(args));

            let song = MusicUtil.getSongFromYouTubeURL(client, msg.author, args[0]);
            if (!song)
                return await msg.channel.send("You gave an invalid YouTube url!");
            
            info.queue.enqueue(song);

        }

        if (info.queue.length)
            await this.group.play(msg, info);
        
    }

}

module.exports = Play;
