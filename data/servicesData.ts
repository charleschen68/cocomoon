export interface Service {
  id: string
  name: string
  blurb: string
  description: string
  capabilities: string[]
}

const servicesData: Service[] = [
  {
    id: 'distributed-systems',
    name: 'Distributed Systems Engineering',
    blurb:
      'State, recovery, and observability for data systems, supported by hands-on GitOps platform work.',
    description:
      'My distributed-systems work connects application behavior with deployment and operations. In big-data-platform and big-data-platform-envs, I separate processing code from environment configuration and work with event streams, stateful services, encrypted secrets, and monitoring. My focus is understanding what happens when messages repeat, dependencies fail, or a service restarts.',
    capabilities: [
      'Architecture review focused on state ownership, failure modes, and recovery boundaries',
      'Kubernetes environment configuration with Argo CD, Kustomize, and SOPS',
      'Collector health and freshness monitoring with Prometheus and Grafana',
      'Reproducible deployment procedures and explicit validation criteria',
    ],
  },
  {
    id: 'realtime-data',
    name: 'Real-Time Data Processing & Risk Control',
    blurb:
      'Kafka and Flink pipelines, with real-time risk control as a focus for further development.',
    description:
      'big-data-platform is my development environment for event ingestion, stream processing, and asynchronous model calls. Its risk-control embedding job connects Kafka, Flink, Ollama, and Milvus. I am extending this foundation toward risk-processing workflows where latency, feature freshness, duplicate and out-of-order events, and decision replay have explicit acceptance criteria.',
    capabilities: [
      'Event ingestion and stream-processing pipelines with Python, Kafka, and Flink',
      'Asynchronous embedding generation and vector storage integration',
      'Checkpoint, replay, and source-to-sink consistency analysis',
      'Latency, data freshness, and failure-recovery criteria for risk-processing designs',
    ],
  },
  {
    id: 'ai-data-processing',
    name: 'AI-Driven Data Processing',
    blurb:
      'Local knowledge retrieval, model-assisted understanding, and controlled actions through CoHelper.',
    description:
      'With CoHelper / AI Drive, I connect local knowledge retrieval to translation, source-grounded answers, and guarded desktop actions. This work supports my longer-term Agent Infrastructure direction: reusable tools with explicit inputs, permissions, cancellation, and side-effect boundaries. The emphasis is on traceable results and human control throughout the processing workflow.',
    capabilities: [
      'QMD retrieval and local Ollama integration for knowledge workflows',
      'Independent translation, search, and answer-generation stages',
      'Typed capability interfaces and cancellation of superseded tasks',
      'Explicit confirmation and target validation for desktop actions',
    ],
  },
]

export const howIWork = [
  {
    step: 'Scope',
    detail:
      'Map the data flow, state ownership, and operational constraints. Agree on correctness, latency, freshness, and recovery criteria before choosing an implementation.',
  },
  {
    step: 'Build & Validate',
    detail:
      'Work through a focused design or implementation, then check the relevant failure cases: duplicate events, timeouts, restarts, and unavailable dependencies.',
  },
  {
    step: 'Deliver',
    detail:
      'Provide code or configuration, design decisions, validation evidence, and operating notes. Make remaining limitations and recovery procedures explicit.',
  },
]

export default servicesData
