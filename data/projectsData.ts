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
    title: 'big-data-platform',
    description:
      'A local development platform for event collection, Flink stream processing, and AI enrichment. It combines Python collectors with Kafka and Java jobs, including a risk-control embedding pipeline that calls Ollama asynchronously and writes vectors to Milvus. I use it to explore real-time risk processing, state recovery, and the correctness boundaries between sources, processing, and sinks.',
    techStack: ['Java', 'Python', 'Kafka', 'Flink', 'Ollama', 'Milvus'],
    href: 'https://github.com/charleschen68/big-data-platform',
  },
  {
    title: 'big-data-platform-envs',
    description:
      'The GitOps environment repository for big-data-platform. It separates application code and image builds from Kubernetes deployment configuration, using Argo CD and Kustomize to declare the local OrbStack environment. SOPS manages encrypted secrets, while Prometheus and Grafana provide visibility into collector health and data freshness. This is my platform-engineering foundation for repeatable deployment and operational review.',
    techStack: ['Kubernetes', 'Argo CD', 'Kustomize', 'SOPS', 'Prometheus', 'Grafana'],
    href: 'https://github.com/charleschen68/big-data-platform-envs',
  },
  {
    title: 'CoHelper / AI Drive',
    description:
      'A personal AI assistant for Apple Silicon Macs, combining clipboard translation, QMD knowledge retrieval, and answers grounded in local sources through Ollama. Its reusable AI Drive components also support screen analysis and guarded desktop actions with explicit confirmation and target validation. I use CoHelper to develop AI-driven data understanding and Agent Infrastructure around typed capabilities, cancellation, and controlled side effects.',
    techStack: ['Python', 'PyObjC', 'QMD', 'Ollama', 'macOS Accessibility'],
    href: 'https://github.com/charleschen68/CoHelper',
  },
]

export default projectsData
