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
        const time = $('#txtCiteTime').text(); // <-- This line extracts the time

        // Check if location, date, or time are empty (indicating a possible non-existent citation)
        if (!location || !date || !time) {
            console.log('All done');
            return false; // Stop the loop
        }

        // Store data to Firebase
        await db.collection('citations').doc(`${citationNumber}`).set({
            college: location,
            timestamp: date,
            time: time  // <-- This line stores the time to Firebase
        });

        console.log(`Stored citation #${citationNumber}`);
        return true; // Continue the loop
    } catch (error) {
        console.error(`Error scraping citation #${citationNumber}: ${error}`);
        return false; // Stop the loop in case of an error
    }
}


async function startScraping(startingCitation) {
    let currentCitation = startingCitation;
    let shouldContinue = true;
    while (shouldContinue) {
        shouldContinue = await scrapeCitation(currentCitation);
        currentCitation++;
    }
}

startScraping(400126332);
