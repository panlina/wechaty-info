# wechaty-info

A Wechaty plugin that provides certain type of information, like news or jokes.

## Usage

```js
var { Wechaty } = require('wechaty');
var WechatyInfoPlugin = require('wechaty-info');
var bot = new Wechaty({
	command: "讲个笑话",
	fetch: () => axios.get("https://api.apiopen.top/getJoke?type=text&count=1")
		.then(({ data: data }) => data.result[0].text, () => "请求失败")
});
bot.use(WechatyInfoPlugin());
```
