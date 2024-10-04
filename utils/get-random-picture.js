const { pexelsId } = require('../config.json');
const axios = require('axios');
const cheerio = require('cheerio');
const { arrayBuffer } = require('stream/consumers');
const fs = require('fs').promises;
const path = require('path');

function getRandomNumber(max) {
	return Math.floor(Math.random() * max);
}

const saveImage = async (url, filePath) => {
	try {
		const response = await axios.get(url, {
			responseType: 'arraybuffer',
		});
		await fs.writeFile(filePath, response.data);
	}
	catch (error) {
		console.error('Error saving the image:', error);
	}
};

function getDateTime() {
	const m = new Date();
	const dateString = '[' +
    m.getFullYear() + '/' +
    ('0' + (m.getMonth() + 1)).slice(-2) + '/' +
    ('0' + m.getDate()).slice(-2) + ' ' +
    ('0' + m.getHours()).slice(-2) + ':' +
    ('0' + m.getMinutes()).slice(-2) + ':' +
    ('0' + m.getSeconds()).slice(-2) +
	'] ';

	return dateString;
};

const getChristianImage = async () => {
	try {
		const response = await axios.get('https://api.pexels.com/v1/search', {
			headers: {
				'Authorization': pexelsId,
			},
			params: {
				query: 'catholicism',
				page: getRandomNumber(100) + 1,
				per_page: 10,
			},
		});
		if (response.status === 200) {
			const pictureIndex = getRandomNumber(10);
			const pictureUrl = response.data.photos[pictureIndex].src.original;
			const pictureId = response.data.photos[pictureIndex].id;
			const pictureWidth = response.data.photos[pictureIndex].width;
			const pictureHeight = response.data.photos[pictureIndex].height;

			const imagePath = path.resolve(__dirname, '../resource');

			await saveImage(pictureUrl, `${imagePath}/${pictureId}.png`);

			return [pictureId, pictureWidth, pictureHeight];
		}
	}
	catch (err) {
		console.log(err);
	}
};

exports.getChristianImage = getChristianImage;