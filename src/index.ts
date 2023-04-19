import * as dotenv from "dotenv";
import {readFile} from "node:fs/promises"; 
import loadAllCommands from "./utils/retrieve-commands";
import { isUserFollowingServerSettings } from "./utils/permissions";
import { ClientAdaptation, CustomGuild, SettingsOptions } from "./types/bot-types";
import { Client, Collection, Events, GatewayIntentBits, ActivityType} from "discord.js";
import { createGuildSettingsIfNotExisting, removeGuildSettings } from "./utils/settings-file";

dotenv.config();

const botClient = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
]});

const clientAdapter: ClientAdaptation = {
    client: botClient,
    commands: new Collection(),
    guildCollection: new Collection(),
};

clientAdapter.client.once(Events.ClientReady, async c => {
    console.log(`[INFO] Logged in as ${c.user.tag}`);
    clientAdapter.commands = await loadAllCommands();
    clientAdapter.client.user?.setActivity({name: 'the music', type: ActivityType.Playing});
});

clientAdapter.client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) { return; };

    createGuildSettingsIfNotExisting(interaction.guild!);
    
    const filePath = `../guild-data/${interaction.guildId}.json`;
    const guildConfig: SettingsOptions = JSON.parse(
        await readFile(
            new URL(filePath, import.meta.url)
        ) as any,
    );
    
    if(!await isUserFollowingServerSettings(interaction, clientAdapter, guildConfig)){
        return;
    }

    if(!clientAdapter.guildCollection.has(interaction.guildId!)){
        clientAdapter.guildCollection.set(interaction.guildId!, new CustomGuild());
    }

    const command = clientAdapter.commands.get(interaction.commandName);
    if(!command){
        console.error(`[ERROR] No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction, clientAdapter, guildConfig);
    } catch (error) {
        console.error(error);
        await interaction.reply({content: 'There was en error while executing this command!', ephemeral: true});
    }
});

clientAdapter.client.on(Events.GuildCreate, guild => {
    createGuildSettingsIfNotExisting(guild)
});

clientAdapter.client.on(Events.GuildDelete, guild => {
    removeGuildSettings(guild);
})

clientAdapter.client.login(process.env.BOT_TOKEN!);