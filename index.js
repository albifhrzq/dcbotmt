const { Client, GatewayIntentBits, Events } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const N8N_WEBHOOK_CATAT = process.env.N8N_WEBHOOK_CATAT;
const N8N_WEBHOOK_SALDO = process.env.N8N_WEBHOOK_SALDO;
const N8N_WEBHOOK_RIWAYAT = process.env.N8N_WEBHOOK_RIWAYAT;

client.once('ready', () => {
  console.log(`✅ Bot login sebagai ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // ---- /catat ----
  if (interaction.commandName === 'catat') {
    const tipe = interaction.options.getString('tipe');
    const jumlah = interaction.options.getInteger('jumlah');
    const keterangan = interaction.options.getString('keterangan');
    const kategori = interaction.options.getString('kategori');
    const user = interaction.user.username;

    try {
      await interaction.deferReply();

      await axios.post(N8N_WEBHOOK_CATAT, {
        tipe,
        jumlah,
        keterangan,
        kategori,
        user,
      });

      await interaction.editReply(
        `✅ ${tipe} Rp${jumlah.toLocaleString()} untuk "${keterangan}" ` +
        `dengan kategori *${kategori}* berhasil dicatat!`
      );
    } catch (err) {
      console.error('❌ Gagal kirim ke n8n:', err.message);
      if (interaction.deferred) {
        await interaction.editReply('❌ Gagal kirim ke n8n!');
      } else {
        await interaction.reply('❌ Gagal kirim ke n8n!');
      }
    }
  }

  // ---- /saldo ----
  if (interaction.commandName === 'saldo') {
    try {
      await interaction.deferReply();

      const res = await axios.get(N8N_WEBHOOK_SALDO);
      const { totalMasuk, totalKeluar, saldo } = res.data;

      await interaction.editReply(
        `📊 Saldo saat ini:\n` +
        `➕ Masuk: Rp${totalMasuk.toLocaleString()}\n` +
        `➖ Keluar: Rp${totalKeluar.toLocaleString()}\n` +
        `💰 Sisa Saldo: Rp${saldo.toLocaleString()}`
      );
    } catch (err) {
      console.error('❌ Gagal ambil saldo dari n8n:', err.message);
      if (interaction.deferred) {
        await interaction.editReply('❌ Gagal ambil saldo dari n8n!');
      } else {
        await interaction.reply('❌ Gagal ambil saldo dari n8n!');
      }
    }
  }

  // ---- /riwayat ----
  if (interaction.commandName === 'riwayat') {
    const user = interaction.user.username;

    try {
      await interaction.deferReply();

      const res = await axios.get(N8N_WEBHOOK_RIWAYAT, {
        params: { user }
      });

      const transaksi = res.data;

      if (!transaksi.length) {
        return await interaction.editReply('📭 Belum ada transaksi tercatat!');
      }

      const format = transaksi
        .map((item, i) =>
          `${i + 1}. [${item.Tipe}] Rp${Number(item.Jumlah).toLocaleString()} - ${item.Keterangan} (${item.Kategori})`
        )
        .join('\n');

      const chunks = format.match(/(.|[\r\n]){1,1900}/g);

      await interaction.editReply({ content: chunks[0] });
      for (let i = 1; i < chunks.length; i++) {
        await interaction.followUp({ content: chunks[i] });
      }

    } catch (err) {
      console.error('❌ Gagal ambil riwayat:', err.message);
      if (interaction.deferred) {
        await interaction.editReply('❌ Gagal ambil riwayat dari n8n!');
      } else {
        await interaction.reply('❌ Gagal ambil riwayat dari n8n!');
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
