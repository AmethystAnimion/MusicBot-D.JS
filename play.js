
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

        let info = this.group.getInfo(msg);
        
        if (args.length) {

            let song = await MusicUtil.getSongFromYouTubeURL(this.client, msg.author, args[0]);
            if (!song) {

                let results = await MusicUtil.getSongsFromYouTube(this.client, msg.author, args.join(' '));

                let text = results.map((v, i) => ` [${i}] - ${v.title}`);

                let res = await this.client.getUserResponse(msg, {

                    embed: {

                        description: `Results for '${args.join(" ")}':\n${text.join("\n")}\n [c] - Cancel`

                    }

                }, m => m.author.id === msg.author.id && (isNaN(+msg.content) ? msg.content.toLowerCase() === 'c' : (+msg.content >= 0 && +msg.content < results.length)));

                if (!res)
                    return;
                
                else if (res.content.toLowerCase() === 'c')
                    return;
                
                else if (results[+res.content])
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

        else if (info.dispatcher) {

            if (info.dispatcher.paused)
                return await info.dispatcher.resume();
            
            else
                return await msg.channel.send("The music is already playing...");
            
        }

        if (!info.queue.length)
            return await msg.channel.send("The queue is empty. There's nothing to play");
        
        if (!info.dispatcher)
            await this.group.play(msg, info);

    }

}

module.exports = Play;
