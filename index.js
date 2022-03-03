/** @typedef { import("wechaty").Wechaty } Wechaty */
/** @typedef { import("wechaty").Message } Message */

/**
 * @param {Object} config
 * @param {string} config.command the message text to ask for the information
 * @param {() => Promise<string>} config.fetch the information fetcher, fulfills with information and rejects with error message
 */
module.exports = function WechatyInfoPlugin(config) {
	return function (/** @type {Wechaty} */bot) {
		bot.on("message", async (/** @type {Message} */message) => {
			if (message.text() == config.command) {
				try { var information = await config.fetch(); }
				catch (/** @type {string} */e) { var error = e; }
				var receiver = message.room() || message.talker();
				await receiver.say(information || error);
			}
		});
	};
};
