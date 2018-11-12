
const { SubCommand } = require("../../base/SubCommand.js");
const { PlayMode } = require("../../modules/music-util.js");

class Mode extends SubCommand {

    constructor (client, group) {

        super(client, {

            group,
            name: "mode",
            description: "Shows/changes the mode (repeat, shuffle, etc.).",
            category: "Music",
            usage: "mode [default/repeat/repeatone/shuffle/shufflerepeat]",
            guildOnly: true,
            cooldownTime: 2

        });

        this.modes = {

            default: PlayMode.ADVANCE,
            repeat: PlayMode.REPEAT,
            repeatone: PlayMode.REPEAT_ONE,
            shuffle: PlayMode.SHUFFLE,
            shufflerepeat: PlayMode.SHUFFLE_REPEAT

        }
        
    }

    async run (msg, [mode, ...args]) {

        if (msg.member.voiceChannelID !== msg.guild.me.voiceChannelID)
            return await msg.channel.send("Please join the voice channel first.");
        
        if (!mode)
            return await msg.channel.send(`Current mode: ${}`)

        let newMode = this.modes[mode ? mode.toLowerCase() : mode];
        if (!newMode)
            return await msg.channel.send(`Please enter the correct mode. (${Object.getOwnPropertyNames(this.modes).join(", ")})`);
        
        let info = this.group.getInfo(msg);

        info.queue.mode = newMode;

        this.group.updateInfo(info);

    }

}

module.exports = Mode;
