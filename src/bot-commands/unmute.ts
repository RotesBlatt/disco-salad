import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ClientAdaptation } from "..";
import { isUserInVoiceChannel, leaveVoiceChannel } from "../voice-connection";

export default {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Un-mutes the bot')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const userVoiceChannelId = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannelId){
            return;
        }

        interaction.guild?.members.me?.voice.setMute(false);

        await interaction.editReply('Un-muting the bot');
    },
}