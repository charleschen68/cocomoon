interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
  techStack?: string[]
  year?: string
  role?: string
  highlights?: string[]
}

const projectsData: Project[] = [
  {
    title: 'Real-Time Computing',
    description: `[PLACEHOLDER] A streaming analytics platform processing millions of events per
    second. Replace with a real project: what it does, the scale it runs at, and your role.`,
    techStack: ['Kafka', 'Flink', 'ClickHouse'],
    year: '2025',
    role: 'Architect & Lead Engineer',
    href: 'https://example.com',
  },
  {
    title: 'Distributed Storage And Computing Engine',
    description: `[PLACEHOLDER] A horizontally scalable storage engine with strong consistency
    guarantees. Replace with a real project: what it does, the scale it runs at, and your role.`,
    techStack: ['Java', 'Flink', 'Kafka', 'ClickHouse'],
    year: '2024',
    role: 'Core Contributor',
    href: 'https://github.com/charleschen68/big-data-platform',
  },
  {
    title: '[PLACEHOLDER] LLM Data Enrichment Pipeline',
    description: `[PLACEHOLDER] An AI-driven pipeline that classifies and enriches unstructured
    data at scale. Replace with a real project: what it does, the scale it runs at, and your role.`,
    techStack: ['Python', 'Claude API', 'Airflow'],
    year: '2026',
    role: 'Designer & Builder',
    href: 'https://example.com',
  },
]

export default projectsData
