
// Group command but as a sub of a group command.
const { GroupCommand } = require("./GroupCommand.js");
const { SubCommandDefaultOptions } = require("./SubCommand.js");

class SubGroupCommand extends GroupCommand {

    constructor (client, options = {}) {

        let opts = Object.mergeDefault(SubCommandDefaultOptions, options);
        super (client, opts);

        this.conf.isGlobal = opts.isGlobal;
        this.group = opts.group;
        this.type = "SubGroupCommand";

    }

    init () {

        let group = this.group;
        while (group) {

            this.help.usage = group.help.name + " " + this.help.usage;
            group = group.group;

        }

    }

}

module.exports = {

    SubGroupCommand

};
