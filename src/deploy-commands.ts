import fs from "node:fs";
import path from "node:path";
import * as dotenv from "dotenv";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

dotenv.config();

const commands: SlashCommandBuilder[] = [];
const commandsFolderPath = path.resolve("src/bot-commands");
const commandsFolderPathImport = "./bot-commands";
const commandFiles = fs.readdirSync(commandsFolderPath).filter(file => file.endsWith('.ts'));

async function loadCommands() {    
    commandFiles.forEach(async file => {
        const command = await import(`${commandsFolderPathImport}/${file}`);
        console.log(file)
        const commandAsJson = command.default.data.toJSON();
        commands.push(commandAsJson);
    });
}



const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);

async function deploy() {
    if(commands.length <= 0){
        setTimeout(() => deploy(), 1000);
        console.log('[INFO] Waiting for commands to load in');
        return;
    }
    try {
        console.log(`[INFO] Started refreshing ${commands.length} application (/) commands`);

        Routes.applicationGuildCommands
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!),
            {body: commands},
        ) as SlashCommandBuilder[];

        console.log(`[INFO] Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.log(error);
    }
}
await loadCommands();
await deploy();