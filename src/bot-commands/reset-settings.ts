import { errorOcurred } from "../embeds/embeds";
import { ClientAdaptation } from "../types/bot-types";
import { hasUserAdminPermissions } from "../utils/permissions";
import { createEmptyGuildSettings } from "../utils/settings-file";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('reset-settings')
        .setDescription('Resets the server settings')
        .setDMPermission(false),
    
    async execute(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation){
        await interaction.deferReply();

        if(!await hasUserAdminPermissions(interaction, clientAdapter)){
            return;
        }

        const success = createEmptyGuildSettings(interaction.guild!);
        if(success){
            await interaction.editReply(`:white_check_mark: **Successfully cleared the server settings**`);
        } else {
            await interaction.editReply({embeds: [errorOcurred('There was an error resetting the server settings', clientAdapter)]});
        }
        
    },
}