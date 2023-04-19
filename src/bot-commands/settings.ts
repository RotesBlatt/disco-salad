import { errorOcurred } from "../embeds/embeds";
import { ClientAdaptation } from "../types/bot-types";
import { isUserInVoiceChannel } from "../utils/voice-connection";
import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Set up your server with some extra features')
        .addChannelOption(option => option
            .setName('text-channel')
            .setDescription('The text channel in which the bot will accept commands')
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText)
            )
        .addChannelOption(option => option
            .setName('voice-channel')
            .setDescription('The voice channel which the bot will join automatically')
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildVoice)
            )
        .addIntegerOption(option => option
            .setName('limit')
            .setDescription('The maximum amount of songs added from a YouTube playlist')
            .setRequired(false)
            )
        .addStringOption(option => option
            .setName('leave-sound')
            .setDescription('Insert a YouTube url which will be played before leaving the channel automatically')
            .setRequired(false)
            )
        .addBooleanOption(option => option
            .setName('show')
            .setDescription('Whether or not the bot should always show the current playing song')
            .setRequired(false)
            )
        .addRoleOption(option => option
            .setName('roles')
            .setDescription('The roles that are able to use the bot')
            .setRequired(false)
            )
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const textChannelOption = interaction.options.getChannel('text-channel', false, [ChannelType.GuildText]);
        const voiceChannelOption = interaction.options.getChannel('voice-channel', false, [ChannelType.GuildVoice]);
        const playlistLimitOption = interaction.options.getInteger('limit', false);
        const leaveSoundOption = interaction.options.getString('leave-sound', false);
        const alwaysShowSongOption = interaction.options.getBoolean('show', false);
        const rolesOption = interaction.options.getRole('roles', false);
        
        console.log({textChannelOption, voiceChannelOption, playlistLimitOption, leaveSoundOption, alwaysShowSongOption, rolesOption})

        await interaction.editReply('Replying as settings')
    },
}