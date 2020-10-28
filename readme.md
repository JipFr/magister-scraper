# Magister scraper

This is my TS library for scraping Magister.

The biggest thanks goes to [RedDuckss](https://github.com/redduckss/) for helping me out with researching the endpoints and such. I couldn't have done it without him.

---

This library handles login in and sending GET requests with the relevant cookies and such. The endpoints are the same as in the official client and you'll have to enter those yourself.

## Example

Getting your schedule would look something like this

```js
import Magister from "magister";

(async () => {
	let client = await Magister.new({
		username: "jouw_id",
		password: "jouw_wachtwoord",
		hostname: "school.magister.net"
	});

	let url = `https://${client.hostname}/api/personen/${client.userId}/afspraken`;
	let data = await client.get(url);

	console.info(data);

})();
```