const app = require("express")();

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    let browser = await puppeteer.launch(options);

    let page = await browser.newPage();
    // await page.goto("https://www.google.com");
    // res.send(await page.title());

    let website_url = `https://backend-be.vercel.app/build/download/${req.body.userId}`;

    // Open URL in current page
    await page.goto(website_url, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');
    const pdf = await page.pdf({
      path: 'result.pdf',
      format: 'a4',
    });
    await browser.close();

    // const pdf = await downloadPdf(req.body.userId)
    res.setHeader('Content-Type', 'application/pdf');

    console.log(pdf);
    return res.send(pdf)


  } catch (err) {
    console.error(err);
    return null;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
