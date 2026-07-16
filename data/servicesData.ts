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
    name: 'High-Performance Distributed Systems',
    blurb:
      '[PLACEHOLDER] Architecture and tuning for systems that stay fast and correct under real-world load.',
    description:
      '[PLACEHOLDER] I help teams design, review, and optimize distributed systems — from consensus and replication strategy to tail-latency hunting in production. Replace this paragraph with your real positioning and 1-2 proof points.',
    capabilities: [
      '[PLACEHOLDER] Architecture design and review',
      '[PLACEHOLDER] Performance profiling and tail-latency reduction',
      '[PLACEHOLDER] Scalability and capacity planning',
      '[PLACEHOLDER] Reliability engineering and failure-mode analysis',
    ],
  },
  {
    id: 'realtime-data',
    name: 'Real-Time Data Infrastructure',
    blurb:
      '[PLACEHOLDER] Streaming pipelines and storage layers built for low latency and high throughput.',
    description:
      '[PLACEHOLDER] I build and operate real-time data platforms — event streaming, stream processing, and the serving layers on top. Replace this paragraph with your real positioning and 1-2 proof points.',
    capabilities: [
      '[PLACEHOLDER] Streaming pipeline design (Kafka, Flink, etc.)',
      '[PLACEHOLDER] Real-time analytics and serving layers',
      '[PLACEHOLDER] Exactly-once processing and data correctness',
      '[PLACEHOLDER] Cost and throughput optimization',
    ],
  },
  {
    id: 'ai-data-processing',
    name: 'AI-Driven Data Processing',
    blurb:
      '[PLACEHOLDER] Data platforms and pipelines that put LLMs and ML to work on production data.',
    description:
      '[PLACEHOLDER] I design data processing systems that integrate AI — LLM-powered enrichment, embedding pipelines, and the infrastructure to run them reliably at scale. Replace this paragraph with your real positioning and 1-2 proof points.',
    capabilities: [
      '[PLACEHOLDER] LLM-powered data enrichment pipelines',
      '[PLACEHOLDER] Embedding and vector search infrastructure',
      '[PLACEHOLDER] Evaluation and quality monitoring for AI pipelines',
      '[PLACEHOLDER] Batch-to-real-time AI inference architecture',
    ],
  },
]

export const howIWork = [
  {
    step: 'Scope',
    detail:
      '[PLACEHOLDER] A short call to understand your system, constraints, and what success looks like.',
  },
  {
    step: 'Engage',
    detail:
      '[PLACEHOLDER] Focused engagement — architecture review, hands-on build, or embedded advisory.',
  },
  {
    step: 'Deliver',
    detail:
      '[PLACEHOLDER] Concrete deliverables: designs, working code, runbooks, and a clear handoff.',
  },
]

export default servicesData
