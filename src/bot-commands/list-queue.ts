import { isUserInVoiceChannel } from "../utils/voice-connection";
import { ClientAdaptation, CustomGuild } from "../types/bot-types";
import { embedErrorOcurred, embedShowSongQueueToUser, rowButtonsQueuePages } from "../utils/embed-responses";
import {  ButtonInteraction, ChatInputCommandInteraction, InteractionCollector, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current songs in the queue')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const userVoiceChannelId = await isUserInVoiceChannel(interaction, clientAdapter);
        if(!userVoiceChannelId){
            return;
        }

        const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;

        if(customGuild.songQueue.length === 0 || !customGuild.currentSong){
            console.log(`[WARNING] Can not show song queue because no song is in the queue in guild "${interaction.guild?.name}"`);
            await interaction.editReply({embeds: [embedErrorOcurred("Can not show song queue because no song is playing or the queue is empty", clientAdapter)]});
            return;
        }

        const timeInMinutes = 2 * 60 * 1000; // 2 minutes
        const collectorBack = setUpCollectorBack(interaction, clientAdapter, timeInMinutes);
        const collectorNext = setUpCollectorNext(interaction, clientAdapter, timeInMinutes);
        
        stopCollector(collectorBack as any, collectorNext as any, customGuild, interaction);

        const pages = Math.ceil(customGuild.songQueue.length / 10);

        const row = rowButtonsQueuePages();
        customGuild.songQueuePageIndex = 1;

        console.log(`[INFO] Showing song queue with ${customGuild.songQueue.length} songs in guild "${interaction.guild?.name}"`);
        await interaction.editReply({embeds: [embedShowSongQueueToUser(interaction, clientAdapter, customGuild.songQueuePageIndex)], components: pages === 1 ? [] : [row]});
    },
}

function setUpCollectorBack(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, timeInMinutes: number){
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
    const collector = interaction.channel?.createMessageComponentCollector({time: timeInMinutes, filter: (i) => i.customId === 'back', dispose: true})!;

    collector.on('collect', async i => {
        const index = customGuild.songQueuePageIndex - 1;
        if(index <= 0){
            await i.update({embeds: [embedShowSongQueueToUser(i as any, clientAdapter, customGuild.songQueuePageIndex)]});
            return;
        }
        customGuild.songQueuePageIndex = index;
        await i.update({embeds: [embedShowSongQueueToUser(i as any, clientAdapter, customGuild.songQueuePageIndex)]});
    });

    collector.on("end", () => {
        customGuild.lastQueueInteraction = undefined;
        collector.stop();
    })

    return collector;
}

function setUpCollectorNext(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, timeInMinutes: number){
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
    const collector = interaction.channel?.createMessageComponentCollector({time: timeInMinutes, filter: (i) => i.customId === 'next', dispose: true})!;

    collector.on('collect', async i => {
        const maxPages = Math.ceil(customGuild.songQueue.length / 10);
        const index = customGuild.songQueuePageIndex + 1;
        if(index > maxPages){
            await i.update({embeds: [embedShowSongQueueToUser(i as any, clientAdapter, customGuild.songQueuePageIndex)]});
            return;
        }
        customGuild.songQueuePageIndex += 1;
        await i.update({embeds: [embedShowSongQueueToUser(i as any, clientAdapter, customGuild.songQueuePageIndex)]});
    });

    collector.on("end", () => {
        customGuild.lastQueueInteraction = undefined;
        collector.stop();
    })

    return collector;
}

function stopCollector(collectorBack: InteractionCollector<ButtonInteraction>, collectorNext: InteractionCollector<ButtonInteraction>, customGuild: CustomGuild, interaction: ChatInputCommandInteraction){
    if(customGuild.lastQueueInteraction){
        collectorBack.stop();
        collectorNext.stop();
        customGuild.lastQueueInteraction = interaction;
    } else {
        customGuild.lastQueueInteraction = interaction;
    }
}