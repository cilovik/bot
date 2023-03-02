import {
  ApplicationCommandOptionType,
  Client,
  IntentsBitField,
  REST,
  Routes,
} from "discord.js";
import { Player } from "discord-player";
import { token } from "./config";

export const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

client.once("ready", () => {
  console.log("Bot is ready!");
});

client.login(token);

const rest = new REST({ version: "10" }).setToken(token);

const commands = [
  {
    name: "play",
    description: "Воспроизвести музыку по ссылке или через текст",
    options: [
      {
        name: "query",
        type: ApplicationCommandOptionType.String,
        description: "Какую музыку будем слушать?",
        required: true,
      },
    ],
  },
  {
    name: "next",
    description: "Воспроизвести следующую композицию в очереди",
    options: [],
  },
  {
    name: "queue",
    description: "Очередь воспроизведения",
    options: [],
  },
  {
    name: "stop",
    description: "Остановить воспроизведение музыки",
    options: [],
  },
  {
    name: "pause",
    description: "Поставить музыку на паузу",
    options: [],
  },
];

(async () => {
  try {
    console.log("Started refreshing application [/] commands.");

    await rest.put(
      Routes.applicationGuildCommands(
        "1074937091294756897",
        "1080468627427438622"
      ),
      {
        body: commands,
      }
    );

    console.log("Successfully reloaded application [/] commands.");
  } catch (error) {
    console.error(error);
  }
})();

export const player = new Player(client);
