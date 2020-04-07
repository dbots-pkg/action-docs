# action-docs

Action that generates website docs for branches and tags using docgen

## Usage

**Imporant:** this action requires the `docs/docs.json` file to be built **before** the action is run.

How to use it in a workflow:

```yaml
- run: npm run docs

- uses: dbots-pkg/action-docs@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## License

This actions is distributed under the MIT license, check the [license file](LICENSE) for more info.
