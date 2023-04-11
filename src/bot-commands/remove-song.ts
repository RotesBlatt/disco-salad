import { ClientAdaptation } from "../types/bot-types";
import { embedErrorOcurred } from "../utils/embed-responses";
import { isUserInVoiceChannel } from "../utils/voice-connection";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Removes the song at the specified position in queue')
        .addNumberOption(input => input
            .setName('position')
            .setDescription('The position of the song in the song queue')
            .setRequired(true),
            )
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const userVoiceChannel = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannel){
            return;
        }

        const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
        if(customGuild.songQueue.length === 0){
            console.log(`[WARNING] Can not remove song because no song is in song queue in guild "${interaction.guild?.name}"`)
            await interaction.editReply({embeds: [embedErrorOcurred("Can not remove song because no song is in the queue", clientAdapter)]});
            return;
        }

        var removeIndex = interaction.options.get('position')?.value as number - 1;
        const removedSong = customGuild.songQueue.splice(removeIndex, 1);
        
        console.log(`[INFO] Removed song at position ${removeIndex + 1} in song queue in guild "${interaction.guild?.name}"`)
        await interaction.editReply(`:white_check_mark: **REMOVED** \`${removedSong[0].title}\``);
    },
}