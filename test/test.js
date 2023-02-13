/** @typedef { import("wechaty").Message } Message */
/** @typedef { import("wechaty").Contact } Contact */
/** @typedef { import("wechaty").Room } Room */

var assert = require('assert');
var { Wechaty, Message } = require('wechaty')
var { PuppetMock, mock: { Mocker } } = require('wechaty-puppet-mock');
var WechatyInfoPlugin = require('..');

it('', async () => {
	var mocker = new Mocker();

	var puppet = new PuppetMock({ mocker });
	var bot = new Wechaty({ puppet });
	bot.use(new WechatyInfoPlugin({
		command: "a",
		fetch: () => Promise.resolve("b")
	}));

	await bot.start();

	mocker.scan('https://github.com/wechaty', 1);
	var user = mocker.createContact();
	mocker.login(user);

	var contact = mocker.createContact();

	contact.say("a").to(user);

	var message = await waitForMessage(contact);
	assert.equal(message.text(), "b");

	await bot.stop();
});

/**
 * @param {Contact | Room} conversation
 * @return {Promise<Message>}
 */
function waitForMessage(conversation) {
	return new Promise(resolve => {
		conversation.once('message', resolve);
	});
}
