import { ClientAdaptation } from "../types/bot-types";
import { embedErrorOcurred } from "../utils/embed-responses";
import { isUserInVoiceChannel } from "../utils/voice-connection";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the current paused song')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const userVoiceChannel = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannel){
            return;
        }

        const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
        if(!customGuild.currentSong){
            console.log(`[WARNING] Can not resume song because no song is playing in guild "${interaction.guild?.name}"`)
            await interaction.editReply({embeds: [embedErrorOcurred("Can not resume song because no song is playing", clientAdapter)]});
            return;
        }

        const successfulResume = customGuild.player!.unpause();
        if(successfulResume){
            await interaction.editReply(":play_pause: **Resuming song**");
        } else {
            await interaction.editReply({embeds: [embedErrorOcurred("Something went wrong while resuming your song", clientAdapter)]});
        }
    },
}