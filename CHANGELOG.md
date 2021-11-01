# Change Log

The current progress can be tracked [here](https://github.com/dkress59/wordpress-api-client/projects/1)

- v.0.1.5 repaired `.revision().find()` and `.plugin().create()`

- v.0.1.4 implemented extendable query-params and default-query-params
  - **Note:** Authentification will confuse eslint/tslint with axios < v0.24.0

- v0.1.3 added methods for most missing default wp-api routes, such as
  - .plugin() for wp/v2/plugins
  - .postType() for wp/v2/types
  - .taxonomy() for wp/v2/taxonomies
  - .theme() for wp/v2/themes
  - …and quite some more

  - methods for two default wp-api routes are still missing:
    <br />`wp/v2/users/<user_id>/application-passwords`
    <br />and `wp/v2/blocks/<block-id>/revisions`

- v0.1.2 repaired type casting in handleWpApiError()

- v0.1.1 import path repaired

- v0.1.0 public beta release
