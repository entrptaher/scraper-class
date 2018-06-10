class Runner {
  /**
   * creates a Scraper
   * @param {Object} props
   */
  constructor(props) {
    this.scraper = new Scraper(props);
    this.props = props;
  }

  /**
   * Processes the configuration thru the scraper
   */
  async process() {
    const {events, resultFields} = this.props;
    await this.scraper.init();
    for (let event of events) {
      console.log(event.details);
      await this.eventSwitcher(event);
    }
    const { yearly, monthly } = resultFields;
    const result = {
      yearly: await this.scraper.getText(yearly),
      monthly: await this.scraper.getText(monthly)
    };
    await this.scraper.closeBrowser();
    return result;
  }

  async eventSwitcher(options) {
    let { details, action, type, value, xpath, selector, visible } = options;

    switch (type) {
      case "input":
        action = "type";
        break;
      case "button":
      case "radio":
      case "check":
        action = "click";
        break;
      default:
    }

    switch (action) {
      case "navigation":
        await this.scraper.navigate(value);
        break;
      case "type":
        await this.scraper.type(selector, value.toString());
        break;
      case "click":
        await this.scraper.click(selector, visible);
        break;
      case "select":
        await this.scraper.select(selector, value);
        break;
      default:
    }
  }
}

function getEvents() {
  return [
    /** SECTION: EXAMPLE.COM */
    {
      details: "Navigate to URL",
      action: "navigation",
      value: "https://example.com"
    }
  ];
}

// Runner
(async () => {
  const runner = new Runner({
    events: getEvents(),
    clickDelay: 2000,
    resultFields: {
      monthly: "div.price > span:nth-child(4)",
      yearly: "div.price > span:nth-child(1)"
    }
  });
  const result = await runner.process();
})();