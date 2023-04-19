import fs from "node:fs"; 
import path from "node:path";
import * as dotenv from "dotenv";
import loadAllCommands from "./utils/retrieve-commands";
import { ClientAdaptation, CustomGuild, SettingsOptions } from "./types/bot-types";
import { Client, Collection, Events, GatewayIntentBits, ActivityType } from "discord.js";

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

    const guildConfig: SettingsOptions = (await import(`../guild-data/${interaction.guildId}.json`, {assert: {type: "json"}})).default;

    if(guildConfig.textChannelId && guildConfig.textChannelId !== interaction.channelId){ 
        await interaction.reply({content: `You need to use the channel <#${guildConfig.textChannelId}> to use the bot`, ephemeral: true});
        return; 
    };

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
    const configFilePath = path.resolve(`guild-data/${guild.id}.json`);

    if(fs.existsSync(configFilePath)){
        console.log(`[INFO] Found config file for guild: ${guild.name}`);
        return;
    }

    const emptySettings: SettingsOptions = {};
    const settingsOutputToFile = JSON.stringify(emptySettings);

    fs.writeFile(configFilePath, settingsOutputToFile, 'utf-8', (err) => {
        if(err){
            console.log(`[ERROR] There was an error writing the settings file for guild ${guild.name}`);
            console.log(err);
        }
        console.log(`[INFO] Created a new settings file for guild: ${guild.name}`);
    })
});

clientAdapter.client.login(process.env.BOT_TOKEN!);