import { EmbedBuilder, GuildMember, Interaction } from "discord.js";
import { client, player } from "./client";

client.on("interactionCreate", async (interaction: Interaction) => {
  // Интеракции бывают разные, мы делаем проверку на то, что это команда
  if (!interaction.isChatInputCommand()) return;
  if (!(interaction.member instanceof GuildMember)) return;
  // Команда play
  if (interaction.commandName === "play") {
    const music = interaction.options.getString("query");
    // Проверки
    if (interaction.member instanceof GuildMember) {
      if (!interaction.member.voice.channelId) {
        await interaction.reply({
          content: "Зайди в голосовой",
          ephemeral: true,
        });
        return;
      }
      if (!interaction.guild) return;
      const queue = player.nodes.create(interaction.guild, {
        metadata: {
          channel: interaction.channel,
        },
      });
      try {
        if (!interaction.member.voice.channel) return;
        if (!queue.connection)
          await queue.connect(interaction.member.voice.channel);
      } catch {
        queue.delete();
        await interaction.reply({
          content: "Какая-то ошибка",
          ephemeral: true,
        });
        return;
      }
      await interaction.deferReply();
      let track = await player
        .search(music!, {
          requestedBy: interaction.member,
        })
        .then((x) => x.tracks[0]);
      if (!track) {
        await interaction.followUp({
          embeds: [
            {
              title: "Ничего не найдено",
              description: `По Вашему запросу ничего не найдено.`,
            },
          ],
        });
        return;
      }
      queue.addTrack(track);
      if (!queue.isPlaying()) queue.node.play();
      const embed = new EmbedBuilder();
      embed.setTitle("Музыка запущена");
      embed.setDescription(
        `${track.title} сейчас воспроизводится в <#${interaction.channel?.id}>`
      );
      await interaction.followUp({ embeds: [embed] });
    }
  }
  if (interaction.commandName === "next") {
    const queue = player.nodes.get(interaction.guild!);
    if (!queue) {
      await interaction.reply({
        content: "В очереди нет ничего для пропуска.",
        ephemeral: true,
      });
      return;
    }
    queue.node.skip();
    await interaction.reply({
      content: "Трек пропущен.",
      ephemeral: true,
    });
    return;
  }
  if (interaction.commandName === "queue") {
    const queue = player.nodes.get(interaction.guild!);
    if (!queue) {
      await interaction.reply({
        content: "Очередь пустая",
        ephemeral: true,
      });
      return;
    }
    const trackList = queue.tracks;
    const embed = new EmbedBuilder();
    if (trackList.size === 0) {
      embed.setTitle("Очереди нет");
    } else {
      embed.setTitle("Вот, что находится в очереди");
      embed.setFields(
        trackList.map((x, i) => ({
          name: `${i + 1}. ${x.title}`,
          value: `*Длительность: ${x.duration}\nСсылка на видео: ${x.url}*`,
        }))
      );
    }
    await interaction.reply({
      embeds: [embed],
    });
    return;
  }
  if (interaction.commandName === "stop") {
    const queue = player.nodes.get(interaction.guild!);
    if (!queue) {
      await interaction.reply({
        content: "Не чего останавливать",
      });
      return;
    }
    queue.node.stop();
    await interaction.reply({
      content: "Музыка остановлена",
      ephemeral: true,
    });
    return;
  }
  if (interaction.commandName === "pause") {
    const queue = player.nodes.get(interaction.guild!);
    if (!queue) {
      await interaction.reply({
        content: "Не чего ставить на паузу",
      });
      return;
    }
    if (queue.node.isPaused()) {
      queue.node.setPaused(false);
      await interaction.reply({
        content: "Музыка снята с паузы",
      });
    } else {
      queue.node.setPaused(true);
      await interaction.reply({
        content: "Музыка поставлена на паузу",
      });
    }

    return;
  }
});
