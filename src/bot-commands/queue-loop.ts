import { errorOcurred } from "../embeds/embeds";
import { ClientAdaptation } from "../types/bot-types";
import { isUserInVoiceChannel } from "../utils/voice-connection";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('queueloop')
        .setDescription('Loop or un-loop the song queue')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const userVoiceChannel = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannel){
            return;
        }

        const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
        if(customGuild.songQueue.length === 0 || !customGuild.currentSong || (customGuild.songQueue.length === 1 && customGuild.loopFirstInQueue)){
            console.log(`[WARNING] Can not loop or un-loop the song queue because the queue is empty in guild "${interaction.guild?.name}"`);
            await interaction.editReply({embeds: [errorOcurred("Can not loop or un-loop song queue because no song is in the queue", clientAdapter)]});
            return;
        } 

        customGuild.loopSongQueue = !customGuild.loopSongQueue;
        if(customGuild.loopSongQueue){
            customGuild.loopSongQueueIndex = 0;
            customGuild.songQueue.unshift(customGuild.currentSong!);
            await interaction.editReply(":repeat_one: **Enabled**");
        } else {
            for(var i = 0; i < customGuild.loopSongQueueIndex; i++){
                customGuild.songQueue.shift();
            }
            await interaction.editReply(":repeat_one: **Disabled**");
        }
    },
}