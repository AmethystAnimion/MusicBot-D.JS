
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

        return info;

    }

    async play (msg) {

        let info = this.getInfo(msg);
        let song = info.currentSong ? info.currentSong : info.queue.next();

        if (!song)
            return;
        
        let dispatcher = await info.connection.playStream(song.stream, { seek: 0, volume: info.options.volume, bitrate: info.options.bitrate, passes: 5 });
        
        dispatcher.on("end", async (reason) => {

            let info = this.getInfo(msg);
            let song = info.currentSong;

            info.currentSong = null;
            info.dispatcher = null;

            this.updateInfo(info);

            if (reason === "LEAVE")
                return;
            
            if (info.queue.mode === MusicUtil.PlayMode.REPEAT || info.queue.mode === MusicUtil.PlayMode.SHUFFLE_REPEAT)
                info.queue.enqueue(song);
            
            if (info.queue.mode === MusicUtil.PlayMode.REPEAT_ONE)
                info.queue.__items.unshift(song);
            
            this.updateInfo(info);

            await this.play(msg);

        });

        info.dispatcher = dispatcher;

        if (info.logChannel)
            await info.logChannel.send({

            embed: {

                author: { name: "Now Playing..." },
                description: `Title: [${info.currentSong.title}](${info.currentSong.url})\nLength: ${info.currentSong.durationString}\nAuthor: [${info.currentSong.author.name}](${info.currentSong.author.channel_url})\nRequested By: ${info.currentSong.user ? info.currentSong.user.tag : "Unknown User"}`,
                thumbnail: { url: info.currentSong.thumbnailURL }

            }

        });

        this.updateInfo(info);

    }

    getInfo (msg) {

        let info = this.servers[msg.guild.id];
        if (!info)
            info = this.createServerMusicInfo(msg);

        return info;

    }

    updateInfo (info) {

        this.servers[info.id] = info;

    }

}

module.exports = Music;
