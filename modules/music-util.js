
// Made for Music Bot made by GinmaTheDev

const stream = require("stream");
const ytdl = require("ytdl-core");
const search = require("youtube-search");

class MusicQueue {

    constructor () {

        this.__items = new Array();
        this.mode = PlayMode.ADVANCE;

    }

    get length () {

        return this.__items.length;

    }

    set length (value) {

        this.__items.length = value;

    }

    get items () {

        return this.__items;

    }

    enqueue (...items) {

        this.__items.push(...items);

    }

    next () {

        let item;
        switch (this.mode) {
         
            case PlayMode.ADVANCE:
                item = this.__items.shift();
                break;
            
            case PlayMode.REPEAT:
                item = this.__items.shift();
                if (this.__items[-1])
                    this.__items.push(this.__items[-1]);
                break;

            case PlayMode.REPEAT_ONE:
                if (this.__items[-1])
                    this.__items.unshift(this.__items[-1]);
                item = this.__items.shift();
                break;

            case PlayMode.SHUFFLE:
                item = this.__items.splice(Math.floor(Math.random() * this.__items.length), 1);
                break;

            case PlayMode.SHUFFLE_REPEAT:
                item = this.__items.splice(Math.floor(Math.random() * this.__items.length), 1);
                if (this.__items[-1])
                    this.__items.push(this.__items[-1]);
                break;

        }

        this.__items[-1] = item;

        return item;

    }

    peek () {

        return this.__items[0];

    }

    clear () {

        this.__items = new Array();

    }

    *[Symbol.iterator] () {

        for (let i = 0; i < this.__items; i++)
            yield this.__items.shift();

    }

}

class ServerMusicInfo {

    constructor (client, serverID, logChannelID, options = {}) {

        this.client = client || null;
        this.id = serverID;
        this.logChannelID = logChannelID;
        this.dispatcher = null;
        this.queue = new MusicQueue();
        this.options = Object.mergeDefault(DefaultOptions, options);

    }

    get server () {

        return this.client.guilds.get(this.id);

    }

    get connection () {

        return this.server ? this.server.voiceConnection : null;

    }

    get voiceChannel () {

        return this.connection ? this.connection.channel : null;

    }

    get logChannel () {

        return this.server ? this.server.channels.get(this.logChannelID) : null;

    }

    get currentSong () {

        return this.queue.__items[-1];

    }

    set currentSong (value) {

        this.queue.__items[-1] = value;

    }

}

class Song {

    constructor (client, userID, title, author, duration, url, thumbnailURL) {

        this.client = client;
        this.title = title;
        this.author = author;
        this.durationSeconds = +duration; 
        this.url = url;
        this.thumbnailURL = thumbnailURL;
        this.__user = userID;

    }

    get durationString () {

        let seconds = this.durationSeconds % 60;
        let minutes = Math.floor(this.durationSeconds / 60) % 60;
        let hours = Math.floor(this.durationSeconds / 3600);
        
        return `${hours ? `${hours.digit(2)}:` : ""}${minutes.digit(2)}:${seconds.digit(2)}`;

    }

    get stream () {

        let stream = ytdl(this.url, { filter: "audioonly" });

        return stream;

    }

    get user () {

        return this.client.users.get(this.__user);

    }

}

const PlayMode = {

    ADVANCE: 0,
    REPEAT_ONE: 1,
    REPEAT: 2,
    SHUFFLE: 3,
    SHUFFLE_REPEAT: 4

};

const DefaultOptions = {

    volume: 0.5,
    bitrate: 48000

};

const callbacks = {

    connection: {

        authenticated: async (info) => {



        },

        disconnect: async (info) => {



        },

        error: async (info, e) => {



        },

        failed: async (info, e) => {



        },

        ready: async (info) => {



        },

        reconnecting: async (info) => {



        },

        warn: async (info, warning) => {



        }

    },

    dispatcher: {

        start: async (info) => {

            

        },

        error: (info, e) => {

            if (e instanceof Error)
                console.log(`\nDispatcher in ${info.server} has thrown an error:\n${e}\n`);

        }

    }

}

async function getSongFromYouTubeURL (client, user, url) {

    if (!ytdl.validateURL(url))
        return null;

    let info = await ytdl.getInfo(url);
    
    return createSong(client, user, info);

}

async function getSongsFromYouTube (client, user, query, limit = 10) {

    let { results } = await search(query, {

        maxResults: limit,
        key: process.env.YT_API_KEY

    });

    let res = []
    for (var info of results) {

        let song;
        try {

            song = await getSongFromYouTubeURL(client, user, info.link);
            

        }

        catch (e) {

            song = new Song(client, user.id, "Video not available", { name: "Unknown Author", channel_url: "https://www.youtube.com" }, 0, info.link, "https://www.youtube.com");

        }

        if (song)
            res.push(song);
    
    }

    return res;

}

function createSong (client, user, videoInfo) {

    return new Song(client, user.id, videoInfo.title, videoInfo.author, videoInfo.length_seconds, videoInfo.video_url, videoInfo.thumbnail_url);

}

module.exports = {

    MusicQueue,
    ServerMusicInfo,
    Song,
    PlayMode,
    getSongFromYouTubeURL,
    getSongsFromYouTube,
    isValidYoutubeURL: ytdl.validateURL,
    callbacks,
    createSong

};
