import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ClientAdaptation } from "..";
import { isUserInVoiceChannel, leaveVoiceChannel } from "../voice-connection";

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

        interaction.guild?.members.me?.voice.setMute(true);

        await interaction.editReply('Muting the song');
    },
}