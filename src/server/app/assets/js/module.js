// Copyright (c) 2023, NeKz
// SPDX-License-Identifier: MIT

/// <reference lib="dom" />

const minWidthBreakpoints = {
  md: 768,
};

// Navbar

const navItemsLeft = document.getElementById('nav-items-left');
const navBackButton = document.getElementById('nav-back-button');
const navSearchButton = document.getElementById('nav-search-button');
const navSearch = document.getElementById('nav-search');
const navSearchItems = document.getElementById('nav-search-items');
/** @type {HTMLInputElement} */
const navSearchInput = document.getElementById('nav-search-input');
const navSearchInputClearButton = document.getElementById('nav-search-input-clear-button');
const navItemsRight = document.getElementById('nav-items-right');
const themeToggleButton = document.getElementById('theme-toggle-button');
const userMenuButton = document.getElementById('user-menu-button');
const userMenuDropDown = document.getElementById('user-menu-dropdown');
const loginButton = document.getElementById('login-button');

const search = {
  isOpen: false,
  open: null,
  close: null,
  input: null,
  clear: null,
  shortcut: null,
};

if (
  navItemsLeft && navSearchButton && navSearch && navSearchItems && navSearchInput && navSearchInputClearButton &&
  navItemsRight && themeToggleButton
) {
  search.open = (options) => {
    if (search.isOpen) {
      return;
    }

    search.isOpen = true;
    navSearchItems.classList.add('w-full');
    navItemsLeft.classList.add('hidden');
    navSearchButton.classList.add('hidden');
    navSearch.classList.remove('hidden');
    navBackButton.classList.remove('hidden');
    themeToggleButton.classList.add('hidden');
    userMenuButton?.classList?.add('hidden');
    userMenuDropDown?.classList?.add('hidden');
    loginButton?.classList?.add('hidden');
    options?.focus && navSearchInput.focus();
    navSearchInput.value?.length && navSearchInputClearButton.classList.remove('hidden');
  };

  search.close = (options) => {
    if (!search.isOpen) {
      return;
    }

    if (location.pathname.startsWith('/search') && window.innerWidth <= minWidthBreakpoints.md && !options?.force) {
      return;
    }

    search.isOpen = false;
    navSearchItems.classList.remove('w-full');
    navItemsLeft.classList.remove('hidden');
    navSearchButton.classList.remove('hidden');
    navBackButton.classList.add('hidden');
    navSearch.classList.add('hidden');
    themeToggleButton.classList.remove('hidden');
    userMenuButton?.classList?.remove('hidden');
    userMenuDropDown?.classList?.remove('hidden');
    loginButton?.classList?.remove('hidden');
  };

  /** @param {KeyboardEvent} ev */
  search.input = (ev) => {
    const value = ev.target.value ?? '';

    if (value.length) {
      if (ev.key === 'Enter') {
        location.href = `/search?q=${encodeURIComponent(value)}`;
      }

      navSearchInputClearButton.classList.remove('hidden');
    } else {
      navSearchInputClearButton.classList.add('hidden');
    }
  };

  search.clear = () => {
    navSearchInput.value = '';
    navSearchInput.focus();
    navSearchInputClearButton.classList.add('hidden');
  };

  /** @param {KeyboardEvent} ev */
  search.shortcut = (ev) => {
    if (ev.key === 'k' && ev.ctrlKey && navSearchInput !== document.activeElement) {
      ev.preventDefault();
      navSearchInput.focus();
    }
  };

  navSearchButton.addEventListener('click', () => search.open({ focus: true }));
  navSearchInput.addEventListener('focusout', () => search.close());
  navSearchInput.addEventListener('keydown', search.input);
  navBackButton.addEventListener('click', () => search.close({ force: true }));
  navSearchInputClearButton.addEventListener('click', () => search.clear());
  document.addEventListener('keydown', search.shortcut());
}

const darkButton = document.getElementById('theme-toggle-dark-icon');
const lightButton = document.getElementById('theme-toggle-light-icon');

const themeButton = localStorage.getItem('color-theme') === 'dark' ||
    (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ? lightButton
  : darkButton;

themeButton.classList.remove('hidden');

if (themeToggleButton) {
  themeToggleButton.addEventListener('click', () => {
    darkButton.classList.toggle('hidden');
    lightButton.classList.toggle('hidden');

    const colorTheme = localStorage.getItem('color-theme');
    const setDarkMode = (colorTheme && colorTheme !== 'dark') || !document.documentElement.classList.contains('dark');

    document.documentElement.classList[setDarkMode ? 'add' : 'remove']('dark');
    localStorage.setItem('color-theme', setDarkMode ? 'dark' : 'light');
  });
}

// Videos

if (location.pathname.startsWith('/videos/') && location.pathname.length === 19) {
  await fetch(`/api/v1${location.pathname}/views`, { method: 'POST' });

  const video = document.querySelector('video');
  if (video) {
    const videoVolume = parseFloat(localStorage.getItem('video-volume'));
    if (!isNaN(videoVolume)) {
      video.volume = videoVolume;
    }

    video.addEventListener('volumechange', (event) => {
      if (event.target) {
        localStorage.setItem('video-volume', event.target.volume.toString());
      }
    });
  }
}

// Search

if (location.pathname.startsWith('/search') && location.search.length !== 0) {
  if (window.innerWidth <= minWidthBreakpoints.md && search.open) {
    search.open();
  }
}

// Page Not Found

const goBackButton = document.querySelector('#not-found-go-back');
if (goBackButton) {
  goBackButton.addEventListener('click', () => history.back());
}