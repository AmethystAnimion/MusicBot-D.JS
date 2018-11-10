
module.exports = class {

    constructor (client) {

        this.client = client;

    }

    async run (msg) {

        if (msg.author.bot)
            return;
        
        if (msg.guild && !msg.guild.me.permissionsIn(msg.channel).has("SEND_MESSAGES"))
            return;
        
        if (!msg.content.startsWith(this.client.config.prefix))
            return;
        
        const args = msg.content.toLowerCase().slice(this.client.config.prefix.length).trim().split(/ +/g);
        const command = args.shift();

        let cmd = this.client.commands.find(c => c.help.name === command || c.conf.aliases.includes(command));
        if (!cmd)
            return;

        let cooldown = cmd.getUserCooldown(msg.author);
        if (cooldown.cooldown)
            return await msg.channel.send(`You can use this command again in ${cooldown.timeRemaining} seconds.`);
        
        else
            cmd.setUserCooldown(msg.author);
        
        if (!cmd.conf.enabled)
            return await msg.channel.send(cmd.conf.disabledMessage);
        
        if (!msg.guild && cmd.conf.guildOnly)
            return await msg.channel.send("This command can't be used via direct messages.");
        
        msg.flags = [];
        args.forEach((v, i) => {

            if (v.startsWith("--"))
                msg.flags.push({ flag: v.slice(2), index: i });

        });

        cmd.run(msg, args);

    }

};
