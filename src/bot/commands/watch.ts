/*
 * Copyright (c) 2023, NeKz
 *
 * SPDX-License-Identifier: MIT
 */

import { Video } from '../../server/models.ts';
import { Bot } from '../deps.ts';
import { Interaction } from '../deps.ts';
import { ApplicationCommandOptionTypes, ApplicationCommandTypes, InteractionResponseTypes } from '../deps.ts';
import { escapeMaskedLink, getPublicUrl } from '../utils/helpers.ts';
import { createCommand } from './mod.ts';

const AUTORENDER_BASE_API = Deno.env.get('AUTORENDER_BASE_API')!;

createCommand({
  name: 'watch',
  description: 'Watch rendered videos!',
  type: ApplicationCommandTypes.ChatInput,
  scope: 'Global',
  options: [
    {
      name: 'latest',
      description: 'Watch your latest rendered videos!',
      type: ApplicationCommandOptionTypes.SubCommand,
    },
    {
      name: 'random',
      description: 'Watch a random rendered video!',
      type: ApplicationCommandOptionTypes.SubCommand,
    },
  ],
  execute: async (bot: Bot, interaction: Interaction) => {
    const subCommand = [...(interaction.data?.options?.values() ?? [])].at(0)!;

    switch (subCommand.name) {
      case 'latest': {
        try {
          await bot.helpers.sendInteractionResponse(
            interaction.id,
            interaction.token,
            {
              type: InteractionResponseTypes.ChannelMessageWithSource,
              data: {
                content: `⏳️ Loading videos...`,
              },
            },
          );

          const res = await fetch(
            `${AUTORENDER_BASE_API}/api/v1/videos/status/${interaction.user.id}`,
            {
              method: 'GET',
              headers: {
                'User-Agent': 'autorender-bot v1.0',
              },
            },
          );

          if (!res.ok) {
            throw new Error(`Videos request failed. Status: ${res.status}`);
          }

          type VideoStatus = Pick<Video, 'video_id' | 'title'> & {
            errored: boolean;
            rendering: boolean;
            rendered: boolean;
          };

          const videos = await res.json() as VideoStatus[];

          if (videos.length) {
            const getStatus = (video: VideoStatus) => {
              if (video.errored) {
                return '❌️';
              }

              if (video.rendering) {
                return '⌛️';
              }

              if (video.rendered) {
                return '📺️';
              }

              return '';
            };

            await bot.helpers.editOriginalInteractionResponse(
              interaction.token,
              {
                content: videos.map((video) => {
                  const title = escapeMaskedLink(video.title);
                  const link = getPublicUrl(`/videos/${video.video_id}`);
                  return `${getStatus(video)} [${title}](<${link}>)`;
                }).join('\n'),
              },
            );
          } else {
            await bot.helpers.editOriginalInteractionResponse(
              interaction.token,
              {
                content: `📺️ You have no rendered videos.`,
              },
            );
          }
        } catch (err) {
          console.error(err);

          await bot.helpers.editOriginalInteractionResponse(interaction.token, {
            content: `❌️ Failed to request rendered videos.`,
          });
        }
        break;
      }
      case 'random': {
        try {
          await bot.helpers.sendInteractionResponse(
            interaction.id,
            interaction.token,
            {
              type: InteractionResponseTypes.ChannelMessageWithSource,
              data: {
                content: `⏳️ Loading random video...`,
              },
            },
          );

          const res = await fetch(
            `${AUTORENDER_BASE_API}/api/v1/videos/random/1`,
            {
              method: 'GET',
              headers: {
                'User-Agent': 'autorender-bot v1.0',
              },
            },
          );

          if (!res.ok) {
            throw new Error(`Videos request failed. Status: ${res.status}`);
          }

          const [video] = await res.json() as Pick<Video, 'video_id' | 'title'>[];
          if (!video) {
            throw new Error('No videos found.');
          }

          const title = escapeMaskedLink(video.title);
          const link = getPublicUrl(`/videos/${video.video_id}`);

          await bot.helpers.editOriginalInteractionResponse(interaction.token, {
            content: `🎲️ [${title}](${link})`,
          });
        } catch (err) {
          console.error(err);

          await bot.helpers.editOriginalInteractionResponse(interaction.token, {
            content: `❌️ Failed to request random video.`,
          });
        }
        break;
      }
      default:
        break;
    }
  },
});
