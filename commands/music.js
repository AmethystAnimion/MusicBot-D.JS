
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

        if (info.dispatcher) {

            if (info.dispatcher.paused)
                return await info.dispatcher.resume();
            
            else
                return await msg.channel.send("The music is already playing...");
            
        }

        let song = info.queue.next();
        
        await info.connection.playStream(song.stream);
        MusicUtil.initializeDispatcher(info);

    }

}

module.exports = Music;
