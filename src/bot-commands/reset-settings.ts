import fs from "node:fs";
import path from "node:path";
import { errorOcurred } from "../embeds/embeds";
import { ClientAdaptation, SettingsOptions } from "../types/bot-types";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('reset-settings')
        .setDescription('Resets the server settings')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        const configFilePath = path.resolve(`guild-data/${interaction.guildId}.json`);
        const emptyGuildSettings: SettingsOptions = {};
        const settingsOutputToFile = JSON.stringify(emptyGuildSettings);

        fs.writeFile(configFilePath, settingsOutputToFile, 'utf-8', async (err) => {
            if(err){
                console.log(`[ERROR] There was an error clearing the settings file for guild "${interaction.guild?.name}"`);
                console.log(err);
                await interaction.editReply({embeds: [errorOcurred('There was an error clearing the server settings', clientAdapter)]});
            }
            console.log(`[INFO] Cleared settings file for guild: ${interaction.guild?.name}`);
            await interaction.editReply(`:white_check_mark: **Successfully cleared the server settings**`);
        })
    },
}