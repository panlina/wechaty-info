# wechaty-info

A Wechaty plugin that provides certain type of information, like news or jokes.

## Usage

```js
var { Wechaty } = require('wechaty');
var WechatyInfoPlugin = require('wechaty-info');
var axios = require('axios');
var bot = new Wechaty();
bot.use(
	WechatyInfoPlugin({
		filter: [{ contact: { name: '小红' } }, { room: { topic: /^都是老师/ } }],
		command: "讲个笑话",
		fetch: () => axios.get("https://api.apiopen.top/getJoke?type=text&count=1")
			.then(({ data: data }) => data.result[0].text, () => "请求失败"),
		throttle: {
			timeout: 60 * 1000,
			message: "对不起，1分钟内只能看一个笑话[呲牙]"
		}
	})
);
```
