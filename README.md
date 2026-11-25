# Aurora Hall — TinaCMS demo

A fictional, multilingual venue guide built with Docusaurus and TinaCMS. The site and editor are published together as one Render static site: the guide is at `/` and the editor is at `/admin/`. Content lives in `docs/` (Spanish), `i18n/en/docusaurus-plugin-content-docs/current/`, and `i18n/ca/docusaurus-plugin-content-docs/current/`.

## Configure TinaCloud

1. Push this repository to the personal GitHub repository `mpcastillo2023/tina-investigation` on `main`.
2. Create a TinaCloud project connected to this GitHub repository and the `main` branch. Grant the TinaCloud GitHub app access and complete repository indexing/sync so its content API can read these docs.
3. Create the Render Static Site described below. Add `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, and `NEXT_PUBLIC_TINA_BRANCH=main` to its environment before the build, and mark `TINA_TOKEN` secret. If Render starts an initial build before the values are set, add them and redeploy.
4. Once Render assigns the hostname, add its exact HTTPS origin as an authorized URL/domain in TinaCloud. The production build generates the editor under `/admin/`, on the same URL as the docs.

TinaCloud must be able to access and index the connected repository. The token and client ID come from the TinaCloud project; do not use a GitHub personal access token as the Tina read token. Follow TinaCloud’s current project setup instructions for granting its GitHub app access to this repository.

## Publish on Render

For manual setup, create a Static Site in the Render account connected to the personal GitHub account and select this repository and the `main` branch. Enter these settings in the dashboard (manual setup does not automatically import `render.yaml`):

- Build command: `npm ci && npm run build`
- Publish directory: `build`
- Node: 24.22.1 (also specified in `render.yaml`)
- Environment: `SKIP_INSTALL_DEPS=true` (the build command runs `npm ci` itself)
- Environment: `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, and `NEXT_PUBLIC_TINA_BRANCH=main`

Set the environment values in Render’s dashboard and mark `TINA_TOKEN` as secret. If the initial Render build ran before these values were set, trigger a fresh deploy. After Render creates the site, add its exact HTTPS origin as an authorized URL/domain in TinaCloud. The finished site serves Docusaurus and `/admin/` from the same `onrender.com` URL. A TinaCloud content commit triggers a Render rebuild. The TinaCloud project and its GitHub connection must use the same repository/branch as this Render site.

## Local development

Use Node 24.22.1, then run `npm ci` and `npm run cms`. Tina’s local editor writes to the working tree and is for development. The production build intentionally uses TinaCloud credentials and branch `main`; do not enable Tina’s local mode in the deployed build.

When an editor uses **Add Folder** in a language’s document collection, Tina also creates that folder’s `_category_.json` with a generated-index link and default collapsible settings. Editors can then adjust the menu name and order in the matching menu categories collection; technical link and collapse settings stay hidden and retain their stored values. This automation runs through Tina’s document collections; folders added directly to the filesystem or Git still need a `_category_.json` created manually. If a prior attempt left a folder without its category, using **Add Folder** again for that same folder completes the category setup.

## Content and privacy

All included venue details and the SVG illustration are fictional sample content. The site is public when deployed, including its documentation and editor shell. TinaCloud controls editor authentication and its content API; it does not make the published documentation private. Review content before adding anything private.
