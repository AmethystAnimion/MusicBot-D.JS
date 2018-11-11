
const { GroupCommand } = require("../base/GroupCommand.js");
const MusicUtil = require("../modules/music-util.js");

class Music extends GroupCommand {

    constructor (client) {

        super(client, {

            name: "music",
            description: "A group command to play music.",
            category: "Entertainment",
            usage: "music [command] [...args]",
            guildOnly: true

        });

        this.servers = {};

    }

    createServerMusicInfo (msg) {

        if (this.servers[msg.guild.id])
            return;
        
        let info = new MusicUtil.ServerMusicInfo(this.client, msg.guild.id, msg.channel.id);
        this.servers[msg.guild.id] = info;

        if (info.connection)
            MusicUtil.initializeConnection(info);

        return info;

    }

    async play (msg, info = null) {

        info = info ? info : this.servers[msg.guild.id];
        if (!info)
            info = this.createServerMusicInfo(msg);

        let song = info.currentSong ? info.currentSong : info.queue.next();
        song.stream.on("end", () => {

            if (info.dispatcher)
                info.dispatcher.end();

        });

        let dispatcher = await info.connection.playStream(song.stream, { seek: 0, volume: song.options.volume, bitrate: song.options.bitrate, passes: 5 });
        MusicUtil.initializeDispatcher(info);

        if (info.logChannel)
            await info.logChannel.send({

            embed: {

                author: { name: "Now Playing..." },
                description: `Title: [${info.currentSong.title}](${info.currentSong.url})\nLength: ${info.currentSong.durationString}\nAuthor: [${info.currentSong.author.name}](${info.currentSong.author.channel_url})\nRequested By: ${info.currentSong.user ? info.currentSong.user.tag : "Unknown User"}`,
                thumbnail: { url: info.currentSong.thumbnailURL }

            }

        });

    }

}

module.exports = Music;
