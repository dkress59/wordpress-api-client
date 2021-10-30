# Default Methods

To instantiate a WP-API Client you need to pass the base URL of your WordPress
website to the constructor. You can pass an `onError`-function as the second
parameter and an exisitng axiosInstance as the third parameter (more on that here:
[JWT-Auth for WordPress](usage/authentification.md#jwt-auth-for-wordpress)).
With a bare instance of WpApiClient you will get methods to retreive, add and
update any post, page, media item, post category or post tag.

## Methods List

```typescript
import { WpApiClient } from 'wordpress-api-client'
const client = new WpApiClient('https://my-wordpress-website.com')

client.post().create()
client.post().find()
client.post().delete()
client.post().update()
client.post().revision.create()
client.post().revision.find()
client.post().revision.delete()
client.post().revision.update()

client.page().create()
client.page().find()
client.page().delete()
client.page().update()
client.page().revision.create()
client.page().revision.find()
client.page().revision.delete()
client.page().revision.update()

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

## .find(...ids: number[])

### find all

To retrieve a list of all of your site's posts, call `await client.post().find()`.
The response will be empty if no posts were found, otherwise it is paginated at
100 objects per page.

If you would like to change up the default query parameters, you can extend the
`.post` method:

!> **ToDo:** [wordpress-api-client/projects/1#card-71638560](https://github.com/dkress59/wordpress-api-client/projects/1#card-71638560 ':crossorgin')

```typescript
import WpApiClient, {
	END_POINT,
    EndpointCreate,
    EndpointDelete,
    EndpointFind,
    EndpointUpdate,
	WPPost,
} from 'wordpress-api-client'
import { baseURL } from './constants'
import { CustomPage } from './types'

export class CmsClient extends WpApiClient {
    constructor() {
        super(baseURL)
    }

    public post<P = WPPost>(): {
        create: EndpointCreate<P>
        delete: EndpointDelete<P>
        find: EndpointFind<P>
        update: EndpointUpdate<P>
		revision: {
			create: EndpointCreate<P>
			delete: EndpointDelete<P>
			find: EndpointFind<P>
			update: EndpointUpdate<P>
		}
    } {
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

?> **Note:** If there is an error (e.g. [authentification](usage/authentification.md)),
the respective promise will resolve to `null`.

### find with params

!> **ToDo** [wordpress-api-client/projects/1#card-71687889](https://github.com/dkress59/wordpress-api-client/projects/1#card-71687889 ':crossorgin')

## .create(body: WPCreate<WPPost>)

When creating new content you need to be aware of a couple of things:

- You need to be [authenticated](usage/authentification.md)
- The `id` field is invalid (needs to be designated by WP)
- Unlike the response typings, the fields `title`, `content` and `excerpt` of the
  request body only accept plain HTML strings
- Taxonomies can be assigned by referencing the respective term IDs, e.g.
  `categories: [ 2, 34 ], tags: [5, 67]`

?> See [Helper Methods](usage/helper-methods.md) for more info on the
`WPCreate` type

## .update(body: WPCreate<WPPost>, id: number)

The pointers above, for the `.create` method, are also valid for `.update`.

## .delete(id: number)

You need to be [authenticated](usage/authentification.md) to use this method.

---

## .media()

This library only supports one way of uploading media to your WP Media Library:

```typescript
client.media().create(
	fileName: string,
	data: Buffer,
	mimeType?: string,
)
```

The `data` parameter only accepts a Buffer which will be base64-encoded for transmission.
This makes import-jobs uncomplicated, where you can buffer a file from disk and
do not have to care about encoding. But there is always

```typescript
Buffer.from('my-encoded-data')
```

if your to-be-uploaded media is a string (e.g. a file retrieved via HTTP request).

---

## .user()

Besides the usual `.create`, `.delete`, `.find`, and `.update` there are
two additional `.user` methods, for the currently **logged-in user**: `.findMe`
and `.deleteMe`. In order to delete or to retrieve their information,
you do not have to provide a parameter – but you need to be [authenticated](usage/authentification.md).

---

## .search()

[ ToDo: Docs ]

---

## .plugin()

[ ToDo: Docs ]

---

## .theme()

The pointers above, for the `.plugin` method, are also valid for `.theme`.
