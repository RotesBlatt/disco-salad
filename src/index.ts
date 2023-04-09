import * as dotenv from "dotenv";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { VoiceConnection, AudioPlayer, AudioResource } from "@discordjs/voice";
import loadAllCommands from "./retrieve-commands";

dotenv.config();

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

const botClient = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
]});

const clientAdapter: ClientAdaptation = {
    client: botClient,
    commands: new Collection(),
    guildCollection: new Collection(),
    
} 

clientAdapter.client.once(Events.ClientReady, async c => {
    console.log(`[INFO] Logged in as ${c.user.tag}`);
    clientAdapter.commands = await loadAllCommands();
})

clientAdapter.client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;

    if(!clientAdapter.guildCollection.has(interaction.guildId!)){
        clientAdapter.guildCollection.set(interaction.guildId!, new CustomGuild());
    }

    const command = clientAdapter.commands.get(interaction.commandName);
    if(!command){
        console.error(`[ERROR] No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction, clientAdapter);
    } catch (error) {
        console.error(error);
        await interaction.reply({content: 'There was en error while executing this command!', ephemeral: true});
    }
})

clientAdapter.client.login(process.env.BOT_TOKEN!);