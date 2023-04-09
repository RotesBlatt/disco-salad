import { ClientAdaptation } from "../types/bot-types";
import { isUserInVoiceChannel } from "../util/voice-connection";
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
        if(!customGuild.player){
            console.log(`[WARNING] Can not pause song because no song is playing in guild "${interaction.guild?.name}"`)
            await interaction.editReply("Can not pause song because no song is playing");
            return;
        } 

        const successfulPause = customGuild.player.pause(true);
        if(successfulPause){
            await interaction.editReply("Pausing song");
        } else {
            await interaction.editReply("Something went wrong while pausing your song");
        }
    },
}