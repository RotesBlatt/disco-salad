import { ClientAdaptation } from "../types/bot-types";
import { isUserInVoiceChannel } from "../util/voice-connection";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

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

        const botVoiceChannel = interaction.guild?.members.me?.voice;
        if(botVoiceChannel?.channelId){
            botVoiceChannel.setMute(false);
        } else {
            console.log(`[WARNING] Un-muting failed because bot is not connected to voice in guild "${interaction.guild?.name}"`);
            await interaction.editReply('Un-muting is only possible while the bot is in a voice channel');
            return;
        }
        
        await interaction.editReply('Un-muting the bot');
    },
}