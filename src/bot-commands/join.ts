import { errorOcurred } from "../embeds/embeds";
import { joinVoiceChannel } from "@discordjs/voice";
import { isUserInVoiceChannel } from "../utils/voice-connection";
import { ClientAdaptation, SettingsOptions } from "../types/bot-types";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Joins your current voice channel')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, guildConfig: SettingsOptions){
        await interaction.deferReply();
        
        const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;

        if(guildConfig.canJoinAnotherChannel === false && customGuild.voiceConnection){
            await interaction.editReply({embeds: [errorOcurred('The bot is not allowed to move to another channel', clientAdapter)]});
            return;
        }

        const userVoiceChannelId = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannelId){
            return;
        }   

        const connection = joinVoiceChannel({
            adapterCreator: interaction.guild!.voiceAdapterCreator,
            channelId: userVoiceChannelId,
            guildId: interaction.guildId!,
        });

        customGuild.voiceConnection = connection;

        console.log(`[INFO] Joining voice channel with id "${userVoiceChannelId}" in guild "${interaction.guild?.name}"`);
        await interaction.editReply('**Joining voice channel**');
    },
}