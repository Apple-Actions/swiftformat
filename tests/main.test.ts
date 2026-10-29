import {mkdtempSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'
import {submoduleExcludePaths} from '../src/gitmodules'

describe('submoduleExcludePaths', () => {
  it('returns empty when .gitmodules is absent', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'swiftformat-sub-'))
    expect(submoduleExcludePaths(workspace)).toEqual([])
  })

  it('reads submodule paths', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'swiftformat-sub-'))
    writeFileSync(
      join(workspace, '.gitmodules'),
      '[submodule "Vendor/Foo"]\n\tpath = Vendor/Foo\n\turl = https://example.com/foo.git\n'
    )
    expect(submoduleExcludePaths(workspace)).toEqual(['Vendor/Foo'])
  })
})
