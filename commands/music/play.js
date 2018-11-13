
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

        this.awaitMessageFilter = (msg, length, other) => {

            if (msg.author.id !== other.author.id)
                return false;
            
            if (!isNaN(+other.content)) {

                let index = +other.content;
                if (index >= 0 && index < length)
                    return true;
                
                else
                    return false;

            }

            else if (other.content.toLowerCase() === 'c')
                return true;
            
            else 
                return false;

        }

    }

    async run (msg, args) {

        if (!msg.member.voiceChannel)
            return await msg.channel.send("Please join a voice channel first before using this command.");
        
        if (!msg.guild.me.voiceChannel)
            return await msg.channel.send("Please let me join the voice channel first before using this command.");
        
        if (msg.guild.me.voiceChannelID !== msg.member.voiceChannelID)
            return await msg.channel.send("You're in the wrong voice channel. Come and join us.");

        let info = this.group.getInfo(msg);
        
        if (args.length) {

            let song = await MusicUtil.getSongFromYouTubeURL(this.client, msg.author, args[0]);
            if (!song) {

                await msg.channel.startTyping();

                let results = await MusicUtil.getSongsFromYouTube(this.client, msg.author, args.join(' '));

                let text = results.map((v, i) => ` [${i}] - ${v.title}`);

                await msg.channel.stopTyping();

                let res = await this.client.getUserResponse(msg, {

                    embed: {

                        description: `\`\`\`Results for '${args.join(" ")}':\n${text.join("\n")}\n [c] - Cancel\`\`\``

                    }

                }, m => this.awaitMessageFilter(msg, results.length, m));

                if (!res)
                    return;
                
                if (results[+res.content])
                    song = results[+res.content];
                
                else
                    return;

            }
            
            info.queue.enqueue(song);
            await msg.channel.send({

                embed: {

                    author: {

                        name: msg.author.tag,
                        icon_url: msg.author.displayAvatarURL

                    },

                    description: `Enqueued [${song.title}](${song.url})`

                }
                
            });

            this.group.updateInfo(info);

        }

        else if (info.currentSong) {

            if (info.dispatcher.paused)
                return await info.dispatcher.resume();
            
            else
                return await msg.channel.send("The music is already playing...");
            
        }

        if (!info.queue.length)
            return await msg.channel.send("The queue is empty. There's nothing to play");
        
        if (!info.currentSong)
            await this.group.play(msg, info);

    }

}

module.exports = Play;
