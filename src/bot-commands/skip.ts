import { ClientAdaptation } from "../types/bot-types";
import { isUserInVoiceChannel } from "../utils/voice-connection";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current playing song')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const userVoiceChannel = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannel){
            return;
        }

        const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
        if(!customGuild.player){
            console.log(`[WARNING] Can not skip song because no song is playing in guild "${interaction.guild?.name}"`)
            await interaction.editReply("Can not skip song because no song is playing");
        } else {
            const successfulSkip = customGuild.player.stop();
            if(successfulSkip){
                await interaction.editReply("Skipping song");
            } else {
                await interaction.editReply("Something went wrong while skipping your song");
            }
        }
    },
}