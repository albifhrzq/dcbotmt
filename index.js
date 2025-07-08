const { Client, GatewayIntentBits, Events } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const N8N_WEBHOOK_CATAT = process.env.N8N_WEBHOOK_CATAT;
const N8N_WEBHOOK_SALDO = process.env.N8N_WEBHOOK_SALDO;

client.once('ready', () => {
  console.log(`✅ Bot login sebagai ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const user = interaction.user.username;

  // --- CATAT TRANSAKSI ---
  if (interaction.commandName === 'catat') {
    await interaction.deferReply(); // kasih waktu biar gak timeout

    const tipe = interaction.options.getString('tipe');
    const jumlah = interaction.options.getInteger('jumlah');
    const keterangan = interaction.options.getString('keterangan');
    const kategori = interaction.options.getString('kategori');

    try {
      await axios.post(N8N_WEBHOOK_CATAT, {
        tipe,
        jumlah,
        keterangan,
        kategori,
        user, // ini dipakai buat filter di sheets
      });

      await interaction.editReply(
        `✅ ${tipe} Rp${jumlah.toLocaleString()} untuk "${keterangan}" ` +
        `dengan kategori *${kategori}* berhasil dicatat!`
      );
    } catch (err) {
      console.error('❌ Gagal kirim ke n8n:', err.message);
      await interaction.editReply('❌ Gagal kirim ke n8n!');
    }
  }

  // --- CEK SALDO ---
  if (interaction.commandName === 'saldo') {
    await interaction.deferReply();

    try {
      const res = await axios.get(N8N_WEBHOOK_SALDO, {
        params: { user } // kirim username sebagai query param
      });

      const { totalMasuk, totalKeluar, saldo } = res.data;

      await interaction.editReply(
        `📊 Saldo untuk *${user}*:\n` +
        `➕ Masuk: Rp${totalMasuk.toLocaleString()}\n` +
        `➖ Keluar: Rp${totalKeluar.toLocaleString()}\n` +
        `💰 Sisa Saldo: Rp${saldo.toLocaleString()}`
      );
    } catch (err) {
      console.error('❌ Gagal ambil saldo dari n8n:', err.message);
      await interaction.editReply('❌ Gagal ambil saldo dari n8n!');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
