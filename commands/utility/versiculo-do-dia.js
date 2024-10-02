const { SlashCommandBuilder, blockQuote, TextInputStyle, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const Canvas = require('@napi-rs/canvas');
// const fs = require('fs');

async function getVerse() {
	let verse, book;
	try {
		const response = await axios.get('https://www.bibliaon.com/versiculo_do_dia/');
		if (response.status === 200) {
			const html = response.data;
			const $ = cheerio.load(html);
			verse = $('#versiculo_hoje')
				.contents()
				.filter(function() {
					return this.type === 'text';
				})
				.text()
				.trim();
			book = $('#versiculo_hoje a').text().trim();
		}
	}
	catch (err) {
		console.log(err);
	}

	return {
		mainText: verse,
		book: book,
	};

}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('versiculo-do-dia')
		.setDescription('Receba um versículo abençoado.'),
	async execute(interaction) {
		const dayVerse = await getVerse();

		const canvas = Canvas.createCanvas(1000, 667);
		const context = canvas.getContext('2d');
		const image = await Canvas.loadImage('./resource/bible.png');

		context.drawImage(image, 0, 0, canvas.width, canvas.height);

		const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'bible.png' });

		await interaction.reply({ content: dayVerse.mainText + '\n' + dayVerse.book, ephemeral: false, files: [attachment] });
	},
};

