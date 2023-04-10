import { Client, Collection } from "discord.js";
import { AudioPlayer, AudioResource, VoiceConnection } from "@discordjs/voice";

export class CustomGuild {
    voiceConnection: VoiceConnection | undefined = undefined;
    player: AudioPlayer | undefined = undefined;
    currentResource: AudioResource | undefined = undefined;
    currentSong: Song | undefined = undefined;
    songQueue: Song[] = [];
    timeout: NodeJS.Timer | undefined = undefined;
    loopFirstInQueue: boolean = false;
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