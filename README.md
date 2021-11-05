# Demonstration of the [WordPress API Client](https://github.com/dkress59/wordpress-api-client)

## Prerequisites

- For a seamless development setup you need to have [Docker](https://www.docker.com/) and [NodeJS](https://nodejs.org/)
  installed
- You should have some basic knowledge of PHP and WP development
- You should be looking for a JS/TS WordPress-REST-API client

## Setup

- Start Docker and run `docker-compose up --build` from the project root
- Run either `yarn` or `npm install` from the project root
- Run `yarn dev` or `npm run dev`, respectively

## Usage

This repository consists of three components:

- A WordPress Plugin ([`/wp-plugin`](wp-plugin))
    - Extends WP with custom post types, rest routes and user capabilities
- A WordPress Theme ([`/wp-theme`](wp-theme))
    - Registers theme locations for navigation menus and defaults for Gutenberg
- A NodeJS http server ([`/src`](src))
    - Contains an example on how to set up a WpApiClient for this installation
    - Although this is an example of a server-side implementation, WpApiClient also works in a browser environment

You can [login to WordPress](http://localhost:8080/wp-login.php) with these credentials:

```yml
username: admin
password: password
```

While Docker and the http server are running, you can edit anything inside `/wp-plugin`, `/wp-theme` and `/src` and test
your modifications — the changes will take effect instantly.