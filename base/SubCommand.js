
const { Command } = require("./Command.js");

// For Group Commands.
class SubCommand extends Command {

    constructor (client, options = {}) {

        let opts = Object.mergeDefault(SubCommandDefaultOptions, options);
        super (client, opts);

        this.conf.isGlobal = opts.isGlobal;
        this.group = opts.group;
        this.type = "SubCommand";

    }

    init () {

        let group = this.group;
        while (group) {

            this.help.usage = group.help.name + " " + this.help.usage;
            group = group.group;

        }

    }

}

const SubCommandDefaultOptions = {

    group: null,

    // Whether the command can be accessed outside of the Group.
    isGlobal: false


};

module.exports = {

    SubCommand,
    SubCommandDefaultOptions

};
