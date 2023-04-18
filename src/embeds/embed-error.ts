import { EmbedBuilder } from "discord.js";
import { ClientAdaptation, EmbedColors } from "../types/bot-types";

function embedErrorOcurred(errorMessage: string, clientAdapter: ClientAdaptation){
    const embedMessage = new EmbedBuilder()
        .setColor(EmbedColors.ERROR)
        .setTitle(`:x: ${errorMessage}`)
        .setAuthor({name: 'Something went wrong', iconURL: clientAdapter.client.user?.avatarURL()!})
        .setTimestamp()

    return embedMessage;
}

export default embedErrorOcurred;