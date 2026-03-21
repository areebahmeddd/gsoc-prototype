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

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
```

See [tests/README.md](tests/README.md) for full details on test structure and coverage.

## Stack

| Package                                                     | Version | Purpose                                            |
| ----------------------------------------------------------- | ------- | -------------------------------------------------- |
| [Open Food Facts API](https://world.openfoodfacts.org/data) | v2      | Product nutrition and score data                   |
| [WXT](https://wxt.dev)                                      | 0.20.x  | Browser extension framework (Chrome MV3 + Firefox) |
| [React](https://react.dev)                                  | 19.x    | UI components and hooks                            |
| [TypeScript](https://www.typescriptlang.org)                | 5.x     | Type-safe source                                   |
| [Tailwind CSS](https://tailwindcss.com)                     | 4.x     | Utility-first styling                              |
