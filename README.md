# WordPress-API Client

A typed JavaScript client for your WordPress REST API. Super simple yet highly extensible.

[![npm version](https://badge.fury.io/js/wordpress-api-client.svg)](https://badge.fury.io/js/wordpress-api-client) ![WordPress](https://img.shields.io/badge/WordPress-%23117AC9.svg?style=flat&logo=WordPress&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat&logo=javascript&logoColor=%23F7DF1E) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=flat&logo=jest&color=f07) [![codecov](https://codecov.io/gh/dkress59/wordpress-api-client/branch/main/graph/badge.svg?token=1Z3R5J16FK)](https://codecov.io/gh/dkress59/wordpress-api-client)

## Installation

Depending on the package manager of your choice:

```bash
yarn add wordpress-api-client
```

```bash
npm install wordpress-api-client
```

## Usage

The [Documentation](https://dkress59.github.io/wordpress-api-client/) still is WIP, but the most important things are already in there.

---

## Changelog

The current progress can be tracked [here](https://github.com/dkress59/wordpress-api-client/projects/1).

### v0.1.3

- added methods for most missing default wp-api routes, such as
  - .plugin() for `/wp/v2/plugins`
  - .postType() for `/wp/v2/types`
  - .taxonomy() for `/wp/v2/taxonomies`
  - .theme() for `/wp/v2/themes`
  - …and quite some more

### v0.1.2

- repaired type casting in handleWpApiError()

### v0.1.1

- import path repaired

### v0.1.0

- public beta release
