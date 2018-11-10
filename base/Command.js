
class Command {

    constructor (client, options = {}) {

        let opts = Object.mergeDefault(CommandDefaultOptions, options);

        this.client = client;
        this.help = { name: opts.name, description: opts.description, category: opts.category, usage: opts.usage, cooldownTime: opts.cooldownTime };
        this.conf = { enabled: opts.enabled, disabledMessage: opts.disabledMessage, guildOnly: opts.guildOnly, aliases: opts.aliases, path: opts.path, cooldownTime: opts.cooldownTime, cooldowns: opts.cooldowns, hidden: opts.hidden };
        this.type = "Command";

    }

    getUserCooldown (user) {

        let index = this.conf.cooldowns.findIndex(c => c.id === user.id);
        if (index === -1)
            return {

                cooldown: false,
                timeRemaining: 0

            };

        let cooldown = this.conf.cooldowns.splice(index, 1);
        
        let timespan = process.hrtime(cooldown.time);
        if (timespan[0] < this.conf.cooldownTime) {

            this.conf.cooldowns.push(cooldown);
            return {

                cooldown: true,
                timeRemaining: this.conf.cooldownTime - timespan[0]

            };
        
        }
        
        return {

            cooldown: false,
            timeRemaining: 0

        };

    }

    setUserCooldown (user) {

        if (this.conf.cooldowns.find(c => c.id === user.id))
            return;

        this.conf.cooldowns.push({

            id: user.id,
            time: process.hrtime()

        });      

    }

}

const CommandDefaultOptions = {

    name: null,
    description: "No description provided.",
    category: "Miscellaneous",
    usage: "No usage provided.",
    enabled: true,
    disabledMessage: "This command is currently disabled. Please try again next time.",
    guildOnly: false,
    aliases: new Array(),
    path: null,
    cooldownTime: 0,
    cooldowns: new Array(),

    // Whether the command is hidden in the help command or not.
    hidden: false
    
};

module.exports = {

    Command,
    CommandDefaultOptions

};
