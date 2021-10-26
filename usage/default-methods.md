# Default Methods

To instantiate a WP-API Client you need to pass the base URL of your WordPress
website to the constructor. You can pass an `onError`-function as the second
parameter and an exisitng axiosInstance as the third parameter (more on that here:
[JWT-Auth for WordPress](#jwt-auth-for-wordpress)).
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

// Static Methods:

WpApiClient.addCollection()
WpApiClient.collect()
WpApiClient.clearCollection()

```

## .find(...ids: number[])

### find all

### find one or many

### find with params

## .create(body: WPCreate<WPPost>)

You need to be authenticated, to use this method.

WPCreate: id, date format, taxonomies, attachments, users

## .update(body: WPCreate<WPPost>, id: number)

You need to be authenticated, to use this method.

WPUpdate: id, date format, taxonomies, attachments, users

## .delete(id: number)

You need to be authenticated, to use this method.

---

## .media()

---

## .user()

---

## .postType)

---

## .search()

---

## .siteSettings()
