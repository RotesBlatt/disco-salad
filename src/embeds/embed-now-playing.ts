import {convertSecondsToHoursMinuteSeconds} from "./song-timing";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { ClientAdaptation, EmbedColors, Song } from "../types/bot-types";

function embedNowPlayingSong(song: Song, interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
    const timeAlreadyPlayed = (Math.floor(customGuild.currentResource?.playbackDuration!/1000)).toString();
    const remainingDuration = `${convertSecondsToHoursMinuteSeconds(timeAlreadyPlayed)}/${convertSecondsToHoursMinuteSeconds(song.duration)}`;

    const embedMessage = new EmbedBuilder()
        .setColor(EmbedColors.SUCCESSFUL)
        .setTitle(song.title)
        .setURL(song.url)
        .setAuthor({name: 'Now playing', iconURL: clientAdapter.client.user?.avatarURL()!})
        .setThumbnail(song.thumbnailUrl)
        .addFields(
            {name: 'Channel', value: song.authorName, inline: true},
            {name: 'Remaining song duration', value: remainingDuration, inline: true},
        )
        .setFooter({text: `Requested by: ${song.requestedByUsername} (${song.requestedByTag})`});
    
        return embedMessage;
}

export default embedNowPlayingSong;