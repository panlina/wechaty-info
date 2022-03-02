/** @typedef { import("wechaty").Wechaty } Wechaty */
/** @typedef { import("wechaty").Message } Message */

/**
 * @param {Object} config
 * @param {string} config.command the message text to ask for the information
 * @param {() => Promise<string>} config.fetch the information fetcher
 */
module.exports = function WechatyInfoPlugin(config) {
	return function (/** @type {Wechaty} */bot) {
		bot.on("message", async (/** @type {Message} */message) => {
			if (message.text() == config.command) {
				var information = await config.fetch();
				var receiver = message.room() || message.talker();
				receiver.say(information);
			}
		});
	};
};
