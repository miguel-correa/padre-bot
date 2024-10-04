const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const Canvas = require('@napi-rs/canvas');
const { getChristianImage } = require('../../utils/get-random-picture.js');
const path = require('path');
const fs = require('fs');

async function getVerse() {
	let verse, book;
	try {
		const response = await axios.get('https://www.bibliaon.com/api/getMoreVerse.php');
		if (response.status === 200) {
			const html = response.data;
			const $ = cheerio.load(html);
			verse = $('#versiculo_aleatorio')
				.contents()
				.filter(function() {
					return this.type === 'text';
				})
				.text()
				.trim();
			book = $('#versiculo_aleatorio a').text().trim();
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
		.setName('versiculo')
		.setDescription('Receba um versículo abençoado.'),
	async execute(interaction) {
		await interaction.deferReply();
		interaction.editReply('Consultando a bíblia sagrada...');

		const dayVerse = await getVerse();
		const im = await getChristianImage();
		const imagePath = path.resolve(__dirname, '../../resource/' + im[0] + '.png');

		// Scale the image down to fit in 1920x1080
		const scaleFactor = Math.min(1920 / im[1], 1080 / im[2]);

		const canvas = await Canvas.createCanvas(im[1] * scaleFactor, im[2] * scaleFactor);
		const context = canvas.getContext('2d');
		const image = await Canvas.loadImage(imagePath);
		context.drawImage(image, 0, 0, canvas.width, canvas.height);
		const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'bible.png' });

		if (attachment) {
			await interaction.editReply({ content: dayVerse.mainText + '\n' + dayVerse.book, ephemeral: false, files: [attachment] });
		}
		else {
			await interaction.editReply({ content: 'Could not load the image. Please try again later.', ephemeral: true });
		};

		fs.rm(imagePath, (err) => {
			if (err) {
				console.log('Unable to remove file at ' + imagePath);
				throw err;
			}
			console.log('File at \'' + imagePath + '\' removed.');
		});
	},
};

