# Static Collectors

Everytime you retrieve a post (any post type) or taxonomy the results will be collected
in a static field on the WpApiClient class. You can use `WpApiClient.collect('pages')`
to get a copy of all previously retrieved pages, if you would like to enable
collecting of your custom post type / custom taxonomy, there is
`WpApiClient.addCollection('products')`, and if you need to clear one or all
collections, you have `WpApiClient.clearCollection()`.

Instances of WpApiClient inherit the collections – which means you will have one
and the same collection even for different instances of WpApiClient:

```typescript
class MyFirstClient extends WpApiClient {
    constructor() {
		super('http://some-url.net')
	}
}
const client1 = new MyFirstClient()

class MySecondClient extends WpApiClient {
    constructor() {
		super('http://some-other-url.net')
	}
}
const client2 = new MySecondClient()

await Promise.all([
	client1.post().find(),
	client2.post().find(),
])

MyFirstClient.collect('posts')
// equals
MySecondClient.collect('posts')
// equals
WpApiClient.collect('posts')
// which holds the results of all clients' responses
```

?> This is a **bug**, not a feature

!> **Inheritance:** Using collectors is not recommended for multi-site installations
