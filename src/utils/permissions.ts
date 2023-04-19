import { errorOcurred } from "../embeds/embeds";
import { ClientAdaptation, SettingsOptions } from "../types/bot-types";
import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";


export async function hasUserAdminPermissions(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation) {
    const member = await interaction.guild?.members.fetch(interaction.user?.id);
    const isAdmin = member?.permissions.has(PermissionsBitField.Flags.Administrator);
    if(!isAdmin){
        await interaction.editReply({embeds: [errorOcurred('Only the server admins have access to this command', clientAdapter)]})
        return false;
    }

    return true;
}

export async function isUserFollowingServerSettings(interaction: ChatInputCommandInteraction, clientAdapter: ClientAdaptation, guildConfig: SettingsOptions) {
    const member = await interaction.guild?.members.fetch(interaction.user?.id);
    const isAdmin = member?.permissions.has(PermissionsBitField.Flags.Administrator);

    if(!isAdmin && guildConfig.allowedToUseRoleName && !member?.roles.cache.has(guildConfig.allowedToUseRoleName)){
        await interaction.reply({content: `You do not have the necessary role to use the bot`, ephemeral: true});
        return false;
    }

    if(!isAdmin && guildConfig.textChannelId && guildConfig.textChannelId !== interaction.channelId){ 
        await interaction.reply({content: `You need to use the channel <#${guildConfig.textChannelId}> to use the bot`, ephemeral: true});
        return false; 
    };

    return true;
}