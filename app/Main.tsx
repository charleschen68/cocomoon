import Link from '@/components/Link'
import Tag from '@/components/Tag'
import SocialIcon from '@/components/social-icons'
import siteMetadata from '@/data/siteMetadata'
import heroContent from '@/data/heroContent'
import servicesData from '@/data/servicesData'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'

const MAX_FEATURED = 3
const MAX_DIGEST = 5

function isDigest(post: { title: string; slug: string }) {
  return (
    post.title.toLowerCase().startsWith('ai builders digest') ||
    post.slug.startsWith('ai-builders-digest')
  )
}

export default function Home({ posts }) {
  const featured = posts.filter((post) => !isDigest(post)).slice(0, MAX_FEATURED)
  const digests = posts.filter((post) => isDigest(post)).slice(0, MAX_DIGEST)

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* Hero */}
      <div className="space-y-4 pt-10 pb-12">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          {heroContent.name}
        </h1>
        <p className="text-xl leading-8 text-gray-700 dark:text-gray-300">{heroContent.tagline}</p>
        <p className="max-w-2xl text-lg leading-7 text-gray-500 dark:text-gray-400">
          {heroContent.intro}
        </p>
        <div className="flex space-x-4 pt-2">
          {siteMetadata.email && <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} />}
          {siteMetadata.github && <SocialIcon kind="github" href={siteMetadata.github} />}
        </div>
        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/consulting"
            className="bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-400 rounded-md px-5 py-2.5 font-medium text-white"
          >
            Consulting &rarr;
          </Link>
          <Link
            href="/blog"
            className="rounded-md border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Read the blog
          </Link>
        </div>
      </div>

      {/* Services */}
      <div className="py-12">
        <h2 className="mb-8 text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
          What I do
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {servicesData.map((service) => (
            <Link
              key={service.id}
              href={`/consulting#${service.id}`}
              className="block rounded-md border-2 border-gray-200/60 p-6 hover:border-gray-300 dark:border-gray-700/60 dark:hover:border-gray-600"
            >
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                {service.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{service.blurb}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured writing */}
      {featured.length > 0 && (
        <div className="py-12">
          <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Featured writing
          </h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {featured.map((post) => {
              const { slug, date, title, summary, tags } = post
              return (
                <li key={slug} className="py-8">
                  <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-3 xl:col-span-3">
                      <div>
                        <h3 className="text-xl leading-7 font-bold tracking-tight">
                          <Link href={`/blog/${slug}`} className="text-gray-900 dark:text-gray-100">
                            {title}
                          </Link>
                        </h3>
                        <div className="flex flex-wrap">
                          {tags.map((tag) => (
                            <Tag key={tag} text={tag} />
                          ))}
                        </div>
                      </div>
                      <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                        {summary}
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
          <div className="text-base leading-6 font-medium">
            <Link
              href="/blog"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label="All posts"
            >
              All posts &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Daily digest */}
      {digests.length > 0 && (
        <div className="py-12">
          <h2 className="mb-6 text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
            AI Builders Digest
          </h2>
          <ul className="space-y-3">
            {digests.map((post) => (
              <li key={post.slug} className="flex flex-wrap items-baseline gap-x-4">
                <time
                  dateTime={post.date}
                  className="text-sm text-gray-500 tabular-nums dark:text-gray-400"
                >
                  {formatDate(post.date, siteMetadata.locale)}
                </time>
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-primary-500 dark:hover:text-primary-400 font-medium text-gray-900 dark:text-gray-100"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-base leading-6 font-medium">
            <Link
              href="/tags/ai-builders-digest"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label="All digests"
            >
              All digests &rarr;
            </Link>
          </div>
        </div>
      )}

      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </div>
  )
}
