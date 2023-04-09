import { ClientAdaptation } from "../types/bot-types";
import { clearCustomGuildProperties, isUserInVoiceChannel } from "../utils/voice-connection";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the current playing song and clears the song queue')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const userVoiceChannel = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannel){
            return;
        }

        const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
        if(!customGuild.player){
            console.log(`[WARNING] Can not stop the bot because nothing is playing in guild "${interaction.guild?.name}"`)
            await interaction.editReply("Can not stop the bot because nothing is playing");
            return;
        } 

        customGuild.player.stop();
        customGuild.player = undefined;
        clearCustomGuildProperties(interaction, clientAdapter);

        console.log(`[INFO] Stopped the current playing song and cleared the song queue in guild "${interaction.guild?.name}"`);
        await interaction.editReply("Stopped the current playing song and cleared the song queue");
    },
}