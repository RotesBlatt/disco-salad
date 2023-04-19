import { ChatInputCommandInteraction, Client, Collection, ColorResolvable, Role, TextChannel, VoiceChannel } from "discord.js";
import { AudioPlayer, AudioResource, VoiceConnection } from "@discordjs/voice";

export class CustomGuild {
    voiceConnection: VoiceConnection | undefined = undefined;
    player: AudioPlayer | undefined = undefined;
    currentResource: AudioResource | undefined = undefined;
    currentSong: Song | undefined = undefined;
    songQueue: Song[] = [];
    songQueuePageIndex: number = 1;
    lastQueueInteraction: ChatInputCommandInteraction | undefined = undefined;
    timeout: NodeJS.Timer | undefined = undefined;
    loopFirstInQueue: boolean = false;
    loopSongQueue: boolean = false;
    loopSongQueueIndex: number = 0;
}

export interface Song {
    title: string,
    url: string,
    thumbnailUrl: string,
    authorName: string,
    duration: string,
    requestedByUsername: string,
    requestedByTag: string,
}

export interface ClientAdaptation {
    client: Client,
    commands: Collection<string, any>,
    guildCollection: Collection<string, CustomGuild>,
}

interface EmbedColor {
    SUCCESSFUL: ColorResolvable,
    ERROR: ColorResolvable,
}

export const EmbedColors: EmbedColor = {
    SUCCESSFUL: '#00aaff',
    ERROR: '#c71224',
};

export interface SettingsOptions {
    textChannelId?: string,
    voiceChannelId?: string,
    playlistLimit?: number,
    leaveSoundUrl?: string,
    alwaysShowSong?: boolean,
    allowedToUseRoleName?: string,
    canJoinAnotherChannel?: boolean,
}