# OpenFoodFacts eStore

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deploy](https://github.com/openfoodfacts/openfoodfacts-estore/actions/workflows/deploy.yaml/badge.svg)](https://github.com/openfoodfacts/openfoodfacts-estore/actions)

Browser extension that surfaces Nutri-Score, Eco-Score, NOVA group, and front-of-package warnings directly on grocery store product pages - without leaving the store.

> This project is part of [Google Summer of Code 2026](https://summerofcode.withgoogle.com/programs/2026/organizations/open-food-facts)

## How it works

A floating button appears on supported store pages. Hover it to see a score card pulled live from the [Open Food Facts](https://world.openfoodfacts.org) database, matched by the product's barcode extracted from the page URL.

The popup lets you toggle the overlay per store and switch between supported countries.

## Browser support

Supports **Chromium-based** (Chrome, Edge, and more) and **Gecko-based** (Firefox, and more) engines.

## Supported stores

| Country | Stores         |
| ------- | -------------- |
| Canada  | Metro, Walmart |
| France  | (coming soon)  |
| India   | (coming soon)  |

## Development

```bash
npm install

# Dev mode
npm run dev:chrome
npm run dev:firefox

# Production build
npm run build:chrome
npm run build:firefox

# Packaged zip
npm run zip:chrome
npm run zip:firefox
```

## Stack

- [Open Food Facts API v2](https://world.openfoodfacts.org/data)
- [WXT](https://wxt.dev) - extension framework
- React 19 + Typescript 5
- Tailwind CSS v4
