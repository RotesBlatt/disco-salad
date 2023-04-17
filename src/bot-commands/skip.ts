import { ClientAdaptation } from "../types/bot-types";
import { embedErrorOcurred } from "../utils/embed-responses";
import { isUserInVoiceChannel } from "../utils/voice-connection";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current playing song')
        .addNumberOption(input => input
            .setName('to')
            .setDescription('Skips all songs up to the provided position in the queue')
            .setRequired(false)
            )
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const skipToValue = interaction.options.get('to')?.value as number;

        const userVoiceChannel = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannel){
            return;
        }

        const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
        if(!customGuild.currentSong){
            console.log(`[WARNING] Can not skip song because no song is playing in guild "${interaction.guild?.name}"`);
            await interaction.editReply({embeds: [embedErrorOcurred("Can not skip song because no song is playing", clientAdapter)]});
        } 

        if(!await skipToSongInQueue(interaction, clientAdapter, skipToValue)){return;}

        const successfulSkip = customGuild.player!.stop();
        if(successfulSkip){
            const reply = skipToValue ? `:track_next: **Skipped ${skipToValue} songs**` : ":track_next: **Skipping song**";
            await interaction.editReply(reply);
        } else {
            await interaction.editReply({embeds: [embedErrorOcurred("Something went wrong while skipping your song", clientAdapter)]});
        }
    },
}

async function skipToSongInQueue(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, skipTo: number){
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;

    if(!skipTo) {return true;}
    var shiftValue = skipTo;

    if(customGuild.loopFirstInQueue || customGuild.loopSongQueue){
        shiftValue += 1;
    }

    if(!(skipTo > 0 && shiftValue <= customGuild.songQueue.length)){
        console.log(`[WARNING] Can not skip to specific song because ${skipTo} is not a valid position in the queue in guild "${interaction.guild?.name}"`);
        await interaction.editReply({embeds: [embedErrorOcurred(`Can not skip to specific song because ${skipTo} is not a valid position in the queue`, clientAdapter)]});
        return false;
    }

    for(var i = 0; i < shiftValue - 1; i++){
        customGuild.songQueue.shift();
    }
    return true;
}