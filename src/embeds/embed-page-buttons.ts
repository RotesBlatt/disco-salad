import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

function embedRowButtonsQueuePages(){
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('back')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⏪')
                .setLabel('previous page'),
            new ButtonBuilder()
                .setCustomId('next')
                .setStyle(ButtonStyle.Primary)
                .setLabel('next page')
                .setEmoji('⏩'),

        );
    return row;
}

export default embedRowButtonsQueuePages;