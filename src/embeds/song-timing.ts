import { ChatInputCommandInteraction } from "discord.js";
import { ClientAdaptation, CustomGuild } from "../types/bot-types";

export function convertSecondsToHoursMinuteSeconds(durationSeconds: string){
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

export function calculateRemainingSongTime(customGuild: CustomGuild){
    return Math.floor(Number(customGuild.currentSong?.duration) - (customGuild.currentResource?.playbackDuration! / 1000));
}

export function estimateTimeUntilSongPlayed(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;

    var totalQueueLengthSeconds = 0;

    if(customGuild.songQueue.length !== 1){
        customGuild.songQueue.forEach((song, index) => {
            if(index === customGuild.songQueue.length - 1){return;}
            const seconds = Number(song.duration);
            totalQueueLengthSeconds += seconds;
        });
    }

    const currentSongRemainingTime = calculateRemainingSongTime(customGuild); // subtract played duration from total duration
    totalQueueLengthSeconds += currentSongRemainingTime; 

    const estimate = convertSecondsToHoursMinuteSeconds(totalQueueLengthSeconds.toString());
    return estimate;
}