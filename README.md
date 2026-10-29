# SwiftFormat

A GitHub Action that installs a pinned [SwiftFormat](https://github.com/nicklockwood/SwiftFormat) and runs `swiftformat --lint` with GitHub Actions annotations. Designed to compose with the rest of the Apple-Actions suite:

- [`Apple-Actions/swiftlint`](https://github.com/Apple-Actions/swiftlint)
- [`Apple-Actions/periphery`](https://github.com/Apple-Actions/periphery)
- [`Apple-Actions/import-codesign-certs`](https://github.com/Apple-Actions/import-codesign-certs)
- [`Apple-Actions/download-provisioning-profiles`](https://github.com/Apple-Actions/download-provisioning-profiles)
- [`Apple-Actions/xcodebuild`](https://github.com/Apple-Actions/xcodebuild)
- [`Apple-Actions/upload-testflight-build`](https://github.com/Apple-Actions/upload-testflight-build)
- [`Apple-Actions/create-dmg`](https://github.com/Apple-Actions/create-dmg)
- [`Apple-Actions/notarize`](https://github.com/Apple-Actions/notarize)

## Usage

### Pin a version

```yaml
- uses: Apple-Actions/swiftformat@v1
  with:
    version: 0.64.4
```

### Pin from a file

Put the version on the first non-comment line of a file (for example `.swiftformat-version`):

```text
0.64.4
```

```yaml
- uses: Apple-Actions/swiftformat@v1
  with:
    version-file: .swiftformat-version
```

If both `version` and `version-file` are set, `version` wins. If neither is set, the action installs the latest SwiftFormat release.

### Options

```yaml
- uses: Apple-Actions/swiftformat@v1
  with:
    version: 0.64.4
    path: Sources
    reporter: github-actions-log
```

| Input | Default | Description |
|-------|---------|-------------|
| `version` | | SwiftFormat version (for example `0.64.4`) or `latest` |
| `version-file` | | Path to a file containing the version |
| `path` | | Path to lint (defaults to `.`) |
| `args` | | Extra arguments appended to `swiftformat` |
| `reporter` | `github-actions-log` | SwiftFormat reporter |
| `lint` | `true` | Pass `--lint` so files that would change fail the step |
| `token` | `${{ github.token }}` | Token for GitHub Releases API / downloads |

| Output | Description |
|--------|-------------|
| `version` | Resolved SwiftFormat version that was installed |
| `swiftformat-path` | Absolute path to the `swiftformat` binary |

Works on `ubuntu-*` and `macos-*` runners (downloads the matching macOS / Linux release asset). Honors a workspace `.swiftformat` config when present. Submodule paths listed in `.gitmodules` are excluded automatically unless you already pass `--exclude`.
