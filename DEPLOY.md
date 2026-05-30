# Deployment

This app is deployed to GitHub Pages from the `main` branch using the official
GitHub Actions Pages pipeline defined in `.github/workflows/pages.yml`.

## How it works

- On every push to `main`, the workflow installs dependencies, runs
  `npm run build`, and publishes the contents of `dist/` to GitHub Pages via
  `actions/deploy-pages`. There is no committed build branch.
- GitHub Pages must be configured with **Settings -> Pages -> Source ->
  GitHub Actions**, and `main` must be the repository's default branch (the
  `github-pages` environment only allows deployments from the default branch).

## Notes

- The app uses `HashRouter`, so URLs contain a `#` (e.g. `/#/lektionen`). This is
  required for client-side routing to work on GitHub Pages without 404s on deep
  links.
- `.github/workflows/deploy.yml` is a legacy fallback that publishes to the
  `gh-pages` branch and runs only on the feature branch. It can be removed once
  the Actions-based deploy is confirmed working.

The live site is available at: https://thelivinsine.github.io/B2furBerufApp/
