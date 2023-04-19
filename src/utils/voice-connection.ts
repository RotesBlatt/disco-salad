import ytdl from "ytdl-core";
import { errorOcurred } from "../embeds/embeds";
import { ChatInputCommandInteraction } from "discord.js";
import { ClientAdaptation, SettingsOptions } from "../types/bot-types";
import { StreamType, createAudioResource, joinVoiceChannel } from "@discordjs/voice";

export async function createVoiceConnection(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, guildConfig: SettingsOptions) { 

    const userVoiceChannelId = await isUserInVoiceChannel(interaction, clientAdapter);
    if(!userVoiceChannelId){
        return false;
    }

    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
    if(!customGuild.voiceConnection){ 
        const connection = joinVoiceChannel({
            adapterCreator: interaction.guild!.voiceAdapterCreator,
            channelId: guildConfig.voiceChannelId ?? userVoiceChannelId,
            guildId: interaction.guildId!,
        });

        customGuild.voiceConnection = connection;
    }
    return true;
}

export async function isUserInVoiceChannel(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation) {
    const guild = clientAdapter.client.guilds.cache.get(interaction.guildId!)!;
    const user = guild.members.cache.get(interaction.member?.user.id!)!;
    const userVoiceChannel = user.voice.channel;

    if(!userVoiceChannel){
        console.log(`[WARNING] User is not in a voice channel in guild "${interaction.guild?.name}"`)
        await interaction.editReply({embeds: [errorOcurred('You need to be in a voice channel before you can interact with the bot', clientAdapter)]});
        return undefined;
    }
    return userVoiceChannel.id;
}

export async function leaveVoiceChannel(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, guildConfig: SettingsOptions) {
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;

    const soundUrl = guildConfig.leaveSoundUrl;
    if(soundUrl){
        try {
            const isValidVideoUrl = ytdl.validateURL(soundUrl);
            if(isValidVideoUrl){
                const stream = ytdl(soundUrl, {
                    filter: "audioonly", 
                    quality: "lowestaudio", 
                    liveBuffer: 3000,
                    highWaterMark: 1 << 22,
                });
                var resource = createAudioResource(stream, {inputType: StreamType.Arbitrary});
                customGuild.player!.play(resource);
        
                while(!resource.started || !resource.ended){
                    await sleep(50);
                }
            }
            
        } catch (error) {
            console.log(`[ERROR] There was an error playing the leaving sound`);
        }
    }
    

    console.log(`[INFO] Disconnecting voice channel in guild "${interaction.guild?.name}"`);
    customGuild.player?.removeAllListeners();
    customGuild.voiceConnection?.destroy(true);
    customGuild.player = undefined;
    customGuild.voiceConnection = undefined;
    clearCustomGuildProperties(interaction, clientAdapter);
}

export async function clearCustomGuildProperties(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation) {
    const customGuild = clientAdapter.guildCollection.get(interaction.guildId!)!;
    customGuild.currentResource = undefined;
    customGuild.currentSong = undefined;
    customGuild.songQueue = [];
    customGuild.loopFirstInQueue = false;
    customGuild.songQueuePageIndex = 1;
    customGuild.lastQueueInteraction = undefined;
}

function sleep(ms: number){
    return new Promise(r => setTimeout(r, ms))
}