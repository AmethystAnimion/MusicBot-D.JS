
module.exports = (client) => {

    // For delaying.
    client.wait = require("util").promisify(setTimeout);

    // For easy access.
    Object.mergeDefault = require("discord.js").Util.mergeDefault;

    // To make things easier for me.
    client.sendThenDelete = async (channel, message, time) => {

        let m = await channel.send(message);
        await m.delete(time || 0);

    };

};
