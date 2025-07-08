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
const N8N_WEBHOOK_CACAT = process.env.N8N_WEBHOOK_CATAT;
const N8N_WEBHOOK_SALDO = process.env.N8N_WEBHOOK_SALDO;

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // ---- Catat Transaksi ----
  if (message.content.startsWith('!catat')) {
    const parts = message.content.split(' ');
    const tipe = parts[1]; // masuk / keluar
    const jumlah = parseInt(parts[2]);
    const keterangan = parts.slice(3).join(' ');

    try {
      await axios.post(N8N_WEBHOOK_CACAT, {
        tipe,
        jumlah,
        keterangan,
        user: message.author.username,
      });

      message.reply(`✅ ${tipe} Rp${jumlah.toLocaleString()} untuk "${keterangan}" dicatat!`);
    } catch (err) {
      console.error('❌ Gagal kirim ke n8n:', err.message);
      message.reply('❌ Gagal kirim ke n8n!');
    }
  }

  // ---- Get Saldo ----
  if (message.content === '!saldo') {
    try {
      const res = await axios.get(N8N_WEBHOOK_SALDO);
      const { totalMasuk, totalKeluar, saldo } = res.data;

      message.reply(
        `📊 Saldo saat ini:\n` +
        `➕ Masuk: Rp${totalMasuk.toLocaleString()}\n` +
        `➖ Keluar: Rp${totalKeluar.toLocaleString()}\n` +
        `💰 Sisa Saldo: Rp${saldo.toLocaleString()}`
      );
    } catch (err) {
      console.error('❌ Gagal ambil saldo dari n8n:', err.message);
      message.reply('❌ Gagal ambil saldo dari n8n!');
    }
  }
});

client.login(DISCORD_TOKEN);
