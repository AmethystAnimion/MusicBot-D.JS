
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

        if (!msg.guild.me.voiceChannel)
            return await msg.channel.send("I haven't joined a voice channel yet.");

        if (msg.member.voiceChannelID !== msg.guild.me.voiceChannelID)
            return await msg.channel.send("Please join the voice channel first.");
        
        let info = this.group.getInfo(msg);
        
        if (!mode)
            return await msg.channel.send(`Current mode: ${Object.entries(this.modes).find(i => i[1] === info.queue.mode)[0]}`);

        let newMode = this.modes[mode ? mode.toLowerCase() : mode];
        if (!newMode && newMode !== 0)
            return await msg.channel.send(`Please enter the correct mode. (${Object.getOwnPropertyNames(this.modes).join(", ")})`);

        info.queue.mode = newMode;

        this.group.updateInfo(info);

    }

}

module.exports = Mode;
