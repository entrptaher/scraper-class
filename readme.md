This exports a page controller that can be used to control a chrome page instance created by puppeteer.

Example usage:

```
const scraper = new Scraper({headless: false, url: 'example.com', proxy: '127.0.0.1:8888', cookies: 'somecookie=bar'});
await scraper.navigate('example.org');
await scraper.type(selector, value);
await scraper.click(selector, visible);
await scraper.select(selector, value);
await scraper.closeBrowser();
```
