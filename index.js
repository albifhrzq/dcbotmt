const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const N8N_WEBHOOK = process.env.N8N_WEBHOOK;

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!catat')) return;

  const parts = message.content.split(' ');
  const tipe = parts[1]; // keluar / masuk
  const jumlah = parseInt(parts[2]);
  const keterangan = parts.slice(3).join(' ');

  try {
    await axios.post(N8N_WEBHOOK, {
      tipe,
      jumlah,
      keterangan,
      user: message.author.username,
    });

    message.reply(`✅ ${tipe} Rp${jumlah.toLocaleString()} untuk "${keterangan}" dicatat!`);
  } catch (err) {
    console.error('Gagal kirim ke n8n:', err);
    message.reply('❌ Gagal kirim ke n8n!');
  }
});

client.login(DISCORD_TOKEN);
