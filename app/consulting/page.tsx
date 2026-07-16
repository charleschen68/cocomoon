import Link from '@/components/Link'
import servicesData, { howIWork } from '@/data/servicesData'
import siteMetadata from '@/data/siteMetadata'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Consulting',
  description:
    'Consulting in high-performance distributed systems, real-time data infrastructure, and AI-driven data processing.',
})

export default function Consulting() {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          Consulting
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          [PLACEHOLDER] I help teams build and operate systems that are fast, correct, and reliable
          at scale.
        </p>
      </div>
      <div className="divide-y divide-gray-200 py-6 dark:divide-gray-700">
        {servicesData.map((service) => (
          <section key={service.id} id={service.id} className="scroll-mt-24 py-10">
            <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {service.name}
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">{service.description}</p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-gray-500 dark:text-gray-400">
              {service.capabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="py-10">
        <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
          How I work
        </h2>
        <ol className="mt-6 space-y-6">
          {howIWork.map((item, index) => (
            <li key={item.step} className="flex gap-4">
              <span className="text-primary-500 text-lg font-bold">{index + 1}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.step}</h3>
                <p className="text-gray-500 dark:text-gray-400">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="py-10">
        <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Work with me
        </h2>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          [PLACEHOLDER] Have a project in mind or want a second opinion on your architecture?
        </p>
        <Link
          href={`mailto:${siteMetadata.email}`}
          className="bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-400 mt-6 inline-block rounded-md px-6 py-3 font-medium text-white"
        >
          Get in touch
        </Link>
      </div>
    </div>
  )
}
