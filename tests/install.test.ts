import {describe, expect, it} from 'vitest'
import {releaseAsset} from '../src/install'

describe('releaseAsset', () => {
  it('uses swiftformat.zip on macOS', () => {
    expect(releaseAsset({platform: 'darwin', arch: 'arm64'})).toEqual({
      archive: 'swiftformat.zip',
      binaryName: 'swiftformat'
    })
  })

  it('picks linux amd64 and arm64 assets', () => {
    expect(releaseAsset({platform: 'linux', arch: 'x64'})).toEqual({
      archive: 'swiftformat_linux.zip',
      binaryName: 'swiftformat_linux'
    })
    expect(releaseAsset({platform: 'linux', arch: 'arm64'})).toEqual({
      archive: 'swiftformat_linux_aarch64.zip',
      binaryName: 'swiftformat_linux'
    })
  })

  it('rejects unsupported platforms', () => {
    expect(() => releaseAsset({platform: 'win32', arch: 'x64'})).toThrow(
      /macOS and Linux/
    )
  })
})
