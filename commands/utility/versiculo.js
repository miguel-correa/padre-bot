const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function getVerse() {
    try {
        const response = await axios.get('https://www.bibliaon.com/versiculo_do_dia/');
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            const verse = $('.v_dia .destaque').text().trim();
            return verse;
        }
    } catch (err) {
        console.log(err);
    }
    // axios.get('https://www.bibliaon.com/versiculo_do_dia/')
    // .then((response) => {
    //     if(response.status === 200) {
    //         const html = response.data;
    //             const $ = cheerio.load(html);
    //             const verse = [];
    //             $('.v_dia').each(function(i, elem) {
    //                 verse[i] = {
    //                     dayVerse : $(this).find('.destaque').text().trim()
    //                 }
    //             });
    //             return verse[0].dayVerse;
    //     }
    // }, (error) => console.log(err));

}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('versiculo')
        .setDescription('Receba um versículo abençoado.'),
    async execute(interaction) {
        const dayVerse =  await getVerse();
        await interaction.reply({content: dayVerse});
    },
}

