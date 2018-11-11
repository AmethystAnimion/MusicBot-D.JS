
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
                this.enqueue(item);
                break;

            case PlayMode.REPEAT_ONE:
                item = this.__items[0];
                break;
            
            case PlayMode.SHUFFLE:
                item = this.__items.splice(Math.floor(Math.random() * this.__items.length), 1);
                break;
            
            case PlayMode.SHUFFLE_REPEAT:
                item = this.__items.splice(Math.floor(Math.random() * (this.__items.length - 1)), 1);
                this.enqueue(item);
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

    constructor (client, serverID, logChannelID) {

        this.client = client || null;
        this.id = serverID;
        this.logChannelID = logChannelID;
        this.queue = new MusicQueue();

    }

    get server () {

        return this.client.guilds.get(this.id);

    }

    get connection () {

        return this.server ? this.server.voiceConnection : null;

    }

    get dispatcher () {

        return this.connection ? this.connection.dispatcher : null;

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

}

class Song {

    constructor (client, userID, title, author, duration, url, thumbnailURL, options = {}) {

        this.options = Object.mergeDefault(SongDefaultOptions, options);
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

const SongDefaultOptions = {

    volume: 1,
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

        end: async (info, reason) => {

            info.client.commands.find(c => c.help.name === "music").play(info = info);

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

async function getSongsFromYouTube (client, user, query) {

    let { results } = await search(query, {

        maxResults: 10,
        key: process.env.YT_API_KEY

    });

    let res = []
    for (var info of results)
        res.push(await getSongFromYouTubeURL(client, user, info.link));
    
    return res;

}

function createSong (client, user, videoInfo, options) {

    return new Song(client, user.id, videoInfo.title, videoInfo.author, videoInfo.length_seconds, videoInfo.video_url, videoInfo.thumbnail_url, options);

}

function initializeConnection (info) {

    for (var [ event, callback ] of Object.entries(callbacks.connection))
        info.connection.on(event, (...args) => callback(info, ...args));

    info.connection.isInitialized = true;
    
}

function initializeDispatcher (info) {

    for (var [ event, callback ] of Object.entries(callbacks.dispatcher))
        info.dispatcher.on(event, (...args) => callback(info, ...args));

    info.dispatcher.isInitialized = true;

}

module.exports = {

    MusicQueue,
    ServerMusicInfo,
    Song,
    PlayMode,
    SongDefaultOptions,
    getSongFromYouTubeURL,
    getSongsFromYouTube,
    isValidYoutubeURL: ytdl.validateURL,
    callbacks,
    initializeConnection,
    initializeDispatcher

};
