import { ClientAdaptation } from "../types/bot-types";
import { isUserInVoiceChannel } from "../utils/voice-connection";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Loop or un-loop current playing song')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const userVoiceChannel = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannel){
            return;
        }

        const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
        if(!customGuild.currentSong){
            console.log(`[WARNING] Can not loop or un-loop song because no song is playing in guild "${interaction.guild?.name}"`)
            await interaction.editReply("Can not loop or un-loop song because no song is playing");
            return;
        } 

        customGuild.loopFirstInQueue = !customGuild.loopFirstInQueue;
        if(customGuild.loopFirstInQueue){
            customGuild.songQueue.unshift(customGuild.currentSong);
            await interaction.editReply("Looping current playing song");
        } else {
            customGuild.songQueue.shift();
            await interaction.editReply("Current song looping is now disabled");
        }
    },
}