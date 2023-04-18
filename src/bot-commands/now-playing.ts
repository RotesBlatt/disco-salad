import { ClientAdaptation } from "../types/bot-types";
import { isUserInVoiceChannel } from "../utils/voice-connection";
import { errorOcurred, nowPlayingSong } from "../embeds/embeds";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('np')
        .setDescription('Shows you information about the current playing song')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const userVoiceChannelId = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannelId){
            return;
        }

        const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;

        if(!customGuild.currentSong){
            console.log(`[WARNING] Can not show current playing song because no song is playing in guild "${interaction.guild?.name}"`)
            await interaction.editReply({embeds: [errorOcurred("Can not show current playing song because no song is playing", clientAdapter)]});
            return;
        }
        
        const song = customGuild.currentSong!;
        console.info(`[INFO] Now playing "${song.title}" requested by "${song.requestedByUsername}" in guild "${interaction.guild?.name}"`);
        await interaction.editReply({embeds: [nowPlayingSong(song, interaction, clientAdapter)]});
    },
}