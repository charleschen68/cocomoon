import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'About' })

export default function Page() {
  // 1. 寻找 slug 为 default 的作者
  const author = allAuthors.find((p) => p.slug === 'default')

  // 🛡️ 如果没找到作者数据，返回一个友好的错误提示而不是崩溃
  if (!author) {
    return (
      <div className="mt-24 text-center">
        <h1 className="text-2xl font-bold">Author profile not found.</h1>
        <p>Please check if data/authors/default.mdx exists.</p>
      </div>
    )
  }

  const mainContent = coreContent(author)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MDXLayoutRenderer code={author.body.code} />
      </AuthorLayout>
    </>
  )
}
