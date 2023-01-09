/** @typedef { import("wechaty").Wechaty } Wechaty */
/** @typedef { import("wechaty").Message } Message */
/** @typedef { import("wechaty").Sayable } Sayable */
/** @typedef { import("wechaty-puppet").ContactQueryFilter } ContactQueryFilter */
/** @typedef { import("wechaty-puppet").RoomQueryFilter } RoomQueryFilter */
/** @typedef {{ contact: ContactQueryFilter } | { room: RoomQueryFilter }} SayableQueryFilter */

/**
 * @param {Object} config
 * @param {SayableQueryFilter[]} [config.filter] the filter of contacts and rooms to enable this plugin
 * @param {string | RegExp} config.command the message text or pattern to ask for the information
 * @param {(match?: RegExpMatchArray) => Promise<string>} config.fetch the information fetcher, fulfills with information and rejects with error message, accepts match result as parameter if `command` is `RegExp`
 * @param {Object} config.throttle the throttle config
 * @param {number} config.throttle.timeout the timeout in milliseconds
 * @param {string} config.throttle.message the message to reply when throttled
 */
module.exports = function WechatyInfoPlugin(config) {
	return function (/** @type {Wechaty} */bot) {
		// throttle, based on https://stackoverflow.com/a/27078401/4127811
		var waiting = {};
		bot.on("message", async (/** @type {Message} */message) => {
			var conversation = messageConversation(message);
			var match;
			if (
				(typeof config.command == 'string' ?
					message.text() == config.command :
					match = message.text().match(config.command)
				) && (
					!config.filter || (
						await Promise.all(
							config.filter.map(
								filter => sayableQueryFilterFactory(filter)(conversation)
							)
						)
					).some(Boolean)
				)
			)
				if (!waiting[conversation.id]) {
					try { var information = await config.fetch(match); }
					catch (/** @type {string} */e) { var error = e; }
					await conversation.say(information || error);
					waiting[conversation.id] = true;
					setTimeout(function () {
						waiting[conversation.id] = false;
					}, config.throttle?.timeout);
				} else
					if (config.throttle?.message)
						await conversation.say(config.throttle?.message);
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
		function messageConversation(/** @type {Message} */message) {
			return message.talker().self() ?
				message.room() || message.to() :
				message.conversation();
		}
	};
};
