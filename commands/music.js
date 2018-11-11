
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
            for (var [ event, callback ] of Object.entries(callbacks.connection))
                info.connection.on(event, (...args) => callback(info, ...args));

        return info;

    }

    async play (msg) {

        let info = this.getInfo(msg.guild.id)
        let song = info.currentSong ? info.currentSong : info.queue.next();

        let dispatcher = await info.connection.playStream(song.stream, { seek: 0, volume: song.options.volume, bitrate: song.options.bitrate, passes: 5 });
        
        for (var [ event, callback ] of Object.entries(MusicUtil.callbacks.dispatcher))
            dispatcher.on(event, (...args) => callback(info, ...args));

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

    getInfo (id) {

        let info = this.servers[id];
        if (!info)
            info = this.createServerMusicInfo(msg);

        return info;

    }

    updateInfo (info) {

        this.servers[info.id] = info;

    }

}

module.exports = Music;
