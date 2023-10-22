/*
 * Copyright (c) 2023, NeKz
 *
 * SPDX-License-Identifier: MIT
 */

export const AutorenderVersion = '1.0.0';

export const AutorenderConnectUri = {
  dev: 'wss://autorender.portal2.local/connect/client',
  prod: 'wss://autorender.portal2.sr/connect/client',
};

export const AutorenderBaseApi = {
  dev: 'https://autorender.portal2.local',
  prod: 'https://autorender.portal2.sr',
};

export const UserAgent = `autorender-client/${AutorenderVersion}`;
