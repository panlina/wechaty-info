/** @typedef { import("wechaty").Wechaty } Wechaty */
/** @typedef { import("wechaty").Message } Message */
/** @typedef { import("wechaty").Sayable } Sayable */
/** @typedef { import("wechaty-puppet").ContactQueryFilter } ContactQueryFilter */
/** @typedef { import("wechaty-puppet").RoomQueryFilter } RoomQueryFilter */
/** @typedef {{ contact: ContactQueryFilter } | { room: RoomQueryFilter }} SayableQueryFilter */

/**
 * @param {Object} config
 * @param {SayableQueryFilter[]} [config.filter] the filter of contacts and rooms to enable this plugin
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
			if (
				message.text() == config.command
				&& (
					!config.filter || await (
						async from => (
							await Promise.all(
								config.filter.map(
									filter => sayableQueryFilterFactory(filter)(from)
								)
							)
						).some(Boolean)
					)(
						message.room() || message.talker()
					)
				)
			)
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
		function sayableQueryFilterFactory(/** @type {SayableQueryFilter} */filter) {
			return async function (/** @type {Sayable} */sayable) {
				if (filter.contact)
					return bot.puppet.contactQueryFilterFactory(filter.contact)(
						await bot.puppet.contactPayload(sayable.id)
					);
				if (filter.room)
					return bot.puppet.roomQueryFilterFactory(filter.room)(
						await bot.puppet.roomPayload(sayable.id)
					);
				return false;
			};
		}
	};
};
