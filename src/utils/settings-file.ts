import fs from "node:fs";
import path from "node:path";
import { SettingsOptions } from "../types/bot-types";
import { ChatInputCommandInteraction, Guild } from "discord.js";

export function createGuildSettingsIfNotExisting(guild: Guild){
    const configFilePath = path.resolve(`guild-data/${guild.id}.json`)

    if(!fs.existsSync(configFilePath)){
        createEmptyGuildSettings(guild);
    }
}

export function createEmptyGuildSettings(guild: Guild){
    const configFilePath = path.resolve(`guild-data/${guild.id}.json`)
    const emptySettings: SettingsOptions = {};
    const settingsOutputToFile = JSON.stringify(emptySettings);

    var success = true;

    fs.writeFile(configFilePath, settingsOutputToFile, 'utf-8', (err) => {
        if(err){
            console.log(`[ERROR] There was an error writing the settings file for guild "${guild?.name}"`);
            console.log(err);
            success = false;
            return;
        }
        console.log(`[INFO] Created a new settings file for guild: "${guild?.name}"`);
    });

    return success;
}

export function updateGuildSettings(interaction: ChatInputCommandInteraction, updatedData: SettingsOptions){
    const configFilePath = path.resolve(`guild-data/${interaction.guildId}.json`);
    const stringData = JSON.stringify(updatedData);

    var success = true;

    fs.writeFile(configFilePath, stringData, 'utf-8', async (err) => {
        if(err){
            console.log(`[ERROR] There was an error writing the settings file for guild "${interaction.guild?.name}"`);
            console.log(err);
            success = false;
        }
        console.log(`[INFO] Updated the settings file for guild: "${interaction.guild?.name}"`);
    });

    return success;
}

export function removeGuildSettings(guild: Guild){
    const configFilePath = path.resolve(`guild-data/${guild.id}.json`);

    fs.rm(configFilePath, (err) => {
        if(err){
            console.log(`[ERROR] There was an error deleting the settings file for guild "${guild?.name}"`);
            console.log(err);
            return;
        }
        console.log(`[INFO] Deleted server settings for guild: "${guild?.name}"`)
    })
}