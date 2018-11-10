
const { Command } = require("../base/Command.js");

class Help extends Command {

    constructor (client) {

        super(client, {

            name: "help",
            description: "Helps you with the commands.",
            category: "Bot",
            usage: "help [command]*",
            cooldownTime: 3,
            enabled: false,
            disabledMessage: "Sorry, the help command is still in development."

        });

    }

}

module.exports = Help;
