import { errorOcurred } from "../embeds/embeds";
import { ClientAdaptation } from "../types/bot-types";
import { isUserInVoiceChannel } from "../utils/voice-connection";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the current playing song')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const userVoiceChannel = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannel){
            return;
        }

        const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
        if(!customGuild.currentSong){
            console.log(`[WARNING] Can not pause song because no song is playing in guild "${interaction.guild?.name}"`)
            await interaction.editReply({embeds: [errorOcurred("Can not pause song because no song is playing", clientAdapter)]});
            return;
        } 

        const successfulPause = customGuild.player!.pause(true);
        if(successfulPause){
            await interaction.editReply(":pause_button: **Pausing song**");
        } else {
            await interaction.editReply({embeds: [errorOcurred("Something went wrong while pausing your song", clientAdapter)]});
        }
    },
}