
module.exports = (client) => {

    // For delaying.
    client.wait = require("util").promisify(setTimeout);

    // To make things easier for me.
    client.sendThenDelete = async (channel, message, time) => {

        let m = await channel.send(message);
        await m.delete(time || 0);

    };

    // To get a response from a certain user.
    client.getUserResponse = async (msg, message, filter, max = 1, limit = 60000) => {

        let m = await msg.channel.send(message);
        let c = await msg.channel.awaitMessages(filter || (m => m.author.id === msg.author.id), { max, time: limit, errors: [ "time" ] });

        m.delete();

        return c.first();

    };

    // For easy access.
    Object.mergeDefault = require("discord.js").Util.mergeDefault;

    Number.prototype.digit = function (count) {

        let res = this.toString();
        res = "0".repeat(res.length > count ? 0 : count - res.length) + res;
        
        return res;

    }

};
