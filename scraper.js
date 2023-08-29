const puppeteer = require('puppeteer');
const admin = require('firebase-admin');

const serviceAccount = require('./defundtaps-firebase-adminsdk-l7ji6-497e092431.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function scrapeCitation(citationNumber) {
    const initialURL = `https://www.paymycite.com/SearchAgency.aspx?agency=147&plate=&cite=${citationNumber}`;
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(initialURL, { waitUntil: 'networkidle2' });
    
    const contestButton = await page.$("#DataGrid1_ctl02_cmdContest");
    
    if (!contestButton) {
        console.log(`Citation #${citationNumber} doesn't have a contest button.`);
        await browser.close();
        return;
    }

    await contestButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const location = await page.$eval('#txtVioLocation', el => el.innerText);
    const date = await page.$eval('#txtCiteDate', el => el.innerText);
    const time = await page.$eval('#txtCiteTime', el => el.innerText);

    if (!location || !date || !time) {
        console.log(`Citation #${citationNumber} doesn't have required data.`);
        await browser.close();
        return;
    }

    await db.collection('citations').doc(`${citationNumber}`).set({
        college: location,
        timestamp: date,
        time: time
    });

    console.log(`Stored citation #${citationNumber}`);
    await browser.close();
}

async function startScraping(startingCitation, endingCitation) {
    for (let currentCitation = startingCitation; currentCitation <= endingCitation; currentCitation++) {
        await scrapeCitation(currentCitation);
    }
    console.log('Scraping process completed.');
}

startScraping(400126329, 400126431);
setInterval(() => {
    startScraping(400126330, 400126430);
}, 100000);
