/*
 * Copyright (c) 2023, NeKz
 *
 * SPDX-License-Identifier: MIT
 *
 * This checks if there are any videos to render from board.portal2.sr.
 */

import { logger } from '../logger.ts';

export const BOARD_BASE_API = 'https://board.portal2.sr';
export const AUTORENDER_BASE_API = 'https://autorender.portal2.sr/api/v1';

export type ChangelogOptions =
  & {
    id?: number;
    chamber?: string;
    chapter?: string;
    boardName?: string;
    profileNumber?: string;
    type?: string;
    sp?: 0 | 1;
    coop?: 0 | 1;
    wr?: 0 | 1;
    demo?: 0 | 1;
    yt?: 0 | 1;
    endDate?: string;
    startRank?: number;
    endRank?: number;
    submission?: 0 | 1;
    banned?: 0 | 1;
    pending?: 0 | 1 | 2;
  }
  & (
    {
      maxDaysAgo?: number;
    } | {
      startDate?: string;
    }
  );

export interface ChangelogEntry {
  player_name: string;
  avatar: string;
  profile_number: string;
  score: string;
  id: string;
  pre_rank: string;
  post_rank: string;
  wr_gain: string;
  time_gained: string;
  hasDemo: string;
  youtubeID: string | null;
  note: string;
  banned: string;
  submission: string;
  pending: string;
  previous_score: string | null;
  chamberName: string;
  chapterId: string;
  mapid: string;
  improvement: number;
  rank_improvement: number | null;
  pre_points: number | null;
  post_point: number | null;
  point_improvement: number | null;
}

export const getChangelog = async (options?: ChangelogOptions) => {
  const params = new URLSearchParams();

  Object.entries(options ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, value.toString());
    }
  });

  const query = params.toString();

  const url = `${BOARD_BASE_API}/changelog/json?${query}`;
  logger.info(`[GET] ${url}`);

  const res = await fetch(url, {
    headers: {
      'User-Agent': Deno.env.get('USER_AGENT')!,
    },
  });

  if (!res.ok) {
    logger.error('Failed to fetch changelog:', res.status);
    return null;
  }

  return await res.json() as ChangelogEntry[];
};

export const formatCmTime = (time: number) => {
  if (isNaN(time)) return '0.00';
  const cs = time % 100;
  const secs = Math.floor(time / 100);
  const sec = secs % 60;
  const min = Math.floor(secs / 60);
  return min > 0
    ? `${min}:${sec < 10 ? `0${sec}` : `${sec}`}.${cs < 10 ? `0${cs}` : `${cs}`}`
    : `${sec}.${cs < 10 ? `0${cs}` : `${cs}`}`;
};

export const fetchDemo = async (url: string) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': Deno.env.get('USER_AGENT')!,
    },
    redirect: 'manual',
  });

  const location = res.headers.get('Location');
  if (!location) {
    logger.error({ url: res.url, headers: res.headers });
    throw new Error('Unable to redirect without location.');
  }

  const redirect = new URL(res.url);
  redirect.pathname = location;

  const demo = await fetch(redirect.toString(), {
    method: 'GET',
    headers: {
      'User-Agent': Deno.env.get('USER_AGENT')!,
    },
  });

  return {
    demo,
    originalFilename: location.slice(location.lastIndexOf('/') + 1),
  };
};

export interface VideoInfo {
  comment: string | null;
  cur_rank: number;
  date: string;
  id: number;
  map: string;
  map_id: number;
  obsoleted: number;
  orig_rank: number;
  rendered_by: string;
  time: number;
  user: string;
  user_id: string;
  views: number;
}

export const getInfo = async (changelogId: string) => {
  const url = `${AUTORENDER_BASE_API}/video/${changelogId}/info`;

  logger.info(`[GET] ${url}`);

  const res = await fetch(url, {
    headers: {
      'User-Agent': Deno.env.get('USER_AGENT')!,
    },
  });

  if (!res.ok) {
    logger.error('Failed to get video info:', res.status);
    return null;
  }

  return await res.json() as VideoInfo;
};
