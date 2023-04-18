import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { ClientAdaptation, EmbedColors, Song } from "../types/bot-types";
import { convertSecondsToHoursMinuteSeconds, estimateTimeUntilSongPlayed} from "./song-timing";

function embedAddedSongToQueue(song: Song, interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation): EmbedBuilder {
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
    const positionInQueue = customGuild.loopFirstInQueue || customGuild.loopSongQueue ? (customGuild.songQueue.length - 1).toString()  : customGuild.songQueue.length.toString();
    const embedMessage = new EmbedBuilder()
        .setColor(EmbedColors.SUCCESSFUL)
        .setTitle(song.title)
        .setURL(song.url)
        .setAuthor({name: 'Added Song', iconURL: clientAdapter.client.user?.avatarURL()!})
        .setThumbnail(song.thumbnailUrl)
        .addFields(
            {name: 'Channel', value: song.authorName, inline: true},
            {name: 'Song duration', value: convertSecondsToHoursMinuteSeconds(song.duration), inline: true},
            {name: 'Estimated time until playing', value: estimateTimeUntilSongPlayed(interaction, clientAdapter), inline: true},
            {name: 'Position in queue', value: positionInQueue}
        )
        .setTimestamp();
    
        return embedMessage;
}

export default embedAddedSongToQueue;