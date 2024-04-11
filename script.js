function search() {
    var searchQuery = document.getElementById("searchInput").value.toLowerCase();
    var searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = ""; // Clear previous search results

    // Iterate through each row in the Google Sheet and display matching results
    for (var i = 2; i <= data.length; i++) {
        var rowData = data[i - 1]; // Assuming "data" is an array containing Google Sheet data
        var customerInfo = rowData.join(" ").toLowerCase();
        if (customerInfo.includes(searchQuery)) {
            var rowElement = document.createElement("div");
            rowElement.textContent = rowData.join(" | ");
            searchResults.appendChild(rowElement);
        }
    }
}

function clearResults() {
    document.getElementById("searchResults").innerHTML = "";
}
const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');

// Load credentials from JSON file
const credentials = JSON.parse(fs.readFileSync('C:\Users\anuchit_s\Documents\Project Search\client_secret_232488649857-fjeq35aekjbkcr9l4o4eulovbhco5jta.apps.googleusercontent.com.json'));

// Create OAuth2 client
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Set token if available, otherwise authenticate
const tokenPath = 'path/to/token.json';
if (fs.existsSync(tokenPath)) {
    const token = JSON.parse(fs.readFileSync(tokenPath));
    oAuth2Client.setCredentials(token);
    getDataFromSheet(oAuth2Client);
} else {
    getNewToken(oAuth2Client);
}

// Get new token from user
function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFileSync(tokenPath, JSON.stringify(token));
            getDataFromSheet(oAuth2Client);
        });
    });
}

// Fetch data from Google Sheet
function getDataFromSheet(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get({
        spreadsheetId: '1wvG27Bvlwyn36piwi84JPBabdzIuloOeykK_8d7TypI',
        range: 'Database!A2:F', // Adjust range as per your Google Sheet
    }, (err, res) => {
        if (err) return console.error('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            console.log('Data retrieved successfully:');
            // Now you can use 'rows' array in your code
            console.log(rows);
        } else {
            console.log('No data found.');
        }
    });
}
