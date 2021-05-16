const { Client, Collection } = require("discord.js");
const client = (global.client = new Client());
const settings = require("./src/configs/settings.json");
client.commands = new Collection();
client.aliases = new Collection();
client.invites = new Collection();
client.cooldown = new Map();
client.ranks = [
  { role: "843120725001764886", coin: 1027 },
  { role: "843120723731677206", coin: 2584 },
  { role: "843120723165446154", coin: 3230 },
  { role: "843120722464604171", coin: 4123 },
  { role: "843120720929488916", coin: 5611 },
  { role: "843120719957327923", coin: 6493 },
  { role: "843120719412199474", coin: 7959 },
  { role: "843120718342127648", coin: 8689 },
  { role: "843120718060847134", coin: 9569 },
  { role: "843120716227674134", coin: 11250 },
  { role: "843120715909300234", coin: 12983 },
  { role: "843120715229298728", coin: 13899 },
  { role: "843120714387030026", coin: 15000 },
  { role: "843120713413689395", coin: 16900 },
  { role: "843120712704851978", coin: 17890 },
  { role: "843120707704979476", coin: 20000 },
  { role: "843120706191360020", coin: 25946 },
  ]; 
require("./src/handlers/commandHandler");
require("./src/handlers/eventHandler");
require("./src/handlers/mongoHandler");
require("./src/handlers/functionHandler")(client);


client
  .login()
  .then(() => console.log("[BOT] Bot connected!"))
  .catch(() => console.log("[BOT] Bot can't connected!"));
