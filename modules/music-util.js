
// Made for Music Bot made by GinmaTheDev

const stream = require("stream");
const ytdl = require("ytdl-core");
const search = require("youtube-search");

class MusicQueue {

    constructor () {

        this._items = new Array();
        this.mode = PlayMode.ADVANCE;

    }

    get length () {

        return this.__items.length;

    }

    set length (value) {

        this.__items.length = value;

    }

    enqueue (...items) {

        this._items.push(...items);

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

        return this._items[0];

    }

    clear () {

        this.__items = new Array();

    }

    *[Symbol.iterator] () {

        for (let i = 0; i < this._items; i++)
            yield this._items.shift();

    }

}

class ServerMusicInfo {

    constructor (client, serverID, logChannelID) {

        this.client = client || null;
        this.id = serverID;
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

        return this.enqueue.__items[-1];

    }

}

class Song {

    constructor (client, userID, title, author, duration, url, thumbnailURL, stream, options = {}) {

        this.options = Object.mergeDefault(SongDefaultOptions, options);
        this.client = client;
        this.title = title;
        this.author = author;
        this.duration = duration; 
        this.url = url;
        this.thumbnailURL = thumbnailURL;
        this.__stream = stream;
        this.__user = userID;

    }

    get stream () {

        let newStream = new stream.PassThrough();
        let returnStream = new stream.PassThrough();

        this.__stream.pipe(newStream);
        this.__stream.pipe(returnStream);

        this.__stream = newStream;
        return returnStream;

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

            if (!info.logChannel)
                return;
            
            if (!info.currentSong)
                return;
            
            await info.logChannel.send({

                embed: {

                    author: { name: "Now Playing..." },
                    description: `Title: [${info.currentSong.title}](${info.currentSong.url})\nLength: ${info.currentSong.duration}\nAuthor: [${info.currentSong.author.name}](${info.currentSong.author.channel_url})\nRequested By: ${info.currentSong.user ? info.currentSong.user.tag : "Unknown User"}`,
                    thumbnail: { url: info.currentSong.thumbnailURL }

                }

            });

        },

        end: async (info, reason) => {

            let song = info.queue.next();
            if (!song)
                return;
            
            info.connection.playStream(song.stream);

        },

        error: async (info, e) => {

            console.log(`\nDispatcher in ${info.server} has thrown an error:\n${e.stack}\n`);

        }

    }

}

async function getSongFromYouTubeURL (client, user, url) {

    if (!ytdl.validateURL(url))
        return null;

    let stream = ytdl(url, { filter: "audioonly" });
    let info = await ytdl.getBasicInfo(url);
    
    return createSong(client, user, info, stream);

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

function createSong (client, user, videoInfo, stream, options) {

    return new Song(client, user.id, videoInfo.title, videoInfo.author, videoInfo.length_seconds, videoInfo.video_url, videoInfo.thumbnail_url, stream, options);

}

function initializeConnection (info) {

    for (var [ event, callback ] of Object.entries(callbacks.connection))
        info.connection.on(event, (...args) => callback.call(null, info, ...args));

    info.connection.isInitialized = true;
    
}

function initializeDispatcher (info) {

    for (var [ event, callback ] of Object.entries(callbacks.dispatcher))
        dispatcher.on(event, (...args) => callback.call(null, info, ...args));

    dispatcher.isInitialized = true;

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
