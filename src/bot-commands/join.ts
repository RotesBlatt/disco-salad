import { joinVoiceChannel } from "@discordjs/voice";
import { ClientAdaptation } from "../types/bot-types";
import { isUserInVoiceChannel } from "../utils/voice-connection";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Joins your current voice channel')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const userVoiceChannelId = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannelId){
            return;
        }

        const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;

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