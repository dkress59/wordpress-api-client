# Private Methods

The WpApiClients private/protected methods are utilities in order to add fully
compatible custom end points to a extension of WpApiClient. The only really
relevant private methods are
[`.addPostType`](#addposttype),
[`.createEndpointCustomGet`](#createendpointcustomget)
and  [`.createEndpointCustomPost`](#createendpointcustompost).

## .createEndpointGet

Internally used by [`.defaultEndpoint`](#defaultendpoint). Returns the "default"
`.find` method for a given endpoint.

```typescript
import WpApiClient from 'wordpress-api-client'

const customEndpoint = 'custom/endpoint'

class CmsClient extends WpApiClient {
	constructor() {
		super('http://mywebsite.com')
    }

    findSomething = this.createEndpointGet(
        customEndpoint,
        new URLSearchParams({ per_page: '25' })
    )
}

const client = new CmsClient()

await client.findSomething(new URLSearchParams({ per_page: '8' }))
// GET http://mywebsite.com/wp-json/custom/endpoint?per_page=8

await client.findSomething(new URLSearchParams({ context: 'view' }), 1, 2)
// GET http://mywebsite.com/wp-json/custom/endpoint/1?per_page=25&context=view
// GET http://mywebsite.com/wp-json/custom/endpoint/2?per_page=25&context=view

```

## .createEndpointPost

Internally used by [`.defaultEndpoint`](#defaultendpoint). Returns the `.create`
and `.update` methods for a given endpoint.

```typescript
import WpApiClient from 'wordpress-api-client'

const customEndpoint = 'custom/endpoint'

class CmsClient extends WpApiClient {
	constructor() {
		super('http://mywebsite.com')
    }

    postSomething = this.createEndpointPost(customEndpoint)
}

const client = new CmsClient()

await client.postSomething({ title: 'New Title'})
// POST http://mywebsite.com/wp-json/custom/endpoint

await client.postSomething({ title: 'Updated Title'}, 1)
// POST http://mywebsite.com/wp-json/custom/endpoint/1

```

## .createEndpointDelete

Internally used by [`.defaultEndpoint`](#defaultendpoint). Returns the "default"
`.delete` method for a given endpoint.

```typescript
import WpApiClient from 'wordpress-api-client'

const customEndpoint = 'custom/endpoint'

class CmsClient extends WpApiClient {
	constructor() {
		super('http://mywebsite.com')
    }

    deleteSomething = this.createEndpointDelete(
        customEndpoint,
        new URLSearchParams({ example: 'true' })
    )
}

const client = new CmsClient()

await client.deleteSomething(new URLSearchParams({ context: 'edit' }), 1, 2)
// DELETE http://mywebsite.com/wp-json/custom/endpoint/1?example=true&context=edit
// DELETE http://mywebsite.com/wp-json/custom/endpoint/2?example=true&context=edit

```

## .createEndpointCustomGet

If you would like to add a "standard" GET method to your client, with built-in authentication
but without all of the `.find`-specific logic, you can use `.createEndpointCustomGet`.
See [Custom End Points](usage/custom-end-points.md).

## .createEndpointCustomPost

If you would like to add a "standard" GET method to your client, with built-in authentication
but without all of the `.create`-/`.update`-specific logic, you can use `.createEndpointCustomPost`.
See [Custom End Points](usage/custom-end-points.md).

## .defaultEndpoint

Internally used by [`.addPostType`](#addposttype). Returns and object consisting
of the "default" endpoints `.create`, `.find`, `.update` and `.delete`.

```typescript
export class WpApiClient {

    // …

	protected defaultEndpoints<P = WPPost>(
		endpoint: string,
		defaultParams?: URLSearchParams,
	): DefaultEndpoint<P> {
		return {
			find: this.createEndpointGet<P>(endpoint, defaultParams),
			create: this.createEndpointPost<P>(endpoint),
			update: this.createEndpointPost<P>(endpoint),
			delete: this.createEndpointDelete<P>(endpoint),
		}
	}

    // …

}
```

## .addPostType

Gives the possibility to easily add all "default" methods (optionally, including
revisions) for a custom post type. See [Custom Post Types](usage/custom-post-types.md).

```typescript
export class WpApiClient {

    // …

	protected addPostType<P = WPPost>(
		endpoint: string,
		withRevisions = false,
		defaultParams?: URLSearchParams,
	): {
		find: EndpointFind<P>
		create: EndpointCreate<P>
		delete: EndpointDelete<P>
		update: EndpointUpdate<P>
		revision?: (postId: number) => {
			find: EndpointFind<P>
			create: EndpointCreate<P>
			delete: EndpointDelete<P>
			update: EndpointUpdate<P>
		}
	} {
		return {
			...this.defaultEndpoints(endpoint, defaultParams),
			revision: !withRevisions
				? undefined
				: (postId: number) => ({
						...this.defaultEndpoints(
							`${endpoint}/${postId}/revisions`,
							defaultParams,
						),
				  }),
		}
	}

    // …

}
```
