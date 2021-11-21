# Change Log

The current progress can be tracked [here](https://github.com/dkress59/wordpress-api-client/projects/1)

- v0.3.0 ACF v5.11.1
  - adjustment to Advanced Custom Fields v5.11.1
  - minor typing issue fixed: FetchClient.fetch

- v0.2.3 default methods, error handling
  - implemented last two missing default methods
    - applications passwords
    - block revisions
  - improved error handling

- v.0.2.2 minor fixes

- v.0.2.1 minor fixes
  - type casting
  - .plugin fix
  - minor fixes

- v.0.2.0 cross-fetch and advanced options
  - less overhead by replacing axios with a fetch client
  - authorisation is now handled via constructor arguments and a blacklist
  - matching input- and output-typings: WPCreate has been replaced by postCreate
  - includes minor fixes

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
    <br />and `wp/v2/blocks/<block-id>/autosaves`

- v0.1.2 repaired type casting in handleWpApiError()

- v0.1.1 import path repaired

- v0.1.0 public beta release
