
const { SubCommand } = require("../../base/SubCommand.js");

class Skip extends SubCommand {

    constructor (client, group) {

        super(client, {

            group,
            name: "skip",
            description: "Skips the current song playing.",
            category: "Music",
            usage: "skip",
            guildOnly: true,
            isGlobal: true,
            cooldownTime: 2

        });
        
    }

    async run (msg, args) {

        let info = this.group.getInfo(msg);
        if (!info.currentSong)
            return await msg.channel.send("There's no song to skip.");
        
        let song = info.currentSong;

        info.dispatcher.end();
        await msg.channel.send({

            embed: {

                author: {

                    name: msg.author.tag,
                    icon_url: msg.author.displayAvatarURL

                },

                description: `Skipped [${song.title}](${song.url})`

            }
            
        });

    }

}

module.exports = Skip;
