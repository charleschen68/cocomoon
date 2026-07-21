---
title: 'Building Personal Knowledge Base with QMD: From Principles to Practice'
date: '2026-07-14'
tags: ['QMD', 'personal-knowledge-base', 'vector-search', 'reranking', 'LLM', 'local-deployment']
draft: false
summary: 'This article systematically introduces the principles and architecture of QMD (Quick Markdown Search), covering three core technologies: vector embedding, reranking, and query expansion, as well as how to efficiently build and maintain a personal knowledge base locally.'
images: ['static/images/avatar_bak.png']
---

## 1. Why QMD for Personal Knowledge Bases

In knowledge management, we face two core questions: **how to find** and **how to understand**. Traditional full-text search (like grep, BM25) excels at keyword matching but lacks semantic understanding. Vector search handles semantics well but is less sensitive to keywords.

QMD (Quick Markdown Search) combines both and introduces LLM-based final ranking, forming a complete local knowledge base search solution.

---

## 2. Three Core Components of QMD

### 2.1 Vector Embedding

Vector embedding is the "brain" of the knowledge base. QMD uses the [embeddinggemma-300M](https://huggingface.co/ggml-org/embeddinggemma-300M-GGUF) model to convert text content of each document into high-dimensional vectors.

**How it works:**

- Document chunking (Chunking) → each text segment becomes a vector → stored in SQLite database
- During query, the query text is also converted to a vector → cosine similarity is calculated with document vectors

**Your actual data:**

```
11 files → 24 vector embeddings
SQLite database: 3.3 MB
Model size: 318 MB (Q8_0 quantized)
```

### 2.2 Reranking

Reranking is the "second-stage fine ranking" of search. The key to understanding it is distinguishing the two phases:

```
Phase 1 (coarse): BM25 keywords + vector similarity → select Top N candidate documents
Phase 2 (fine): LLM reads each candidate document → re-scores → outputs final ranking
```

**Analogy:**

- BM25/vector search is like "keyword search" — fast, but not deeply understanding semantics
- Reranking is like "expert review" — reads each candidate document one by one, asking "is this really relevant to my question?"

**In your knowledge base:**

```
Reranking 11 chunks... (3.8s)
qmd://jarvis-wiki/concepts/qmd.md:14  Score: 88%   ← fine ranking score
qmd://jarvis-wiki/concepts/rrf-fusion.md:9  Score: 54%
```

The final ranking uses the **RRF (Reciprocal Rank Fusion)** algorithm to merge BM25, vector, and Reranker rankings.

### 2.3 Query Expansion

Query expansion is the "intelligent magnifying glass" of QMD. Using the [qmd-query-expansion-1.7B](https://huggingface.co/tobil/qmd-query-expansion-1.7B-gguf) model (community contribution), it automatically expands simple queries into multiple sub-queries.

**Expansion process:**

```
Original query: "what is reranking"
    ↓
Expanded to:
  ├─ lex: understanding reranking in search     (keywords)
  ├─ lex: how reranking works                   (keywords)
  ├─ vec: understanding reranking in search engine optimization  (vector)
  ├─ vec: how reranking works                   (vector)
  └─ hyde: The concept of reranking encompasses... (hypothetical document)
```

**Three expansion types:**

- **lex**：Keyword expansion, preserving keywords from the original query
- **vec**：Vector expansion, semantically similar expressions
- **hyde**：LLM-generated hypothetical answer documents

---

## 3. QMD Storage Architecture

QMD stores all data in a **single SQLite file**:

```
/Users/ad/.cache/qmd/index.sqlite
├── documents          ← Document metadata (path, collection, hash)
├── content           ← Chunked text of documents
├── vectors_vec_vector_chunks00  ← Vector data (sqlite-vec extension)
├── documents_fts_*   ← BM25 full-text index
├── llm_cache         ← LLM call cache
└── store_collections ← Collection configuration
```

**Three model files:**
| Model | Size | Purpose |
|------|------|------|
| embeddinggemma-300M | 318 MB | Text → Vector |
| qwen3-reranker-0.6B | 610 MB | Fine ranking candidates |
| qmd-query-expansion-1.7B | 1.2 GB | Query expansion |

**Total memory usage: ~2.5–2.7 GB** (all three models loaded)

---

## 4. QMD Search Flow

```
User inputs query
    ↓
[1] Query Expansion (1.7B model)
    Generates lex / vec / hyde sub-queries
    ↓
[2] Parallel Search
    ├─ BM25 keyword matching
    ├─ Vector similarity matching
    └─ Multiple sub-queries executed in parallel
    ↓
[3] Reranking (0.6B model)
    Reads candidate documents one by one, re-scores
    ↓
[4] RRF Fusion
    Merges BM25, vector, and Reranker rankings
    ↓
Outputs final ranked results
```

---

## 5. Daily Usage Patterns

### Event-driven, not scheduled tasks

| Scenario                     | Command                     | Description                        |
| ---------------------------- | --------------------------- | ---------------------------------- |
| After adding/modifying files | `qmd update`                | Re-index the entire collection     |
| Refresh vectors only         | `qmd embed`                 | Generate/refresh vector embeddings |
| Daily search                 | `qmd query "your question"` | Automatic reranking                |
| Cleanup cache                | `qmd cleanup`               | Clear LLM cache, compress DB       |

### Memory usage

| Operation   | Loaded models        | Actual RAM |
| ----------- | -------------------- | ---------- |
| `qmd embed` | embedding only       | ~400 MB    |
| `qmd query` | expansion + reranker | ~2.0 GB    |
| Full search | all three            | ~2.7 GB    |

---

## 6. Practical Recommendations for Building a Knowledge Base

### 6.1 Data Organization

```
Jarvis/
├── raw/              ← Raw materials (articles, papers, images)
├── wiki/
│   ├── index.md      ← Content catalog
│   ├── log.md        ← Operation log
│   ├── entities/     ← Entity pages
│   ├── concepts/     ← Concept pages
│   └── summaries/    ← Summaries
└── .obsidian/        ← Obsidian vault
```

### 6.2 Maintenance Strategy

- **Update only when documents change**: Vector data does not expire, only need `qmd embed` when document content changes
- **Automatic Reranking during search**: No manual trigger needed for daily search
- **Periodic cleanup**: `qmd cleanup` clears cache, keeps database lightweight

### 6.3 Advantages Summary

- **Runs locally**: No internet required, all models in GGUF format, zero dependencies
- **Incremental indexing**: New documents processed automatically, old data preserved
- **Semantics + keywords**: Dual retrieval, higher recall rate
- **On-demand loading**: Models loaded on demand, not resident in memory

---

## 7. Summary

The core value of QMD lies in combining **semantic understanding of vector search**, **keyword precision of BM25**, and **fine-ranking capability of LLM**, all running locally. For personal knowledge bases, this means:

1. **Accurate search**: Reranking makes search results more precise
2. **Fast search**: SQLite storage + GGUF models, local millisecond-level response
3. **Simple maintenance**: Event-driven, update only when documents change
4. **Resource-friendly**: ~2.5 GB memory, GGUF model format, zero dependencies

Building a personal knowledge base, QMD provides a complete technical route from "storage" to "discovery".
