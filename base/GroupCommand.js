
const { Command } = require("./Command.js");

class GroupCommand extends Command {

    constructor (client, options = {}) {

        let opts = Object.mergeDefault(GroupCommandDefaultOptions, options);
        super (client, opts);

        this.commands = new Array();
        this.conf.defaultRun = opts.defaultRun;
        this.type = "Group";

    }

    // #CopyPastedFromClient.
    loadCommand (path) {

        try {

            let cmd = new (require(`${path.dir}/${path.base}`))(this.client, this);
            cmd.conf.path = path;

            if (cmd.init)
                cmd.init();

            this.commands.push(cmd);
            if (cmd.conf.isGlobal)
                this.client.commands.push(cmd);

            return false;

        }

        catch (e) {

            return `\nUnable to load subcommand of ${this.help.name}: ${path.base}\n${e.stack}\n`;

        }

    }

    unloadCommand (cmdName) {

        let cmd = this.commands.find(c => c.help.name === cmdName || c.conf.aliases.includes(cmdName));

        if (!cmd)
            return `There's no command with the name/alias of ${cmdName}.`;

        this.commands.splice(this.commands.findIndex(c => Object.is(c, cmd)), 1);

        delete require.cache[require.resolve(`${cmd.conf.path.dir}/${cmd.conf.path.base}`)];
        return false;

    }

    reloadCommand (cmdName) {

        let cmd = this.commands.find(c => c.help.name === cmdName || c.conf.aliases.includes(cmdName));

        if (!cmd)
            return `There's no command with the name/alias of ${cmdName}.`;

        this.commands.splice(this.commands.findIndex(c => Object.is(c, cmd)), 1);
        delete require.cache[require.resolve(`${cmd.conf.path.dir}/${cmd.conf.path.base}`)];
        
        let path = cmd.conf.path;
        try {

            cmd = new (require(`${path.dir}/${path.base}`))(this.client, this);
            cmd.conf.path = path;

            if (cmd.init)
                cmd.init();

            this.commands.push(cmd);
            if (cmd.conf.isGlobal)
                this.client.commands.push(cmd);

            return false;

        }

        catch (e) {

            return `\nUnable to load subcommand of ${this.help.name}: ${path.base}\n${e.stack}\n`;

        }

    }

    async init () {

        const Path = require("path");
        const Klaw = require("klaw");

        if (!(await require("fs").existsSync(`./commands/${this.help.name}`)))
            return;
        
        Klaw(`${this.conf.path.dir}/${this.help.name}`, {

            depthLimit: 0

        }).on("data", item => {

            if (!(/\.js$/ig.test(item.path)))
                return;

            let path = Path.parse(item.path);

            console.log(`Loading subcommand of ${this.help.name}: ${path.base}`);

            let response = this.loadCommand(path);
            if (response)
                return console.warn(response);

        });

        // So long...
        if (typeof this.conf.defaultRun === "string") {

            let cmd = this.commands.find(c => c.help.name === this.conf.defaultRun || c.conf.aliases.includes(this.conf.defaultRun));
            if (cmd)
                this.conf.defaultRun = cmd.run;
            else
                this.conf.defaultRun = GroupCommandDefaultOptions.defaultRun;

        }

    }

    async run (msg, [command, ...args]) {

        let cmd = this.commands.find(c => c.help.name === command || c.conf.aliases.includes(command));
        if (!cmd)
            return await this.conf.defaultRun(msg, [command, ...args]);
        
        // #CopyPastedFromMessage.js
        let cooldown = cmd.getUserCooldown(msg.author);
        if (cooldown.cooldown)
            return await msg.channel.send(`You can use this command again in ${cooldown.timeRemaining} seconds.`);
        
        else
            cmd.setUserCooldown(msg.author);
        
        if (!cmd.conf.enabled)
            return await msg.channel.send(cmd.conf.disabledMessage);
        
        if (!msg.guild && cmd.conf.guildOnly)
            return await msg.channel.send("This command can't be used via direct messages.");

        cmd.run(msg, args);
        
    }

}

const GroupCommandDefaultOptions = {

    defaultRun: (...args) => false

};

module.exports = {

    GroupCommand,
    GroupCommandDefaultOptions

};
