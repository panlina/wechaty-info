/** @typedef { import("wechaty").Wechaty } Wechaty */
/** @typedef { import("wechaty").Message } Message */

/**
 * @param {Object} config
 * @param {string} config.command the message text to ask for the information
 * @param {() => Promise<string>} config.fetch the information fetcher, fulfills with information and rejects with error message
 * @param {Object} config.throttle the throttle config
 * @param {number} config.throttle.timeout the timeout in milliseconds
 * @param {string} config.throttle.message the message to reply when throttled
 */
module.exports = function WechatyInfoPlugin(config) {
	return function (/** @type {Wechaty} */bot) {
		// throttle, based on https://stackoverflow.com/a/27078401/4127811
		var waiting = false;
		bot.on("message", async (/** @type {Message} */message) => {
			if (message.text() == config.command)
				if (!waiting) {
					try { var information = await config.fetch(); }
					catch (/** @type {string} */e) { var error = e; }
					var receiver = message.room() || message.talker();
					await receiver.say(information || error);
					waiting = true;
					setTimeout(function () {
						waiting = false;
					}, config.throttle?.timeout);
				} else
					if (config.throttle?.message) {
						var receiver = message.room() || message.talker();
						await receiver.say(config.throttle?.message);
					}
		});
	};
};
