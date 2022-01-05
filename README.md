# WordPress-API Client

[![npm version](https://badge.fury.io/js/wordpress-api-client.svg)](https://badge.fury.io/js/wordpress-api-client)
 ![WordPress](https://img.shields.io/badge/WordPress-%23117AC9.svg?style=flat&logo=WordPress&logoColor=white)
 ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
 ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat&logo=javascript&logoColor=%23F7DF1E)
 ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=flat&logo=jest&color=f07)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=dkress59_wordpress-api-client&metric=coverage)](https://sonarcloud.io/summary/new_code?id=dkress59_wordpress-api-client)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=dkress59_wordpress-api-client&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=dkress59_wordpress-api-client)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=dkress59_wordpress-api-client&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=dkress59_wordpress-api-client)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=dkress59_wordpress-api-client&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=dkress59_wordpress-api-client)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=dkress59_wordpress-api-client&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=dkress59_wordpress-api-client)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=dkress59_wordpress-api-client&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=dkress59_wordpress-api-client)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=dkress59_wordpress-api-client&metric=bugs)](https://sonarcloud.io/summary/new_code?id=dkress59_wordpress-api-client)

A typed JavaScript client for your WordPress REST API. Super simple yet highly extensible.

This library covers all built-in WP REST API routes and can easily be extended
with custom routes. Fully integrated with [Advanced Custom Fields](https://advancedcustomfields.com).

---

## Installation

Depending on the package manager of your choice:

```bash
yarn add wordpress-api-client
```

```bash
npm install wordpress-api-client
```

---

## Quick Start

If you only need to access public REST routes from a vanilla WordPress installation,
all you need is:

```typescript
import WpApiClient, { WPCategory, WPPage, WPPost } from 'wordpress-api-client'
export const client = new WpApiClient('https://my-wordpress-website.com')
```

The next example shows how this bare setup, from above, will already cover most
of your needs:

```typescript
import WpApiClient from 'wordpress-api-client'

async function getContent(): Promise<{
    aboutPage: WPPage | null
    contactPage: WPPage | null
    frontPage: WPPage | null
    categories: WPCategory[]
    recent25posts: WPPost[]
}> {
    const client = new WpApiClient('https://my-wordpress-website.com')

    const [aboutPage, contactPage, frontPage] = await client.page().find(12, 23, 34)
    const categories = await client.postCategories().find()
    const recent25posts = await client.posts().find(new URLSearchParams({
        order: 'desc',
        per_page: '25',
    }))

    return { frontPage, aboutPage, contactPage, categories, recent25Posts }
}
```

If you would like to extend the client, adding post types and REST end points is
as easy as you would expect (example from the [demo project](https://github.com/dkress59/wordpress-api-client/tree/demo)):

```typescript
import { CustomPost, WPMenu, WPProduct } from './types'
import WpApiClient, { DefaultEndpointWithRevision } from 'wordpress-api-client'

const EP_PRODUCTS = 'wp/v2/products'
const EP_MENU = 'demo-plugin/v1/menu'

export class WpClient extends WpApiClient {
    constructor() {
        super('http://localhost:8080', {
            auth: {
                type: 'basic',
                password: 'password',
                username: 'admin',
            },
        })
    }

    post<P = CustomPost>(): DefaultEndpointWithRevision<P> {
        return super.post<P>()
    }

    public product(): DefaultEndpointWithRevision<WPProduct> {
        return this.addPostType<WPProduct>(EP_PRODUCTS, true)
    }

    menu = this.createEndpointCustomGet<WPMenu>(EP_MENU)
}
```

With this `WpClient` class, extended from this package's `WpApiClient` class, you have full access to your WordPress's REST API, including your custom post types, custom end points and Advanced Custom Fields:

```ts
import { WpClient } from './wp-client'
const client = new WpClient()

// custom end points
await client.menu()

await client.product().find()
await client.product().create()
await client.product().update()
await client.product().delete()
await client.product().revision().find()
await client.product().revision().create()
await client.product().revision().update()
await client.product().revision().delete()

// default end points
await client.siteSettings.find()
await client.taxonomy().find()
await client.page().find()
await client...

```

## Documentation

Feel free to report an [issue](https://github.com/dkress59/wordpress-api-client/issues)
if you are having trouble and the [documentation](https://dkress59.github.io/wordpress-api-client/)
is not helping.
