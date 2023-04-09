import fs from "node:fs";
import path from "node:path";
import { Collection } from "discord.js";

const loadAllCommands = async () => {
    const commands = new Collection<string, any>();
    const commandsFolderPath = path.resolve('./src/bot-commands');
    const commandsFolderPathImport = "../bot-commands"
    const commandFilesName = fs.readdirSync(commandsFolderPath).filter(file => file.endsWith('.ts'));

    for(let i = 0; i < commandFilesName.length; i++){
        const command = (await import(`${commandsFolderPathImport}/${commandFilesName[i]}`)).default;
        if('data' in command && 'execute' in command){
            commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${commandFilesName[i]} is missing a required "data" or "execute" property.`);
        }
    }

    console.log(`[INFO] Loaded all (${commandFilesName.length}) commands`);
    return commands;
}

export default loadAllCommands;