import ytsr from "ytsr";
import ytdl from "ytdl-core";
import { ClientAdaptation, CustomGuild, Song } from "../types/bot-types";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { createVoiceConnection, leaveVoiceChannel } from "../utils/voice-connection";
import { StreamType, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { embedAddedSongToQueue, embedErrorOcurred, embedNowPlayingSong } from "../utils/embed-responses";

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
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        var searchString = interaction.options.get('search')?.value as string;
        const isValidUrl = ytdl.validateURL(searchString);

        if(!isValidUrl){
            try {
                const searchResults = await ytsr(searchString, {limit: 1}); // some weird error gets printed to the console but doesn't affect the actual output
                const resultItem = searchResults.items[0] as any;
                searchString = resultItem.url as any;
            } catch (error) {
                console.log(`[ERROR] There was en error searching for '${searchString}' in guild "${interaction.guild?.name}`);
                await interaction.editReply({embeds: [embedErrorOcurred(`There was en error searching for **${searchString}**`, clientAdapter)]});
                return;
            }
        }

        if(await createVoiceConnection(interaction, clientAdapter)){    
            createAudioPlayerForGuild(interaction, clientAdapter);
            addSongToGuildQueue(interaction, clientAdapter, searchString);
        }
    },
}

async function addSongToGuildQueue(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, ytUrl: string) {
    console.log(`[INFO] Fetching Video Information for guild: "${interaction.guild?.name}" and url: "${ytUrl}"`);

    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;

    const songInfo = await ytdl.getBasicInfo(ytUrl);
    const videoDetails = songInfo.videoDetails;

    const song: Song = {
        url: ytUrl,
        title: videoDetails.title,
        thumbnailUrl: videoDetails.thumbnails[3].url, // size: 336 x 188 px
        authorName: videoDetails.author.name,
        duration: videoDetails.lengthSeconds,
        requestedByUsername: interaction.user.username,  
        requestedByTag: interaction.user.tag,          
    }
    customGuild.songQueue.push(song);

    if(customGuild.player!.checkPlayable()){
        await interaction.editReply({embeds: [embedAddedSongToQueue(song, interaction, clientAdapter)]});
        console.log(`[INFO] Added song: "${song.title}" to the queue in guild "${interaction.guild?.name}"`);
        return;
    } else {
        playSongFromQueue(interaction, clientAdapter);
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
        await interaction.channel?.send({embeds: [embedErrorOcurred(`There was an error playing this song, skipping to the next song`, clientAdapter)]});
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

async function playSongFromQueue(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation) {
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
                var song = customGuild.songQueue.at(0)!;
            } else {
                var song = customGuild.songQueue.shift()!;
            }
            playNextSongInQueue(song, customGuild);
            customGuild.currentSong = song;
        } catch (error) {
            console.log('[ERROR] There was an error playing the song ');
            await interaction.channel?.send({embeds: [embedErrorOcurred('There was en error playing that song, skipping ahead', clientAdapter)]});
            continue;
        }
        
        if(isFirstIteration){
            isFirstIteration = false;
            await replyWithSongInfo(song, interaction, clientAdapter);
        }
        

        while(!customGuild.currentResource?.ended){
            await sleep(1000);
        }
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

async function replyWithSongInfo(song: Song, interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
    if(!song){ return; }

    const embed = embedNowPlayingSong(song, interaction, clientAdapter);
    console.info(`[INFO] Now playing "${song.title}" requested by "${song.requestedByUsername}" in guild "${interaction.guild?.name}"`);
    if(interaction.replied){
        await interaction.channel?.send({embeds: [embed]});
    } else {
        await interaction.editReply({embeds: [embed]});
    }
}

function sleep(ms: number){
    return new Promise(r => setTimeout(r, ms))
}