import {existsSync, readFileSync} from 'node:fs'
import {join} from 'node:path'

/** Collect submodule paths from `.gitmodules` for `--exclude`. */
export function submoduleExcludePaths(workspace: string): string[] {
  const gitmodules = join(workspace, '.gitmodules')
  if (!existsSync(gitmodules)) {
    return []
  }

  const paths: string[] = []
  for (const line of readFileSync(gitmodules, 'utf8').split(/\r?\n/)) {
    const match = /^\s*path\s*=\s*(.+)\s*$/.exec(line)
    if (match) {
      paths.push(match[1].trim())
    }
  }
  return paths
}
