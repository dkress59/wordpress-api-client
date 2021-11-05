# Helper Methods

The WpApiClient class uses three utility types and four helper methods:

- WPCreate
- EndpointCreate
- EndpointUpdate
- createEndpointGet
- createEndpointPost
- createEndpointCustomGet
- createEndpointCustomPost
- defaultEndpoints (ToDo: Docs)
- addPostType (ToDo: Docs)

To understand `.createEndpointGet()` and `.createEndpointPost()`, one needs to
know a few things about the WordPress API itself: To retreive a list of posts,
one needs to GET-request the route `/posts`. For a specific post the route that
needs to be requested `/posts/{id}`. The same goes for pages; `/pages`, `/pages/{id}`.

To update a specific post or page, a POST request must be sent to `/posts{id}` or
`/pages/{id}`, for a new post/page the POST request goes directly to `/posts`/
`/pages`. This schema is valid for all WordPress-built-ins (Posts, Pages, Post-
Categories, Post-Tags, Media), and also for all registered [Custom Post Types](https://developer.wordpress.org/reference/functions/register_post_type/ ':crossorgin')
and [Custom Taxonomies](https://developer.wordpress.org/reference/functions/register_taxonomy/ ':crossorgin').

For this recurring schema the WpApiClient class (and any sub-class) can use the
methods `.createEndpointGet()` and `.createEndpointPost()`. Both methods responses'
type can be casted on the respective method, and both methods need the path to
your end point (starting after `/wp-json`) as parameter. See the [next chapter](usage/custom-post-types.md)
for an example. The two POST-Methods use a utility type, `WPCreate`, because the
output format of the `post_content` and `post_title` fields is an object
(`{ rendered: string }`), but the input format for these fields must be a plain
string. _Note:_ A default query-param string will be added to the end point when
using `.createEndpointGet()`: Collections will have the query `?_embed=true&order=asc&orderby=menu_order&per_page=100`
appended, single posts will be queried with [?_embed=true](https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/#_embed ':crossorgin').
The query can be overriden with the second parameter, e.g:
`.createEndpointGet('wp/v2/posts', { _embed: 'author' })`.

The utility type `WPCreate<T>` will strip the `id` field from any type (e.g. POST
to `/pages`), in accordance to the WP-API requirements. The `WPUpdate<T>` utility
type simply turns any type into a `Partial`, so that selective fields of any post
type can be updated (e.g POST to. `/posts/{id}`)

Of course, you are free to extend the WpApiClient class in any which way that suits
you – but there are two more helpers that can be used to add methods for
__custom end points__. `.createEndpointCustomGet()` and `.createEndpointCustomPost()`
also work very similarly; they both only take the respective path to the end point
as a single, required argument, but they can be given up to two type arguments:
The response type as the first, and a fallback type for errors as the second argument.
You can find an [example here](usage/custom-end-points.md).
