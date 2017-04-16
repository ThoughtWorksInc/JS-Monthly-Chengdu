// TODO: 实现google mail api
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');

const gmail = google.gmail('v1');
const base64url = require('base64url');

const scopes = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose'
];


/**
 * 此处的.credentical文件请在
 * Google Developer Console: https://console.developer.google.com/
 * 中创建Oauth Client ID凭据，并下载，放置在项目的`email`目录下，并改名为.credentical
 */
const CREDENTICAL_PATH = path.relative(process.cwd(), './email/.credentical');
const TOKEN_PATH = path.relative(process.cwd(), './email/.token');

const credentials = JSON.parse(fs.readFileSync(CREDENTICAL_PATH, 'utf-8'));

const oauth2Client = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0]
);


function storeToken(token) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
  console.log('Please rerun command');
}

function send(rawBody) {
  fs.readFile(TOKEN_PATH, 'utf-8', (err, token) => {
    if (err) {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
      });

      console.log(`\n please visit auth url: ${authUrl}\n`)

      let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
          if (err) {
            console.log('Error while trying to retrieve access token', err);
            return;
          }
          oauth2Client.credentials = token;
          storeToken(token);
          process.exit(0);
        });
      });
      return;
    }

    oauth2Client.credentials = JSON.parse(token);

    gmail.users.messages.send({
      auth: oauth2Client,
      userId: 'me',
      resource: {
        raw: rawBody
      }
    }, (err, res) => {
      if (err) {
        console.log(err);
      }

      console.log(res);
    });

  })
}

function sendMail(to, subject, html) {

  const body = [];
  body.push(`MIME-Version: 1.0\r\n`);
  body.push(`Content-type:text/html;\r\n`);
  body.push(`To: <${to}>\r\n`);
  body.push(`Subject: ${subject}\r\n`);
  body.push(`\r\n`);
  body.push(html)

  const rawBody = base64url(body.join(''))

  send(rawBody);
}

module.exports = sendMail;
