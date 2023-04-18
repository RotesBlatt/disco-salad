import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { ClientAdaptation, CustomGuild, EmbedColors, Song } from "../types/bot-types";
import { calculateRemainingSongTime, convertSecondsToHoursMinuteSeconds } from "./song-timing";

function embedShowSongQueueToUser(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, currentPage: number){
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;

    const pages = Math.ceil(customGuild.songQueue.length / 10);

    const embedMessage = new EmbedBuilder()
        .setColor(EmbedColors.SUCCESSFUL)
        .setTitle(`Queue for ${interaction.guild?.name}`)
        .setFooter({text: `Page ${currentPage}/${pages} | Loop: ${!customGuild.loopFirstInQueue ? '❌' : '✅'} | Queue Loop: ${!customGuild.loopSongQueue ? '❌' : '✅'}`, iconURL: interaction.user.avatarURL()!});

    
    const queueDescriptionSongs = createQueueBody(customGuild, 10, currentPage);
    const queueDescriptionAll = createBottomQueueBody(queueDescriptionSongs, customGuild);
    
    embedMessage.setDescription(queueDescriptionAll);

    return embedMessage;
}

function createQueueBody(customGuild: CustomGuild, maxIterations: number, page: number){
    var outputQueue = `__Now playing:__\n ${extractSongInformationForQueueDisplay(customGuild.currentSong!)}\n __Up Next:__\n`;

    var skipLoopingSong = false;
    if(customGuild.loopFirstInQueue){
        maxIterations += 1;
        skipLoopingSong = true;
    }

    const startIndex = Math.floor(((page-1)*10));

    for(var i = startIndex; i < customGuild.songQueue.length && i < maxIterations + startIndex; i++){
        if(skipLoopingSong && i === 0){ continue; }
        const song = customGuild.songQueue.at(i)!;
        outputQueue = outputQueue + `\n\`${skipLoopingSong ? i : i+1}.\` ${extractSongInformationForQueueDisplay(song)}\n`;
    }
    return outputQueue;
}

function createBottomQueueBody(queueDescription: string, customGuild: CustomGuild){
    var totalSongQueueDurationSeconds = calculateRemainingSongTime(customGuild);
    customGuild.songQueue.forEach((song, index) => {
        if(customGuild.loopFirstInQueue && index === 0) { return; }
        const seconds = Number(song.duration);
        totalSongQueueDurationSeconds += seconds;
    });

    const convertedTotalSongQueueDuration = convertSecondsToHoursMinuteSeconds(totalSongQueueDurationSeconds.toString())
    const songQueueLength = customGuild.loopFirstInQueue ? customGuild.songQueue.length - 1 : customGuild.songQueue.length;

    queueDescription = queueDescription + `\n **${songQueueLength} songs in queue | ${convertedTotalSongQueueDuration} total length**`;
    return queueDescription;
}

function extractSongInformationForQueueDisplay(song: Song){
    return `[${song?.title}](${song?.url}) | \`${convertSecondsToHoursMinuteSeconds(song?.duration!)} Requested by: ${song?.requestedByUsername} (${song?.requestedByTag})\``;
}

export default embedShowSongQueueToUser;