# Public Methods

<details>
<summary><h3 style="display:inline">.applicationPassword()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/application-passwords/)]

See [Default Methods](usage/default-methods.md#default-methods).

Your WP must have SSL enabled, to be able to use this feature via the REST API.
Refer to the [WP Integration Guide](https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/)
to find out more.

</details>

---

<details>
<summary><h3 style="display:inline">.blockDirectory()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/block-directory-items/)]

</details>

---

<details>
<summary><h3 style="display:inline">.blockType()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/block-types/)]

</details>

---

<details>
<summary><h3 style="display:inline">.comment()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/comments/)]

See [Default Methods](usage/default-methods.md#default-methods).

</details>

---

<details>
<summary><h3 style="display:inline">.media()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/media/)]

See [Default Methods](usage/default-methods.md#default-methods).

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

</details>

---

<details>
<summary><h3 style="display:inline">.page()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/pages/)]

See [Default Methods](usage/default-methods.md#default-methods).

</details>

---

<details>
<summary><h3 style="display:inline">.plugin()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/plugins/)]

You can list, install, activate and deactivate plugins with the client, although
you need to be [authenticated](usage/authentication.md) to use this method.

</details>

---

<details>
<summary><h3 style="display:inline">.post()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/posts/)]

See [Default Methods](usage/default-methods.md#default-methods).

</details>

---

<details>
<summary><h3 style="display:inline">.postCategory()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/categories/)]

See [Default Methods](usage/default-methods.md#default-methods).

</details>

---

<details>
<summary><h3 style="display:inline">.postTag()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/tags/)]

See [Default Methods](usage/default-methods.md#default-methods).

</details>

---

<details>
<summary><h3 style="display:inline">.postType()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/pos-types/)]

</details>

---

<details>
<summary><h3 style="display:inline">.renderedBlock()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/rendered-blocks/)]

</details>

---

<details>
<summary><h3 style="display:inline">.reusableBlock()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/blocks/)]

See [Default Methods](usage/default-methods.md#default-methods).

</details>

---

<details>
<summary><h3 style="display:inline">.search()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/search-results/)]

You can simply search by text and/or modify the search query:

```typescript
const searchResults = await client.search(
	'Search by string.',
	new URLSearchParams({ per_page: '25' }),
)
```

The response is an array of `WP_REST_API_Search_Result`s.

</details>

---

<details>
<summary><h3 style="display:inline">.siteSettings()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/settings/)]

</details>

---

<details>
<summary><h3 style="display:inline">.status()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/post-statuses/)]

</details>

---

<details>
<summary><h3 style="display:inline">.taxonomy()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/taxonomies/)]

The `.taxonomy` method only returns a list of the installed taxonomies.

</details>

---

<details>
<summary><h3 style="display:inline">.theme()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/themes/)]

The `.theme` method only returns a list of the installed themes.

</details>

---

<details>
<summary><h3 style="display:inline">.user()</h3></summary>

[[WP Endpoint Reference](https://developer.wordpress.org/rest-api/reference/users/)]

See [Default Methods](usage/default-methods.md#default-methods).

Besides the usual `.create`, `.delete`, `.find`, and `.update` there are
two additional `.user` methods, for the currently **logged-in user**: `.findMe`
and `.deleteMe`. In order to delete or to retrieve their information,
you do not have to provide a parameter – but you need to be [authenticated](usage/authentication.md).

</details>
