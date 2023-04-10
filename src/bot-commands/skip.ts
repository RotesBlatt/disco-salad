import { ClientAdaptation } from "../types/bot-types";
import { embedErrorOcurred } from "../utils/embed-responses";
import { isUserInVoiceChannel } from "../utils/voice-connection";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current playing song')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const userVoiceChannel = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannel){
            return;
        }

        const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
        if(!customGuild.player){
            console.log(`[WARNING] Can not skip song because no song is playing in guild "${interaction.guild?.name}"`)
            await interaction.editReply({embeds: [embedErrorOcurred("Can not skip song because no song is playing", clientAdapter)]});
        } else {
            const successfulSkip = customGuild.player.stop();
            if(successfulSkip){
                await interaction.editReply(":track_next: **Skipping song**");
            } else {
                await interaction.editReply({embeds: [embedErrorOcurred("Something went wrong while skipping your song", clientAdapter)]});
            }
        }
    },
}