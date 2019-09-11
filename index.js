// Dependencies
const keys = require('./config/keys');
const express = require('express');
const {
	Client,
	RichEmbed
} = require('discord.js');
let RiotRequest = require('riot-lol-api');
let riotRequest = new RiotRequest(keys.riotAPIKey);
const token = keys.discordToken;

//Web Scraping
const request = require('request');
const cheerio = require('cheerio');

const helpers = require('./functions/helpers.js');
const PREFIX = '!';
const usedCommandRecently = new Set();
// Create an instance of a Discord client

const app = express();

const client = new Client();

client.on('ready', () => {
	console.log('Slumbot is running.');
});

client.on('message', async message => {
	let args = message.content.substring(PREFIX.length).split(" ");
	let name = helpers.nameBuild(args);
	let level = '';
	let summonerId = '';
	let rank = '';


	//Takes in summoner name and outputs basic summoner info
	switch (args[0]) {
		case 'info':
			if (usedCommandRecently.has(message.author.id)) {} else {
				message.reply('Carry on.');
				usedCommandRecently.add(message.author.id);
				setTimeout(() => {
					usedCommandRecently.delete(message.author.id)
				}, 2000)

				riotRequest.request('na1', 'summoner', `/lol/summoner/v4/summoners/by-name/${name}`,
					function (err, data) {
						if (err instanceof Error) {
							console.log(err);
						} else {
							level = data.summonerLevel;
							summonerId = data.id;
							riotRequest.request('na1', 'league', `/lol/league/v4/entries/by-summoner/${summonerId}`, function (err, data) {
								if (err instanceof Error) {
									console.log(err);
								} else {
									for (let x = 0; x < data.length; x++) {
										if (data[x].queueType == 'RANKED_SOLO_5x5') {
											rank = data[x].tier + " " + data[x].rank;
										}
									}
									// console.log(data);
									const embed = new RichEmbed()
										.setTitle(args[1])
										.setColor(0xFF0000)
										.setDescription(`Level: ${level} Rank: ${rank}`)
										.setImage(`http://avatar.leagueoflegends.com/na/${name}.png`);
									message.channel.send(embed);
								}
							})
						}
					});
			}
			break;

			//Live Match Lookup
		case 'match':
			riotRequest.request('na1', 'summoner', `/lol/summoner/v4/summoners/by-name/${name}`, function (err, data) {
				if (err instanceof Error) {
					console.log(err);
				} else {

					let botResponse = [];
					let rank = '';
					let resString = '';
					riotRequest.request('na1', 'spectator', `/lol/spectator/v4/active-games/by-summoner/${data.id}`, function (err, data) {
						if (err instanceof Error) {
							console.log(err);
						} else {
							for (let playerIndex = 0; playerIndex < 10; playerIndex++) {
								riotRequest.request('na1', 'league', `/lol/league/v4/entries/by-summoner/${data.participants[playerIndex].summonerId}`,
									function (err, playerInfo) {
										if (err instanceof Error) {
											console.log(err);
										} else {
											for (let x = 0; x < playerInfo.length; x++) {
												if (playerInfo[x].queueType == 'RANKED_SOLO_5x5') {
													rank = playerInfo[x].tier + " " + playerInfo[x].rank;
													botResponse.push(playerInfo[x].summonerName + " " + rank);
													resString += playerInfo[x].summonerName + " " + rank + "\n";
												}
											}
											if (playerIndex == 9) {
												const embed = new RichEmbed()
													.setTitle(args[1])
													.setColor(0xFF0000)
													.setDescription(resString)
													.setImage(`http://avatar.leagueoflegends.com/na/${name}.png`);
												message.channel.send(embed);
											}
										}
									})
							}
						}
					})
				}
			});
			break;

		case 'guide':
			if (usedCommandRecently.has(message.author.id)) {} else {
				usedCommandRecently.add(message.author.id);
				setTimeout(() => {
					usedCommandRecently.delete(message.author.id)
				}, 2000)

				request(`https://rankedboost.com/league-of-legends/build/${args[1]}/`, (error, response, html) => {
					if (!error && response.statusCode == 200) {
						const $ = cheerio.load(html);
						let res = '';

						//Items
						let buildOrder;
						let items = [];
						// const startingItems = $('.item-build-order-main').next();
						for (let x = 0; x <= 5; x++) {
							buildOrder = $('.item-build-order').eq(x).text();
							items.push(buildOrder);
						}


						//Summoner spells
						const spell1 = $('.rb-item-img').attr('alt');
						const spell2 = $('.rb-item-img').next().attr('alt');

						//Skill path
						const skillPath = $('.rb-build-ability-wrap').text();

						//Runes
						runes = [];
						for (let x = 0; x <= 10; x++) {
							rune = $('.rb-build-runes-keystone-slot').eq(x).text();
							runes.push(`${rune}`);
						}

						//Counters
						let top3Counters = [];
						let counters = '';
						for (let x = 5; x < 8; x++) {
							counters = $('.counters-sidebar-champ-name').eq(x).text();
							top3Counters.push(counters);
						}


						console.log(top3Counters.toString());

						//Formatting text
						runes[0] = `**${runes[0]}**`;
						runes[5] = `**${runes[5]}**`;

						res = `**${args[1]}**\nItems:\n${items[0]}\n${items[1]}\n${items[2]}\n${items[3]}\n${items[4]}\n\n**Runes**: \n${runes[0]}\n${runes[1]}\n${runes[2]}\n${runes[3]}\n${runes[4]}\n\n${runes[5]}\n${runes[6]}\n${runes[7]}\n\n${runes[8]}\n${runes[9]}\n${runes[10]}\n\n**Summoner spells:** ${spell1}, ${spell2}\n**Skill path:** ${skillPath.substring(0,5)}`;
						message.channel.send(res);
					}
				});

			}

			case 'tft':
				if (usedCommandRecently.has(message.author.id)) {

				} else {
					usedCommandRecently.add(message.author.id);
					setTimeout(() => {
						usedCommandRecently.delete(message.author.id)
					}, 2000)

					request(`https://tracker.gg/tft/profile/riot/NA/${name}/overview`, (error, response, html) => {
						if (!error && response.statusCode == 200) {
							const $ = cheerio.load(html);
							const stats = $('.numbers').text();
							let summonerData = helpers.parseData(stats);
							let rankData = $('.feature-text').text();
							let rank = rankData.split(" ");
							let rankLink = helpers.rankImg(rank[1]);
							const embed = new RichEmbed()
								.setTitle(`TFT Stats for ${name}`)
								.setColor(0xFF0000)
								.setDescription(`Rank: ${rank[1]} ${rank[2]} (${summonerData.lp} LP)\n
								Wins: ${summonerData.wins}\nLosses: ${summonerData.losses}\nWin %: ${summonerData.winpercent}\nTotal Matches: ${summonerData.matches}`)
								.setImage(`${rankLink}.png`);
							message.channel.send(embed);
						}
					});
				}
				case 'items':
					if (usedCommandRecently.has(message.author.id)) {

					} else {
						usedCommandRecently.add(message.author.id);
						setTimeout(() => {
							usedCommandRecently.delete(message.author.id)
						}, 2000)

						if (args.length < 2) {
							message.channel.send('Please add some champs to the command');
						} else {
							args = args.slice(1, args.length);
							let response = helpers.tftItems(args);
							console.log(response);
							message.channel.send(response);
						}


					}
					case 'build':
						if (usedCommandRecently.has(message.author.id)) {

						} else {
							usedCommandRecently.add(message.author.id);
							setTimeout(() => {
								usedCommandRecently.delete(message.author.id)
							}, 2000)


						}
	}
});

client.login(token);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));