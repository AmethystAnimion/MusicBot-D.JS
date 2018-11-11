
const { SubCommand } = require("../../base/SubCommand.js");

class Queue extends SubCommand {

    constructor (client, group) {

        super(client, {

            group,
            name: "queue",
            description: "Shows/clears the queue.",
            category: "Music",
            usage: "queue [clear]",
            guildOnly: true,
            isGlobal: true,
            cooldownTime: 2

        });

    }

    async run (msg, [cmd, ...args]) {

        let info = this.group.getInfo(msg);

        if (cmd.toLowerCase() === "clear") {

            info.queue.clear();
            this.group.updateInfo(info);

            return await msg.channel.send({

                embed: {

                    author: {

                        name: msg.author.tag,
                        icon_url: msg.author.displayAvatarURL

                    },

                    description: "Cleared queue."

                }
                
            });

        }

        let s = []
        let count = info.queue.length.toString().length + 1;

        for (let i = 0; i < info.queue.length; i++) {

            let indent = " ".repeat(count - i.toString().length);
            s.push(`${indent}${i + 1} : ${info.queue.__items[i].title}`);

        }

        await msg.channel.send({

            embed: {

                description: `\`\`\`\nQueue\n> ${info.currentSong ? info.currentSong.title : "No Song Playing"}\n${s.length ? s.join("\n") : "\n\nEmpty...\n\n"}\n\`\`\``

            }
            
        });

    }

}

module.exports = Queue;
