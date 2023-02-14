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

it('filter', async () => {
	var mocker = new Mocker();

	var puppet = new PuppetMock({ mocker });
	var bot = new Wechaty({ puppet });
	bot.use(new WechatyInfoPlugin({
		filter: [{ contact: { id: 'a' } }, { room: { topic: /t/ } }],
		command: "a",
		fetch: () => Promise.resolve("b")
	}));

	await bot.start();

	mocker.scan('https://github.com/wechaty', 1);
	var user = mocker.createContact();
	mocker.login(user);

	var contactA = mocker.createContact({ id: 'a' });
	var contactB = mocker.createContact({ id: 'b' });
	var roomA = mocker.createRoom({ topic: 't', memberIdList: [contactA.id, contactB.id, user.id] });
	var roomB = mocker.createRoom({ topic: 's', memberIdList: [contactA.id, contactB.id, user.id] });

	contactA.say("a").to(user);
	var message = await waitForMessage(contactA);
	assert.equal(message.text(), "b");

	contactB.say("a").to(user);
	await assert.rejects(waitForMessage(contactB));

	contactB.say("a").to(roomA);
	var message = await waitForMessage(roomA);
	assert.equal(message.text(), "b");

	contactB.say("a").to(roomB);
	await assert.rejects(waitForMessage(roomB));

	await bot.stop();
});

it('error', async () => {
	var mocker = new Mocker();

	var puppet = new PuppetMock({ mocker });
	var bot = new Wechaty({ puppet });
	bot.use(new WechatyInfoPlugin({
		command: "a",
		fetch: () => Promise.reject("b")
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

it('throttle', async () => {
	var mocker = new Mocker();

	var puppet = new PuppetMock({ mocker });
	var bot = new Wechaty({ puppet });
	bot.use(new WechatyInfoPlugin({
		command: "a",
		fetch: () => Promise.resolve("b"),
		throttle: {
			timeout: 1000,
			message: "-"
		}
	}));

	await bot.start();

	mocker.scan('https://github.com/wechaty', 1);
	var user = mocker.createContact();
	mocker.login(user);

	var contact = mocker.createContact();

	contact.say("a").to(user);
	var message = await waitForMessage(contact);
	assert.equal(message.text(), "b");

	contact.say("a").to(user);
	var message = await waitForMessage(contact);
	assert.equal(message.text(), "-");

	await sleep(1000);

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
	return require('promise-timeout').timeout(
		new Promise(resolve => {
			conversation.once('message', resolve);
		}),
		100
	);
}

/**
 * @param {number} time
 * @return {Promise<void>}
 */
function sleep(time) {
	return new Promise(resolve => {
		setTimeout(resolve, time);
	});
}
