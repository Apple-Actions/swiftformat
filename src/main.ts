import {
  getBooleanInput,
  getInput,
  info,
  setFailed,
  setOutput,
  warning
} from '@actions/core'
import {exec} from '@actions/exec'
import {submoduleExcludePaths} from './gitmodules'
import {fetchLatestVersion, installSwiftFormat} from './install'
import {resolveVersionSpec} from './version'

async function run(): Promise<void> {
  try {
    await main()
  } catch (err) {
    setFailed(err instanceof Error ? err.message : String(err))
  }
}

function splitArgs(raw: string): string[] {
  const trimmed = raw.trim()
  if (!trimmed) {
    return []
  }
  // Simple whitespace split; quote-aware parsing is out of scope.
  return trimmed.split(/\s+/)
}

async function main(): Promise<void> {
  const versionInput = getInput('version')
  const versionFile = getInput('version-file')
  const path = getInput('path')
  const argsInput = getInput('args')
  const reporter = getInput('reporter') || 'github-actions-log'
  const lint = getBooleanInput('lint')
  const token = getInput('token')

  const workspace = process.env.GITHUB_WORKSPACE || process.cwd()
  let version = resolveVersionSpec({
    version: versionInput,
    versionFile,
    workspace,
    warn: warning
  })

  if (version === 'latest') {
    version = await fetchLatestVersion(token)
    info(`Resolved latest SwiftFormat to ${version}`)
  }

  const swiftformatPath = await installSwiftFormat(version, token)

  const args = [...splitArgs(argsInput)]
  if (lint && !args.includes('--lint')) {
    args.unshift('--lint')
  }
  if (reporter && !args.includes('--reporter')) {
    args.push('--reporter', reporter)
  }

  // Submodules are a different repo — don't apply this tree's format rules.
  if (!args.includes('--exclude')) {
    const excludes = submoduleExcludePaths(workspace)
    if (excludes.length > 0) {
      args.push('--exclude', excludes.join(','))
    }
  }

  if (path) {
    args.push(path)
  } else if (!args.some(arg => !arg.startsWith('-'))) {
    args.push('.')
  }

  info(`Running: ${swiftformatPath} ${args.join(' ')}`)
  await exec(swiftformatPath, args, {cwd: workspace})

  setOutput('version', version)
  setOutput('swiftformat-path', swiftformatPath)
}

run()
