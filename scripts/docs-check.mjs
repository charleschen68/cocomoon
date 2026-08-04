import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const failures = []

function markdownFiles(path) {
  const absolutePath = resolve(repositoryRoot, path)
  if (!existsSync(absolutePath)) {
    failures.push(`${path}: required path does not exist`)
    return []
  }

  if (!statSync(absolutePath).isDirectory()) return [absolutePath]

  return readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const childPath = join(absolutePath, entry.name)
    if (entry.isDirectory()) return markdownFiles(relative(repositoryRoot, childPath))
    return entry.isFile() && extname(entry.name) === '.md' ? [childPath] : []
  })
}

const files = [
  ...markdownFiles('Instructions.md'),
  ...markdownFiles('PROJECT_STANDARDS.md'),
  ...markdownFiles('design'),
  ...markdownFiles('wiki'),
]

const documents = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]))

function fail(file, message) {
  failures.push(`${relative(repositoryRoot, file)}: ${message}`)
}

function requirePattern(file, content, pattern, description) {
  if (!pattern.test(content)) fail(file, `missing ${description}`)
}

function requireHeadings(file, content, headings) {
  for (const heading of headings) {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    requirePattern(file, content, new RegExp(`^## ${escaped}$`, 'm'), `section "${heading}"`)
  }
}

for (const [file, content] of documents) {
  if (/\b(?:TODO|TBD|PLACEHOLDER)\b/.test(content)) {
    fail(file, 'contains an unresolved placeholder marker')
  }
  if (/<[^>\n]+>/.test(content)) {
    fail(file, 'contains a raw angle-bracket placeholder or HTML-like token')
  }

  const markdownLinks = content.matchAll(/!?\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)
  for (const match of markdownLinks) {
    const target = match[1]
    if (
      target.startsWith('#') ||
      target.startsWith('http://') ||
      target.startsWith('https://') ||
      target.startsWith('mailto:')
    ) {
      continue
    }

    let pathWithoutFragment
    try {
      pathWithoutFragment = decodeURIComponent(target.split('#')[0].split('?')[0])
    } catch {
      fail(file, `local link has invalid URL encoding "${target}"`)
      continue
    }
    if (!pathWithoutFragment) continue
    const resolvedTarget = pathWithoutFragment.startsWith('/')
      ? resolve(repositoryRoot, `.${pathWithoutFragment}`)
      : resolve(dirname(file), pathWithoutFragment)
    if (!existsSync(resolvedTarget)) fail(file, `broken local link "${target}"`)
  }
}

const instructions = resolve(repositoryRoot, 'Instructions.md')
requirePattern(instructions, documents.get(instructions), /^\*\*Owner:\*\* .+$/m, 'owner metadata')
requirePattern(
  instructions,
  documents.get(instructions),
  /^\*\*Review trigger:\*\* .+$/m,
  'review trigger metadata'
)
requireHeadings(instructions, documents.get(instructions), [
  'Purpose and precedence',
  'Repository map',
  'Mandatory change workflow',
  'Validation matrix',
  'Content and generated-file boundaries',
  'Security and dependency limits',
  'Delivery checklist',
  'Linked references',
])

const standards = resolve(repositoryRoot, 'PROJECT_STANDARDS.md')
requirePattern(standards, documents.get(standards), /^\*\*Owner:\*\* .+$/m, 'owner metadata')
requirePattern(
  standards,
  documents.get(standards),
  /^\*\*Review trigger:\*\* .+$/m,
  'review trigger metadata'
)
requireHeadings(standards, documents.get(standards), [
  'Scope and precedence',
  'TypeScript and React',
  'Next.js and Contentlayer',
  'Generated outputs',
  'Accessibility',
  'Security and privacy',
  'Performance and resilience',
  'Dependencies and configuration',
  'Observability',
  'Testing and validation',
  'Code review',
  'Documentation maintenance',
])

for (const [file, content] of documents) {
  const relativePath = relative(repositoryRoot, file)
  if (relativePath.startsWith('design/')) {
    requirePattern(file, content, /^\*\*(?:Document )?Owner:\*\* .+$/m, 'owner metadata')
    requirePattern(file, content, /^\*\*Review trigger:\*\* .+$/m, 'review trigger metadata')
  }

  if (
    relativePath.startsWith('design/') &&
    relativePath !== 'design/README.md' &&
    relativePath !== 'design/TEMPLATE.md'
  ) {
    requirePattern(
      file,
      content,
      /^\*\*Status:\*\* (?:Proposed|Approved|Implemented|Superseded)$/m,
      'defined design lifecycle status'
    )
    requireHeadings(file, content, [
      'Problem',
      'Context',
      'Goals',
      'Non-Goals',
      'Decision',
      'Alternatives and Trade-Offs',
      'Consequences',
      'Implementation Outline',
      'Rollout',
      'Validation',
      'Rollback',
      'Security, Performance, and Accessibility Considerations',
      'References',
    ])
  }
}

const designTemplate = resolve(repositoryRoot, 'design/TEMPLATE.md')
requireHeadings(designTemplate, documents.get(designTemplate), [
  'Problem',
  'Context',
  'Goals',
  'Non-Goals',
  'Decision',
  'Alternatives and Trade-Offs',
  'Consequences',
  'Implementation Outline',
  'Rollout',
  'Validation',
  'Rollback',
  'Security, Performance, and Accessibility Considerations',
  'References',
])

const wikiReadme = resolve(repositoryRoot, 'wiki/README.md')
requirePattern(wikiReadme, documents.get(wikiReadme), /^\*\*Owner:\*\* .+$/m, 'owner metadata')
requirePattern(
  wikiReadme,
  documents.get(wikiReadme),
  /^\*\*Review trigger:\*\* .+$/m,
  'review trigger metadata'
)

const wikiTemplate = resolve(repositoryRoot, 'wiki/TEMPLATE.md')
requirePattern(wikiTemplate, documents.get(wikiTemplate), /^\*\*Owner:\*\* .+$/m, 'owner metadata')
requirePattern(
  wikiTemplate,
  documents.get(wikiTemplate),
  /^\*\*Review trigger:\*\* .+$/m,
  'review trigger metadata'
)
for (const field of ['title', 'owner', 'status', 'last reviewed', 'audience']) {
  requirePattern(
    wikiTemplate,
    documents.get(wikiTemplate),
    new RegExp(`^${field}: .+$`, 'm'),
    `wiki front matter field "${field}"`
  )
}
requireHeadings(wikiTemplate, documents.get(wikiTemplate), [
  'Purpose',
  'Prerequisites',
  'Procedure',
  'Verification',
  'Failure Handling',
  'Recovery or Rollback',
  'Security Considerations',
  'Related Links',
  'Change History',
])

for (const [file, content] of documents) {
  const relativePath = relative(repositoryRoot, file)
  if (
    relativePath.startsWith('wiki/') &&
    relativePath !== 'wiki/README.md' &&
    relativePath !== 'wiki/TEMPLATE.md'
  ) {
    for (const field of ['title', 'owner', 'last reviewed', 'audience']) {
      requirePattern(
        file,
        content,
        new RegExp(`^${field}: .+$`, 'm'),
        `wiki front matter field "${field}"`
      )
    }
    requirePattern(
      file,
      content,
      /^status: (?:draft|verified|superseded|retired)$/m,
      'defined wiki lifecycle status'
    )
    requireHeadings(file, content, [
      'Purpose',
      'Prerequisites',
      'Procedure',
      'Verification',
      'Failure Handling',
      'Recovery or Rollback',
      'Security Considerations',
      'Related Links',
      'Change History',
    ])
  }
}

const designIndex = documents.get(resolve(repositoryRoot, 'design/README.md'))
for (const [file, content] of documents) {
  const relativePath = relative(repositoryRoot, file)
  if (
    !relativePath.startsWith('design/') ||
    relativePath === 'design/README.md' ||
    relativePath === 'design/TEMPLATE.md'
  ) {
    continue
  }

  const status = content.match(/^\*\*Status:\*\* (.+)$/m)?.[1]
  const escapedFilename = relativePath
    .slice('design/'.length)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const indexEntry = designIndex.match(
    new RegExp(`^\\| [^|]+ \\| \\[[^\\]]+]\\(${escapedFilename}\\) \\| ([^|]+) \\|$`, 'm')
  )
  if (!indexEntry) {
    fail(file, 'is missing from the design index')
  } else if (indexEntry[1].trim() !== status) {
    fail(file, `status "${status}" does not match design index status "${indexEntry[1].trim()}"`)
  }
}

if (failures.length > 0) {
  console.error(`Documentation validation failed with ${failures.length} issue(s):`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(`Documentation validation passed for ${documents.size} Markdown files.`)
}
