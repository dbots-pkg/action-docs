# action-docs

Action that generates website docs for branches and tags using docgen

## Usage

How to use it in a workflow:

```yaml
- name: Build and deploy documentation
  uses: dbots-pkg/action-docs@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## License

This actions is distributed under the MIT license, check the [license file](LICENSE) for more info.
