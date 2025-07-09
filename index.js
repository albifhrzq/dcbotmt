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

  const command = interaction.commandName;
  const user = interaction.user.username;

  try {
    await interaction.deferReply();

    // ==== /catat ====
    if (command === 'catat') {
      const tipe = interaction.options.getString('tipe');
      const jumlah = interaction.options.getInteger('jumlah');
      const keterangan = interaction.options.getString('keterangan');
      const kategori = interaction.options.getString('kategori');

      await axios.post(N8N_WEBHOOK_CATAT, {
        tipe,
        jumlah,
        keterangan,
        kategori,
        user,
      });

      return await interaction.editReply(
        `✅ ${tipe} Rp${jumlah.toLocaleString()} untuk "${keterangan}" ` +
        `dengan kategori *${kategori}* berhasil dicatat!`
      );
    }

    // ==== /saldo ====
    if (command === 'saldo') {
      const res = await axios.get(N8N_WEBHOOK_SALDO);
      const { totalMasuk, totalKeluar, saldo } = res.data;

      return await interaction.editReply(
        `📊 Saldo saat ini:\n` +
        `➕ Masuk: Rp${totalMasuk.toLocaleString()}\n` +
        `➖ Keluar: Rp${totalKeluar.toLocaleString()}\n` +
        `💰 Sisa Saldo: Rp${saldo.toLocaleString()}`
      );
    }

    // ==== /riwayat ====
    if (command === 'riwayat') {
      const res = await axios.get(N8N_WEBHOOK_RIWAYAT, {
        params: { user }
      });

      const transaksi = res.data;

      if (!Array.isArray(transaksi) || transaksi.length === 0) {
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

      return;
    }

  } catch (err) {
    console.error(`❌ Error saat jalankan perintah ${interaction.commandName}:`, err.message);
    if (interaction.deferred) {
      await interaction.editReply(`❌ Terjadi kesalahan saat memproses perintah.`);
    } else {
      await interaction.reply(`❌ Terjadi kesalahan saat memproses perintah.`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
