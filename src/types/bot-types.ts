import { Client, Collection } from "discord.js";
import { AudioPlayer, AudioResource, VoiceConnection } from "@discordjs/voice";

export class CustomGuild {
    voiceConnection: VoiceConnection | undefined = undefined;
    player: AudioPlayer | undefined = undefined;
    currentResource: AudioResource | undefined = undefined;
    songQueue: Song[] = [];
    timeout: NodeJS.Timer | undefined = undefined;
}

export interface Song {
    title: string,
    url: string,
    requestedBy: string,
}

export interface ClientAdaptation {
    client: Client,
    commands: Collection<string, any>,
    guildCollection: Collection<string, CustomGuild>,
}