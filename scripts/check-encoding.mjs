import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

const roots = ["app", "scripts"]
const extensions = new Set([".css", ".js", ".json", ".mjs", ".ts", ".tsx"])
const mojibakeMarkers = [
  "\uFFFD",
  "\u0432\u045A",
  "\u0432\u2020",
  "\u0432\u0402",
  "\u0432\u0098",
  "\u0440\u045F",
]

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)))
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

const files = (await Promise.all(roots.map(collectFiles))).flat()
const failures = []

for (const file of files) {
  const contents = await readFile(file, "utf8")

  for (const marker of mojibakeMarkers) {
    if (contents.includes(marker)) {
      failures.push(`${file}: suspicious encoding marker ${JSON.stringify(marker)}`)
    }
  }
}

if (failures.length) {
  console.error("Encoding check failed:\n" + failures.join("\n"))
  process.exitCode = 1
} else {
  console.log(`Encoding check passed (${files.length} files).`)
}
