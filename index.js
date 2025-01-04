// bot-status.js

const { Client, Intents } = require('discord.js');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();  // Load .env variables

const app = express();
const port = 3000;

// Use the token from .env file
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("No BOT_TOKEN found. Please add it to your .env file.");
  process.exit(1); // Exit if no token is found
}

const CLIENT_ID = '1311396094432772278'; // Your bot's client ID

// Create a new Discord client
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS
  ]
});

// Bot data
let botStatus = 'offline';
let serverCount = 0;
let userCount = 0;
let commandCount = 5;

client.once('ready', () => {
  botStatus = 'online';
  serverCount = client.guilds.cache.size; // Number of servers the bot is in
  userCount = client.users.cache.size; // Number of users the bot can see
  console.log('Bot is online!');
});

client.on('error', (error) => {
  console.log('Bot encountered an error: ', error);
});

client.login(BOT_TOKEN);

app.use(express.static('public'));

app.get('/status', (req, res) => {
  res.json({
    status: botStatus,
    servers: serverCount,
    totalUsers: userCount,
    commands: commandCount
  });
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Discord Bot Status</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 50px;
          }
          .status {
            font-size: 24px;
            padding: 10px;
            border-radius: 5px;
          }
          .online {
            color: green;
            background-color: #d4edda;
          }
          .offline {
            color: red;
            background-color: #f8d7da;
          }
          .info {
            font-size: 18px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Discord Bot Service Monitor</h1>
        <div id="status" class="status offline">Checking status...</div>
        <div class="info">
          <p>Servers: <span id="servers">0</span></p>
          <p>Total Users: <span id="users">0</span></p>
          <p>Commands: <span id="commands">5</span></p>
        </div>
        <script>
          async function updateStatus() {
            try {
              const response = await fetch('/status');
              const data = await response.json();
              const statusDiv = document.getElementById('status');
              const serversSpan = document.getElementById('servers');
              const usersSpan = document.getElementById('users');
              const commandsSpan = document.getElementById('commands');
              
              if (data.status === 'online') {
                statusDiv.textContent = 'Bot is Online';
                statusDiv.classList.remove('offline');
                statusDiv.classList.add('online');
              } else {
                statusDiv.textContent = 'Bot is Offline';
                statusDiv.classList.remove('online');
                statusDiv.classList.add('offline');
              }

              serversSpan.textContent = data.servers;
              usersSpan.textContent = data.totalUsers;
              commandsSpan.textContent = data.commands;
            } catch (error) {
              console.error('Error fetching bot status:', error);
            }
          }

          setInterval(updateStatus, 5000);
          updateStatus();
        </script>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
