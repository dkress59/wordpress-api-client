# Default Methods

With a bare instance of WpApiClient you will get methods to retreive, add and
update any post, page, media item, post category or post tag.
To instantiate a WP-API Client you need to pass the base URL of your WordPress
website to the constructor.

With the second argument, the constructor options,
you can define authentication, default headers, and an onError function.

?> If `options.onError` is undefined, any error will be printed to the console

<details>
<summary>
  <h2 style="display:inline-block">Methods List </h2>
</summary>

```typescript
import { WpApiClient } from 'wordpress-api-client'
const client = new WpApiClient('https://my-wordpress-website.com')


client.post().create()
client.post().find()
client.post().delete()
client.post().update()
client.post().revision().create()
client.post().revision().find()
client.post().revision().delete()
client.post().revision().update()

client.page().create()
client.page().find()
client.page().delete()
client.page().update()
client.page().revision().create()
client.page().revision().find()
client.page().revision().delete()
client.page().revision().update()

client.comment().create()
client.comment().find()
client.comment().delete()
client.comment().update()

client.postCategory().create()
client.postCategory().find()
client.postCategory().delete()
client.postCategory().update()

client.postTag().create()
client.postTag().find()
client.postTag().delete()
client.postTag().update()

client.media().create()
client.media().find()
client.media().delete()
client.media().update()

client.user().create()
client.user().find()
client.user().findMe()
client.user().delete()
client.user().deleteMe()
client.user().update()

client.plugin().create()
client.plugin().find()
client.plugin().delete()
client.plugin().update()

client.applicationPassword().create()
client.applicationPassword().find()
client.applicationPassword().delete()
client.applicationPassword().update()

client.reusableBlock().create()
client.reusableBlock().find()
client.reusableBlock().delete()
client.reusableBlock().update()
client.reusableBlock().autosave().create()
client.reusableBlock().autosave().find()

client.blockDirectory()
client.blockType()
client.postType()
client.search()
client.siteSettings()
client.status()

WpApiClient.addCollection()
WpApiClient.collect()
WpApiClient.clearCollection()

```

</details>

<details>
<summary>
  <h2 style="display:inline-block">.find(...ids: number[])</h2>
</summary>

### find all

To retrieve a list of all of your site's posts, call `await client.post().find()`.
The response will be an empty array if no posts were found, otherwise it will
return **all** of your posts.

? > The WP REST API is capped at a maximum of 100 entries per page, so any `.find()`
method will perform as many requests as necessary in order to return **all** results.
To disable this behavior and to only return a maximum of 100 results from a single
response, the `page` or `offset` query params can be used (e.g.
  `await client.post().find(new URLSearchParams({ page: '1' }))`
).

Below is an example how to change up the default query parameters, e.g. if you would
like to change the defaults for the `.post` methods. But you can also
[modify the query parameters](#find-with-params) directly on any `.find` method.

```typescript
import WpApiClient, {
	END_POINT,
    DefaultEndpointWithRevision,
	WPPost,
} from 'wordpress-api-client'
import { baseURL } from './constants'
import { CustomPage } from './types'

export class CmsClient extends WpApiClient {
    constructor() {
        super(baseURL)
    }

    public post<P = WPPost>(): DefaultEndpointWithRevision<P> {
		const queryParams = new URLSearchParams({
			_embed: 'true',
			order: 'asc',
			per_page: '8',
		})
        return {
			...this.defaultEndpoints(END_POINT.POSTS, queryParams),
			revision: {
				...this.defaultEndpoints(END_POINT.POSTS + '/revisions', queryParams)
			},
		}
    }
}
```

### find one or many

Specific posts can be retrieved via post id, e.g.:

```typescript
const [frontPage, contactPage, productPage] = await client.page().find(12, 34, 123)
```

?> **Note:** If there is an error (e.g. [authentication](usage/authentication.md)),
the respective promise will resolve to `null`.

?> You do not need to be authenticated to retrieve password-protected posts/pages
– the password must be appended as URLSearchParams:

### find with params

Query parameters can be added/modified for any `.find` method by simply providing
an instance of URLSearchParams to it, as the first parameter:

```typescript
const posts = await client.post().find(new URLSearchParams({ per_page: '12' }))
```

### find revision

You cannot retrieve a list of revisions of all posts, but you can retrieve all
revisions for a specific post:

```typescript
const revisions = await client.post(1).revision().find()
```

</details>

<details>
<summary>
  <h2 style="display:inline-block">.create(body: WPCreate<WPPost>)</h2>
</summary>

When creating new content you should be aware of a couple of things, most of which
an internal function of this package automatically takes care of:

- You need to be [authenticated](usage/authentication.md)
- The `id` field must be omitted (needs to be designated by WP)
- Unlike the API response objects, the fields `title`, `content` and `excerpt`
  of the request body only accept plain HTML strings
- Taxonomies can be assigned by referencing the respective term IDs, e.g.
  `categories: [2, 34], tags: [5, 67]`

?> See [Helper Methods](usage/helper-methods.md) for more info on the
`WPCreate` type

</details>

<details>
<summary>
  <h2 style="display:inline-block">.update(body: WPCreate<WPPost>, id: number)</h2>
</summary>

The pointers above, for the `.create` method, are also valid for `.update`.

</details

<details>
<summary>
  <h2 style="display:inline-block">.delete(id: number)</h2>
</summary>

You need to be [authenticated](usage/authentication.md) to use this method.
DELETE for objects that have no trash can status (e.g. categories or media) will
be called with the query parameter `force=true`. This behavior can be controlled
with the `trashable` constructor option, which receives a list of end points (e.g.
`trashable: ['wp/v2/media', 'wp/v2/categories']`).

</details>

---

## .media()

This library supports easy uploading of media to your WP Media Library:

```typescript
client.media().create(
	fileName: string,
	file: Buffer,
	mimeType?: string,
	data: Partial<>
)
```

The `file` parameter only accepts a Buffer which will be base64-encoded for transmission.
This makes import-jobs uncomplicated, where you can buffer a file from disk and
do not have to care about encoding. But if your to-be-uploaded media is a string
(e.g. a file retrieved via HTTP request) there is always:

```typescript
Buffer.from('my-file-string')
// or e.g.
Buffer.from('my-b64-encoded-file-string', 'base64')
```

You provide meta data for the media library item, such as a title, description,
caption or a post it is supposed to be attached to, with the last param. WpApiClient
therefore internally performs a second update-request to the newly created media
library item.

```typescript
import fs from 'fs'
import path from 'path'

const sourceFile = fs.readFileSync(
	path.resolve(__dirname, './image.png'),
)

async function uploadMedia() {
	const mediaLibraryItem = await client.media().create(
		'new-filename.png',
		sourceFile,
		'image/png',
		{
			alt_text: 'alt-text for the <img /> alt property',
			caption: 'caption for the <figure /> html node',
			post: 123,
		},
	)
}
```

---

## .user()

Besides the usual `.create`, `.delete`, `.find`, and `.update` there are
two additional `.user` methods, for the currently **logged-in user**: `.findMe`
and `.deleteMe`. In order to delete or to retrieve their information,
you do not have to provide a parameter – but you need to be [authenticated](usage/authentication.md).

---

## .search()

You can simply search by text and/or modify the search query:

```typescript
const searchResults = await client.search(
	'Search by string.',
	new URLSearchParams({ per_page: '25' }),
)
```

The response is an array of `WP_REST_API_Search_Result`s.

---

## .plugin()

You can list, install, activate and deactivate plugins with the client, although
you need to be [authenticated](usage/authentication.md) to use this method.

---

## .theme()

The `.theme` method only returns a list of the installed themes.
