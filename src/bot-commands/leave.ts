import { ClientAdaptation, SettingsOptions } from "../types/bot-types";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { isUserInVoiceChannel, leaveVoiceChannel } from "../utils/voice-connection";

export default {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leaves the voice channel and removes the songs from the queue')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, guildConfig: SettingsOptions){
        await interaction.deferReply();

        const userVoiceChannelId = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannelId){
            return;
        }

        leaveVoiceChannel(interaction, clientAdapter, guildConfig);

        await interaction.editReply('**Leaving voice channel**');
    },
}