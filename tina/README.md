# TinaCMS local editor

Run `npm run cms` for Tina’s local filesystem editor, then visit `/admin/` on the local Docusaurus site. Local mode is for development only. The deployed editor uses TinaCloud and requires `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, and `NEXT_PUBLIC_TINA_BRANCH=main`. See the repository README for setup.

After changing `tina/config.ts`, run `npx tinacms dev --no-server --noWatch` to regenerate `tina/tina-lock.json`, then commit and push both files. TinaCloud needs the updated lock file to index the schema before a production build can pass.
