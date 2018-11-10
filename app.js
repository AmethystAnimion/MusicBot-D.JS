
// NodeJS Modules
const Path = require("path");

// Node Packages
const Discord = require("discord.js");
const Klaw = require("klaw");

class MusicBot extends Discord.Client {

    constructor (options) {

        super (options);

        this.config = require("./config.js");
        this.commands = new Array();

    }

    loadCommand (path) {

        try {

            let cmd = new (require(`${path.dir}/${path.base}`))(this);
            cmd.conf.path = path;

            if (cmd.init)
                cmd.init();

            this.commands.push(cmd);

            return false;

        }

        catch (e) {

            return `\nUnable to load command: ${path.base}\n${e.stack}\n`;

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

            cmd = new (require(`${path.dir}/${path.base}`))(this);
            cmd.conf.path = path;

            if (cmd.init)
                cmd.init();

            this.commands.push(cmd);

            return false;

        }

        catch (e) {

            return `\nUnable to load subcommand of ${this.help.name}: ${path.base}\n${e.stack}\n`;

        }

    }

}

const client = new MusicBot();
(require("./modules/functions.js"))(client);

const init = async () => {

    // Load commands.
    Klaw("./commands", {

        depthLimit: 0

    }).on("data", item => {

        if (!(/\.js$/ig.test(item.path)))
            return;

        let path = Path.parse(item.path);

        console.log(`Loading command: ${path.base}`);

        let response = client.loadCommand(path);
        if (response)
            console.warn(response);

    });

    // Load events.
    Klaw("./events", {

        depthLimit: 0

    }).on("data", item => {

        if (!(/\.js$/ig.test(item.path)))
            return;

        let path = Path.parse(item.path);

        console.log(`Loading event: ${path.base}`);

        let event = new (require(`${path.dir}/${path.base}`))(client);
        client.on(path.name, (...args) => event.run(...args));

        delete require.cache[require.resolve(`${path.dir}/${path.base}`)];

    });

    // Logs in to Discord.
    await client.login(process.env.TOKEN);

}

init();

client.on("reconnecting", () => console.log("Reconnecting client..."))
    .on("disconnect", () => console.log("Client has been disconnected from Discord."))
    .on("warn", (info) => console.warn(`WARNING  : ${info}`))
    .on("error", e => console.error(`An error was thrown:\n${e.stack}`));
