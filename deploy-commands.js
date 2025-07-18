const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
    .setName('catat')
    .setDescription('Catat transaksi keuangan')
    .addStringOption(opt =>
      opt.setName('tipe')
        .setDescription('masuk atau keluar')
        .setRequired(true)
        .addChoices(
          { name: 'masuk', value: 'masuk' },
          { name: 'keluar', value: 'keluar' }
        )
    )
    .addIntegerOption(opt =>
      opt.setName('jumlah')
        .setDescription('Jumlah uang')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('keterangan')
        .setDescription('Keterangan transaksi')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('kategori')
        .setDescription('Kategori transaksi (makanan, transportasi, dll)')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('saldo')
    .setDescription('Lihat saldo saat ini'),

  new SlashCommandBuilder()
    .setName('riwayat')
    .setDescription('Lihat riwayat transaksi'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('⏳ Mengirim slash command...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Slash command berhasil dikirim!');
  } catch (error) {
    console.error('❌ Gagal mengirim slash command:', error);
  }
})();
