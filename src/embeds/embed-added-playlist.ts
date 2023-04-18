import ytpl from "ytpl";
import { convertSecondsToHoursMinuteSeconds } from "./song-timing";
import { ClientAdaptation, EmbedColors } from "../types/bot-types";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

function embedAddedPlaylistToQueue(playlist: ytpl.Result, interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){

    var totalPlaylistDuration = 0;

    playlist.items.forEach((song) => {
        const seconds = Number(song.durationSec);
        totalPlaylistDuration += seconds;
    });
    const convertedPlaylistLength = convertSecondsToHoursMinuteSeconds(totalPlaylistDuration.toString());

    const embedMessage = new EmbedBuilder()
        .setColor(EmbedColors.SUCCESSFUL)
        .setTitle(playlist.title)
        .setURL(playlist.url)
        .setAuthor({name: 'Added playlist', iconURL: clientAdapter.client.user?.avatarURL()!})
        .setThumbnail(playlist.thumbnails[3]?.url)
        .addFields(
            {name: 'Playlist creator', value: playlist.author.name, inline: true},
            {name: 'Number of songs added', value: playlist.items.length.toString(), inline: true},
            {name: 'Playlist length', value: convertedPlaylistLength, inline: true },
        )
        .setTimestamp();
    return embedMessage;
}

export default embedAddedPlaylistToQueue;