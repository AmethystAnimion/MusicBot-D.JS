
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
        
        info.dispatcher.end();

    }

}

module.exports = Skip;
