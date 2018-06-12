const puppeteer = require("puppeteer");
const normalizeUrl = require("normalize-url");
const fs = require("fs");

/**
 * creates a scraper instance
 */
class BrowserInstance {
  /**
   * creates a Scraper
   * @param {Object} props
   * @param {Object|String} props.cookies
   * @param {String} props.proxy
   * @param {String} props.url
   * @param {Boolean} props.headless
   */
  constructor(props = {}) {
    this.props = props;
    return this;
  }

  /**
   * Sets argument and creates a browser instance
   */
  async init() {
    await this.setCookies();
    await this.setArgs();
    await this.launchBrowser();
    await this.launchPage();
    return this;
  }

  /**
   * Prepare Cookies for the browser instance
   */
  setCookies() {
    try {
      switch (typeof this.props.cookies) {
        case "string":
          this.cookies = JSON.parse(this.props.cookies);
          break;
        case "object":
          this.cookies = this.props.cookies;
          break;
        default:
          this.cookies = [];
          break;
      }
    } catch (e) {
      console.log("cannot parse cookies");
      this.cookies = [];
    }
    return this;
  }

  /**
   * Set chrome specific arguments
   */
  setArgs() {
    const args = [
      "--disable-dev-shm-usage",
      "--single-process",
      "--no-zygote",
      "--no-sandbox"
    ];
    const proxy = this.props.proxy || process.env.DEFAULT_PROXY;
    if (proxy) {
      args.push(`--proxy-server=${proxy}`);
    }
    this.args = args;
    if (this.props.url) {
      this.props.url = normalizeUrl(this.props.url);
    }
    this.clickDelay = this.props.clickDelay || 1000;
    this.navigationArgs = { waitUntil: "networkidle2" };
    this.viewportArgs = { width: 800, height: 800 };
    return this;
  }

  /**
   * Creates a browser with specific arguments
   */
  async launchBrowser() {
    this.browser = await puppeteer.launch({
      headless: this.props.headless,
      args: this.args
    });
    return this;
  }

  /**
   * Creates a page and processes various events
   */
  async launchPage() {
    this.page = await this.browser.newPage();
    this.page.evaluateOnNewDocument(
      fs.readFileSync(__dirname + "/scripts/preload.js", "utf8")
    );

    if (this.cookies) {
      await this.page.setCookie(...this.cookies);
    }
    await this.page.setViewport(this.viewportArgs);
    return this;
  }

  /**
   * Closes page and browser
   */
  async closeBrowser() {
    try {
      await this.page.close();
      await this.browser.close();
    } catch (e) {
      console.log(`Cannot close instance`);
    }
  }
}

class PageController extends BrowserInstance {
  constructor(props) {
    super(props);
  }

  async navigate(url = this.props.url) {
    this.response = await this.page.goto(url, this.navigationArgs);
    return this;
  }

  async type(selector, text) {
    try {
      await this.page.waitForSelector(selector, { visible: true });
      await this.page.focus(selector);
      await this.page.type(selector, text);
      await this.page.evaluate(
        selector => simulateEvent("focus", document.querySelector(selector)),
        selector
      );
      return true;
    } catch (e) {
      console.log(`Cannot Type on ${selector}`, e);
    }
  }

  async click(selector, visible = false) {
    try {
      await this.page.waitForSelector(selector, { visible });
      await this.page.focus(selector);
      await this.page.evaluate(
        selector => document.querySelector(selector).click(),
        selector
      );
      await this.page.waitFor(this.clickDelay);
    } catch (e) {
      console.log(`Cannot Click :: ${selector}`);
    }
  }

  async select(selector, value) {
    try {
      console.log(`Selecting`);

      await this.page.waitForSelector(selector);
      await this.page.focus(selector);
      await this.page.select(selector, value);
      // await this.page.evaluate(
      //   ({ selector, value }) => {
      //     console.log({ selector, value })
      //     document.querySelector(selector).value = value;
      //     simulateEvent('change', document.querySelector(selector))
      //   },
      //   { selector, value }
      // );
    } catch (e) {
      console.log(`Cannot select: ${selector}`);
    }
  }

  async getText(selector) {
    await this.page.waitForSelector(selector);
    return this.page.evaluate(selector => {
      return document.querySelector(selector).textContent;
    }, selector);
  }
}

module.exports = PageController;
