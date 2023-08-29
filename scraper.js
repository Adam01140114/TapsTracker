const axios = require('axios');
const cheerio = require('cheerio');
const admin = require('firebase-admin');

const serviceAccount = require('./defundtaps-firebase-adminsdk-l7ji6-497e092431.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //databaseURL: 'YOUR_FIREBASE_DB_URL' // replace with your Firebase database URL
});

const db = admin.firestore();

async function scrapeCitation(citationNumber) {
    const url = `https://www.paymycite.com/OnlineContest.aspx?agency=UC%20Santa%20Cruz%20Transportation%20%26%20Parking%20Services&cite=${citationNumber}&platestate=CA&citedate=8/24/2023&citebal=$50.00&S1=&S2=147&S3=${citationNumber}&S4=&SearchType=1`;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const location = $('#txtVioLocation').text();
        const date = $('#txtCiteDate').text();
        const time = $('#txtCiteTime').text();

        // Check if location, date, or time are empty (indicating a possible non-existent citation)
        if (!location || !date || !time) {
            console.log(`${citationNumber} doesn't exist`);
            return true; // Continue with the loop since we only want to skip
        }

        // Store data to Firebase
        await db.collection('citations').doc(`${citationNumber}`).set({
            college: location,
            timestamp: date,
            time: time
        });

        console.log(`Stored citation #${citationNumber}`);
        return true; // Continue the loop
    } catch (error) {
        console.error(`Error scraping citation #${citationNumber}: ${error}`);
        return true; // Continue the loop even if there's an error
    }
}

async function startScraping(startingCitation, endingCitation) {
    for (let currentCitation = startingCitation; currentCitation <= endingCitation; currentCitation++) {
        await scrapeCitation(currentCitation);
    }
    console.log('Scraping process completed.');
}

startScraping(400126132, 400126499);
