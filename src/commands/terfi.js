const moment = require("moment");
require("moment-duration-format");
const conf = require("../configs/config.json");
const messageUserChannel = require("../schemas/messageUserChannel");
const voiceUserChannel = require("../schemas/voiceUserChannel");
const messageUser = require("../schemas/messageUser");
const voiceUser = require("../schemas/voiceUser");
const voiceUserParent = require("../schemas/voiceUserParent");
const coin = require("../schemas/coin");
const taggeds = require("../schemas/taggeds");

module.exports = {
  conf: {
    aliases: ["terfi"],
    name: "yetki",
    help: "yetki"
  },

  run: async (client, message, args, embed) => {
    const category = async (parentsArray) => {
      const data = await voiceUserParent.find({ guildID: message.guild.id, userID: message.author.id });
      const voiceUserParentData = data.filter((x) => parentsArray.includes(x.parentID));
      let voiceStat = 0;
      for (var i = 0; i <= voiceUserParentData.length; i++) {
        voiceStat += voiceUserParentData[i] ? voiceUserParentData[i].parentData : 0;
      }
      return moment.duration(voiceStat).format("H [saat], m [dakika] s [saniye]");
    };
    
    const Active1 = await messageUserChannel.find({ guildID: message.guild.id, userID: message.author.id }).sort({ channelData: -1 });
    const Active2 = await voiceUserChannel.find({ guildID: message.guild.id, userID: message.author.id }).sort({ channelData: -1 });
    const voiceLength = Active2 ? Active2.length : 0;
    let voiceTop;
    let messageTop;
    Active1.length > 0 ? messageTop = Active1.splice(0, 5).map(x => `<#${x.channelID}>: \`${Number(x.channelData).toLocaleString()} mesaj\``).join("\n") : messageTop = "Veri bulunmuyor."
    Active2.length > 0 ? voiceTop = Active2.splice(0, 5).map(x => `<#${x.channelID}>: \`${moment.duration(x.channelData).format("H [saat], m [dakika] s [saniye]")}\``).join("\n") : voiceTop = "Veri bulunmuyor."
    
    const messageData = await messageUser.findOne({ guildID: message.guild.id, userID: message.author.id });
    const voiceData = await voiceUser.findOne({ guildID: message.guild.id, userID: message.author.id });

    const messageDaily = messageData ? messageData.dailyStat : 0;
    const messageWeekly = messageData ? messageData.weeklyStat : 0;

    const voiceDaily = moment.duration(voiceData ? voiceData.dailyStat : 0).format("H [saat], m [dakika] s [saniye]");
    const voiceWeekly = moment.duration(voiceData ? voiceData.weeklyStat : 0).format("H [saat], m [dakika] s [saniye]");
    
    const coinData = await coin.findOne({ guildID: message.guild.id, userID: message.author.id });

    const filteredParents = message.guild.channels.cache.filter((x) =>
      x.type === "category" &&
      !conf.publicParents.includes(x.id) &&
      !conf.registerParents.includes(x.id) &&
      !conf.solvingParents.includes(x.id) &&
      !conf.privateParents.includes(x.id) &&
      !conf.aloneParents.includes(x.id) &&
      !conf.funParents.includes(x.id)
    );

    const maxValue = client.ranks[client.ranks.indexOf(client.ranks.find(x => x.coin >= (coinData ? coinData.coin : 0)))] || client.ranks[client.ranks.length-1];
    const taggedData = await taggeds.findOne({ guildID: message.guild.id, userID: message.author.id });
    let currentRank = client.ranks.filter(x => (coinData ? coinData.coin : 0) >= x.coin);
    currentRank = currentRank[currentRank.length-1];

    const coinStatus = message.member.hasRole(conf.staffs, false) && client.ranks.length > 0 ?
    `**${terfiemoji} Puan Durumu:**
    - Puan??n??z: \`${coinData ? coinData.coin : 0}\`, Gereken: \`${maxValue.coin}\` 
    ${progressBar(coinData ? coinData.coin : 0, maxValue.coin, 8)} \`${coinData ? coinData.coin : 0} / ${maxValue.coin}\`
    ${currentRank ? `**?????????????????????????????????????????????** 
    Genel Puan Durumu (\`Atlamaya uygun de??il!\`)
    ${conf.nokta} Ceza Durumu: \`0 (Ceza Etkisi: Yok!)\`
    ${conf.nokta} Tagl?? Puan: \`${taggedData.taggeds.length}\`

    **${terfiemoji} Yetki Durumu:** 
    ${currentRank !== client.ranks[client.ranks.length-1] ? `??u an ${Array.isArray(currentRank.role) ? currentRank.role.map(x => `<@&${x}>`).join(", ") : `<@&${currentRank.role}>`} rol??ndesiniz. ${Array.isArray(maxValue.role) ? maxValue.role.length > 1 ? maxValue.role.slice(0, -1).map(x => `<@&${x}>`).join(', ') + ' ve ' + maxValue.role.map(x => `<@&${x}>`).slice(-1) : maxValue.role.map(x => `<@&${x}>`).join("") : `<@&${maxValue.role}>`} rol??ne ula??mak i??in \`${maxValue.coin-coinData.coin}\` puan daha kazanman??z gerekiyor!` : "??u an son yetkidesiniz! Emekleriniz i??in te??ekk??r ederiz."}` : `**?????????????????????????????????????????????** 
    **${terfiemoji} Yetki Durumu:** 
    ${Array.isArray(maxValue.role) ? maxValue.role.length > 1 ? maxValue.role.slice(0, -1).map(x => `<@&${x}>`).join(', ') + ' ve ' + maxValue.role.map(x => `<@&${x}>`).slice(-1) : maxValue.role.map(x => `<@&${x}>`).join("") : `<@&${maxValue.role}>`} rol??ne ula??mak i??in \`${maxValue.coin - (coinData ? coinData.coin : 0)}\` coin daha kazanman??z gerekiyor!`}` : "";

    embed.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true, size: 2048 }))
    embed.setDescription(`
    ${message.author.toString()} (${message.member.roles.highest}) ki??isinin yetki y??kseltim bilgileri a??a????da belirtilmi??tir
    
    ${coinStatus} 
    `)
    message.channel.send(embed);
  }
};

function progressBar(value, maxValue, size) {
const progress = Math.round(size * ((value / maxValue) > 1 ? 1 : (value / maxValue)));
const emptyProgress = size - progress > 0 ? size - progress : 0;

const progressText = conf.emojis.fill.repeat(progress);
const emptyProgressText = conf.emojis.empty.repeat(emptyProgress);

return emptyProgress > 0 ? conf.emojis.fillStart+progressText+emptyProgressText+conf.emojis.emptyEnd : conf.emojis.fillStart+progressText+emptyProgressText+conf.emojis.fillEnd;
};
