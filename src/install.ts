import {info} from '@actions/core'
import {cacheDir, downloadTool, extractZip, find} from '@actions/tool-cache'
import {chmodSync, existsSync, renameSync} from 'node:fs'
import {arch as osArch, platform as osPlatform} from 'node:os'
import {join} from 'node:path'

const OWNER = 'nicklockwood'
const REPO = 'SwiftFormat'
const TOOL_NAME = 'swiftformat'

export type PlatformArch = {
  platform: NodeJS.Platform
  arch: string
}

export type ReleaseAsset = {
  archive: string
  binaryName: string
}

/** Map runner OS/arch to a SwiftFormat release asset. */
export function releaseAsset({platform, arch}: PlatformArch): ReleaseAsset {
  if (platform === 'darwin') {
    return {archive: 'swiftformat.zip', binaryName: 'swiftformat'}
  }
  if (platform === 'linux') {
    if (arch === 'arm64') {
      return {
        archive: 'swiftformat_linux_aarch64.zip',
        binaryName: 'swiftformat_linux'
      }
    }
    if (arch === 'x64') {
      return {
        archive: 'swiftformat_linux.zip',
        binaryName: 'swiftformat_linux'
      }
    }
    throw new Error(`Unsupported Linux architecture for SwiftFormat: ${arch}`)
  }
  throw new Error(
    `SwiftFormat action supports macOS and Linux runners only (this one is ${platform})`
  )
}

export async function fetchLatestVersion(token: string): Promise<string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Apple-Actions/swiftformat',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`,
    {headers}
  )
  if (!response.ok) {
    throw new Error(
      `Failed to resolve latest SwiftFormat release: ${response.status} ${response.statusText}`
    )
  }
  const body = (await response.json()) as {tag_name?: string}
  if (!body.tag_name) {
    throw new Error('Latest SwiftFormat release response missing tag_name')
  }
  return body.tag_name.replace(/^v/i, '')
}

function releaseDownloadUrl(version: string, asset: string): string {
  return `https://github.com/${OWNER}/${REPO}/releases/download/${version}/${asset}`
}

function findBinary(extracted: string, binaryName: string): string {
  const candidate = join(extracted, binaryName)
  if (!existsSync(candidate)) {
    throw new Error(
      `swiftformat binary not found in extracted archive: ${candidate}`
    )
  }
  return candidate
}

/**
 * Ensure SwiftFormat `version` is on disk (tool-cache) and return the binary path.
 */
export async function installSwiftFormat(
  version: string,
  token: string,
  platformArch: PlatformArch = {platform: osPlatform(), arch: osArch()}
): Promise<string> {
  const cached = find(TOOL_NAME, version)
  if (cached) {
    const binary = join(cached, 'swiftformat')
    if (existsSync(binary)) {
      info(`Using cached SwiftFormat ${version} at ${binary}`)
      return binary
    }
  }

  const asset = releaseAsset(platformArch)
  const url = releaseDownloadUrl(version, asset.archive)
  info(`Downloading SwiftFormat ${version} (${asset.archive})`)

  const auth = token ? `token ${token}` : undefined
  const archivePath = await downloadTool(url, undefined, auth)
  const extracted = await extractZip(archivePath)
  const downloaded = findBinary(extracted, asset.binaryName)
  chmodSync(downloaded, 0o755)

  const normalized = join(extracted, 'swiftformat')
  if (downloaded !== normalized) {
    renameSync(downloaded, normalized)
  }

  const cachedDir = await cacheDir(extracted, TOOL_NAME, version)
  const cachedBinary = join(cachedDir, 'swiftformat')
  info(`Installed SwiftFormat ${version} at ${cachedBinary}`)
  return cachedBinary
}
