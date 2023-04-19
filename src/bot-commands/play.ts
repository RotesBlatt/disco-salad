import ytsr from "ytsr";
import ytpl from "ytpl";
import ytdl from "ytdl-core";
import fetch from 'node-fetch';
import spotifyUrlInfo from "spotify-url-info";
const spotifyInfo = spotifyUrlInfo(fetch);
import { ClientAdaptation, CustomGuild, SettingsOptions, Song } from "../types/bot-types";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { createVoiceConnection, leaveVoiceChannel } from "../utils/voice-connection";
import { StreamType, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { addedPlaylistToQueue, addedSongToQueue, errorOcurred, nowPlayingSong } from "../embeds/embeds";

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Searches and plays the song provided')
        .addStringOption(option => option
            .setName('search')
            .setDescription('The YouTube url or the name of the song you want to play')
            .setRequired(true)
            )
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, guildConfig: SettingsOptions){
        await interaction.deferReply();

        var searchString = interaction.options.get('search')?.value as string;
        const isValidVideoUrl = ytdl.validateURL(searchString);

        
        if(!isValidVideoUrl){
            try {
                const data = await spotifyInfo.getData(searchString);
                if(data.type === 'track'){
                    const firstArtistName = data.artists[0].name;
                    const url = await getUrlFromInput(`${data.name} ${firstArtistName} lyrics`);

                    await playFromUrl(interaction, clientAdapter, guildConfig, url);
                } else {
                    console.log(`[WARNING] Searching for '${data.type}' on spotify is not a valid option in "${interaction.guild?.name}`);
                    await interaction.editReply({embeds: [errorOcurred(`Playlist or artists links on spotify are not supported, try a single spotify track`, clientAdapter)]});
                }
                return;
            } catch (error){
                // Provided searchString is not a spotify link -> try searching for a playlist link in searchString
            }

            try {
                const playlistId = await ytpl.getPlaylistID(searchString);
                const playlist = await ytpl(playlistId, {limit: guildConfig.playlistLimit ?? 100});
                
                if(await createVoiceConnection(interaction, clientAdapter, guildConfig)){    
                    createAudioPlayerForGuild(interaction, clientAdapter);
                    addPlaylistSongsToGuildQueue(interaction, clientAdapter, guildConfig, playlist);
                }
                return;
            } catch (error) {
                // Provided searchString is not a playlist link -> try searching for the searchString itself
            }

            try {
                searchString = await getUrlFromInput(searchString);
            } catch (error) {
                console.log(`[ERROR] There was en error searching for '${searchString}' in guild "${interaction.guild?.name}`);
                await interaction.editReply({embeds: [errorOcurred(`There was en error searching for **${searchString}**`, clientAdapter)]});
                return;
            }
        }

        await playFromUrl(interaction, clientAdapter, guildConfig, searchString);
    },
}

async function playFromUrl(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, guildConfig: SettingsOptions, ytUrl: string){
    if(await createVoiceConnection(interaction, clientAdapter, guildConfig)){    
        createAudioPlayerForGuild(interaction, clientAdapter);
        addSongToGuildQueue(interaction, clientAdapter, guildConfig, ytUrl);
    }
}

async function getUrlFromInput(searchString: string){
    const filters = await ytsr.getFilters(searchString);
    const filter = filters.get('Type')!.get('Video');
    const searchResults = await ytsr(filter?.url!, {limit: 1, requestOptions: {}}); // some weird error gets printed to the console but doesn't affect the actual output
    const resultItem = searchResults.items[0] as any;
    return resultItem.url as string;
}

async function addPlaylistSongsToGuildQueue(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, guildConfig: SettingsOptions, playlist: ytpl.Result){
    console.log(`[INFO] Fetching Playlist songs for guild: "${interaction.guild?.name}"`);
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
    const userNickname = interaction.guild?.members.cache.get(interaction.user.id)?.nickname;

    playlist.items.forEach(async (video) => {
       const song: Song = {
        url: video.url,
        title: video.title,
        authorName: video.author.name,
        duration: video.durationSec?.toString()!,
        thumbnailUrl: video.thumbnails[3]?.url!,
        requestedByUsername: userNickname ?? interaction.user.username,
        requestedByTag: interaction.user.tag,
       } 
       customGuild.songQueue.push(song);
    })

    if(customGuild.player!.checkPlayable()){
        console.log(`[INFO] Added ${playlist.items.length} songs from the playlist to the queue in guild "${interaction.guild?.name}"`);
        await interaction.editReply({embeds: [addedPlaylistToQueue(playlist, interaction, clientAdapter)]});
    } else {
        playSongFromQueue(interaction, clientAdapter, guildConfig, playlist);
    }
}

async function addSongToGuildQueue(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, guildConfig: SettingsOptions, ytUrl: string) {
    console.log(`[INFO] Fetching Video Information for guild: "${interaction.guild?.name}" and url: "${ytUrl}"`);

    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;

    const song = await retrieveSongInformation(interaction, ytUrl);
    customGuild.songQueue.push(song);

    if(customGuild.player!.checkPlayable()){
        await interaction.editReply({embeds: [addedSongToQueue(song, interaction, clientAdapter)]});
        console.log(`[INFO] Added song: "${song.title}" to the queue in guild "${interaction.guild?.name}"`);
    } else {
        playSongFromQueue(interaction, clientAdapter, guildConfig, undefined);
    }
}

async function createAudioPlayerForGuild(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation) {
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
    if(customGuild.player){ return; }

    console.log(`[INFO] Creating audio player for guild: "${interaction.guild?.name}"`)
    const player = createAudioPlayer();
    player.on("error", async error => {
        console.log(`[ERROR] There was an error playing a song in guild "${interaction.guild}"`);
        console.log(error);
        await interaction.channel?.send({embeds: [errorOcurred(`There was an error playing this song, skipping to the next song`, clientAdapter)]});
    })
    .on("stateChange", (oldState, newState) => {
        if(oldState.status === "playing" && newState.status === "idle"){
            customGuild.timeout = setTimeout(() => {
                leaveVoiceChannel(interaction, clientAdapter);
            }, 5 * 60 * 1000); // 5 min before disconnect
        } else if (oldState.status === "buffering" && newState.status === "playing"){
            if(customGuild.timeout){
                clearInterval(customGuild.timeout);
            }
        }
    })

    customGuild.voiceConnection?.subscribe(player);
    customGuild.player = player;
}

async function playSongFromQueue(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, guildConfig: SettingsOptions, playlist: ytpl.Result | undefined) {
    console.log(`[INFO] Started playing in guild: "${interaction.guild?.name}"`);
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
    var isFirstIteration = true;

    while(customGuild.voiceConnection){
        
        if(customGuild.songQueue.length === 0 && customGuild.currentResource?.ended){ 
            customGuild.currentSong = undefined;
            console.log(`[INFO] The song queue is empty in guild "${interaction.guild?.name}"`)
            break;
        }

        try {
            if(customGuild.loopFirstInQueue){ 
                const index = customGuild.loopSongQueue ? customGuild.loopSongQueueIndex : 0;
                var song = customGuild.songQueue.at(index)!;
            } else if(customGuild.loopSongQueue){
                var song = customGuild.songQueue.at(customGuild.loopSongQueueIndex)!;
                shiftSongQueueIndex(customGuild);
            } else {
                var song = customGuild.songQueue.shift()!;
            }
            playNextSongInQueue(song, customGuild);
            customGuild.currentSong = song;
        } catch (error) {
            console.log('[ERROR] There was an error playing the song ');
            await interaction.channel?.send({embeds: [errorOcurred('There was en error playing that song, skipping ahead', clientAdapter)]});
            continue;
        }
        
        if(isFirstIteration || guildConfig.alwaysShowSong){
            const neverUsed = guildConfig; // This line is needed because otherwise the guildconfig variables do not update properly
            if(playlist && isFirstIteration){
                await replyWithPlaylistInfo(playlist, interaction, clientAdapter);
            } else {
                await replyWithSongInfo(song, interaction, clientAdapter);
            }
            isFirstIteration = false;
        }
        

        while(!customGuild.currentResource?.ended){
            await sleep(1000);
        }
    }
}

function shiftSongQueueIndex(customGuild: CustomGuild){
    customGuild.loopSongQueueIndex += 1;
    if(customGuild.loopSongQueueIndex > customGuild.songQueue.length){
        customGuild.loopSongQueueIndex = 0;
    }
}

function playNextSongInQueue(song: Song, customGuild: CustomGuild) {
    const stream = ytdl(song?.url, {
        filter: "audioonly", 
        quality: "lowestaudio", 
        liveBuffer: 3000,
        highWaterMark: 1 << 22,
    });
    var resource = createAudioResource(stream, {inputType: StreamType.Arbitrary});
    customGuild.player!.play(resource);
    customGuild.currentResource = resource;
}

async function retrieveSongInformation(interaction: ChatInputCommandInteraction, ytUrl: string){
    const songInfo = await ytdl.getBasicInfo(ytUrl);
    const videoDetails = songInfo.videoDetails;
    const userNickname = interaction.guild?.members.cache.get(interaction.user.id)?.nickname;

    const song: Song = {
        url: ytUrl,
        title: videoDetails.title,
        thumbnailUrl: videoDetails.thumbnails[3].url, // size: 336 x 188 px
        authorName: videoDetails.author.name,
        duration: videoDetails.lengthSeconds,
        requestedByUsername: userNickname ?? interaction.user.username,  
        requestedByTag: interaction.user.tag,          
    }
    return song;
}

async function replyWithSongInfo(song: Song, interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
    if(!song){ return; }

    const embed = nowPlayingSong(song, interaction, clientAdapter);
    console.info(`[INFO] Now playing "${song.title}" requested by "${song.requestedByUsername}" in guild "${interaction.guild?.name}"`);
    if(interaction.replied){
        await interaction.channel?.send({embeds: [embed]});
    } else {
        await interaction.editReply({embeds: [embed]});
    }
}

async function replyWithPlaylistInfo(playlist: ytpl.Result, interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
    const embed = addedPlaylistToQueue(playlist, interaction, clientAdapter);
    console.log(`[INFO] Added ${playlist.items.length} songs from the playlist to the queue in guild "${interaction.guild?.name}"`);
    if(interaction.replied){
        await interaction.channel?.send({embeds: [embed]});
    } else {
        await interaction.editReply({embeds: [embed]});
    }
}

function sleep(ms: number){
    return new Promise(r => setTimeout(r, ms))
}