import { errorOcurred } from "../embeds/embeds";
import { ClientAdaptation } from "../types/bot-types";
import { isUserInVoiceChannel } from "../utils/voice-connection";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes the bot but the music keeps playing')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const userVoiceChannelId = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannelId){
            return;
        }

        const botVoiceChannel = interaction.guild?.members.me?.voice;
        if(botVoiceChannel?.channelId){
            botVoiceChannel.setMute(true);
        } else {
            console.log(`[WARNING] Muting failed because bot is not connected to voice in guild "${interaction.guild?.name}"`);
            await interaction.editReply({embeds: [errorOcurred('Muting is only possible while the bot is in a voice channel', clientAdapter)]});
            return;
        }

        await interaction.editReply(':mute: **Muting the bot**');
    },
}