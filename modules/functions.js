
module.exports = (client) => {

    // For delaying.
    client.wait = require("util").promisify(setTimeout);

    // To make things easier for me.
    client.sendThenDelete = async (channel, message, time) => {

        let m = await channel.send(message);
        await m.delete(time || 0);

    };

    // For easy access.
    Object.mergeDefault = require("discord.js").Util.mergeDefault;

    Number.prototype.digit = function (count) {

        let res = this.toString();
        res = " ".repeat(res.length > count ? 0 : count - res.length) + res;
        
        return res;

    }

};
