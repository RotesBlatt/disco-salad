import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { ClientAdaptation, Song } from "../types/bot-types";

const EMBED_COLOR_ERROR = 0xff0000
const EMBED_COLOR_SUCCESSFUL = 0x0099FF;

export function embedAddedSongToQueue(song: Song, interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation): EmbedBuilder {
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
    const embedMessage = new EmbedBuilder()
        .setColor(EMBED_COLOR_SUCCESSFUL)
        .setTitle(song.title)
        .setURL(song.url)
        .setAuthor({name: 'Added Song', iconURL: clientAdapter.client.user?.avatarURL()!})
        .setThumbnail(song.thumbnailUrl)
        .addFields(
            {name: 'Channel', value: song.authorName, inline: true},
            {name: 'Song duration', value: convertSecondsToHoursMinuteSeconds(song.duration), inline: true},
            {name: 'Estimated time until playing', value: estimateTimeUntilSongPlayed(interaction, clientAdapter), inline: true},
            {name: 'Position in queue', value: customGuild.songQueue.length.toString()}
        )
        .setTimestamp();
    
        return embedMessage;
}

export function embedNowPlayingSong(song: Song, clientAdapter: ClientAdaptation){
    const embedMessage = new EmbedBuilder()
        .setColor(EMBED_COLOR_SUCCESSFUL)
        .setTitle(song.title)
        .setURL(song.url)
        .setAuthor({name: 'Playing Song', iconURL: clientAdapter.client.user?.avatarURL()!})
        .setThumbnail(song.thumbnailUrl)
        .addFields(
            {name: 'Channel', value: song.authorName, inline: true},
            {name: 'Song duration', value: convertSecondsToHoursMinuteSeconds(song.duration), inline: true},
        )
        .setFooter({text: `Requested by: ${song.requestedByUsername} (${song.requestedByTag})`});
    
        return embedMessage;
}

export function embedErrorOcurred(errorMessage: string, clientAdapter: ClientAdaptation){
    const embedMessage = new EmbedBuilder()
        .setColor(EMBED_COLOR_ERROR)
        .setTitle(`:x: ${errorMessage}`)
        .setAuthor({name: 'Something went wrong', iconURL: clientAdapter.client.user?.avatarURL()!})
        .setTimestamp()

    return embedMessage;
}

function convertSecondsToHoursMinuteSeconds(durationSeconds: string){
    const durationSecondsNumber = Number(durationSeconds);
    var hours: number | string   = Math.floor(durationSecondsNumber / 3600);
    var minutes: number | string = Math.floor((durationSecondsNumber - (hours * 3600)) / 60);
    var seconds: number | string = durationSecondsNumber - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    
    if(hours === "00"){
        return `${minutes}:${seconds}`;
    }

    return `${hours}:${minutes}:${seconds}`;
}

function estimateTimeUntilSongPlayed(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;

    var totalQueueLengthSeconds = 0;
    customGuild.songQueue.forEach((song, index) => {
        if(index === 0) {return;}
        const seconds = Number(song.duration);
        totalQueueLengthSeconds += seconds;
    });

    const currentSongRemainingTime = Math.floor(Number(customGuild.currentSong?.duration) - (customGuild.currentResource?.playbackDuration! / 1000)); // subtract played duration from total duration
    totalQueueLengthSeconds += currentSongRemainingTime; 

    const estimate = convertSecondsToHoursMinuteSeconds(totalQueueLengthSeconds.toString());
    return estimate;
}