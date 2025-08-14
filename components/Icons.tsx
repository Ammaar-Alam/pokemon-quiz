export function GearIcon(props: React.SVGProps<SVGSVGElement>) {
  // Solid 6-tooth gear for clearer settings affordance
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M11.078 2.25c-.41 0-.8.243-.95.617l-.56 1.395a8.91 8.91 0 0 0-1.746.705l-1.49-.56a1.125 1.125 0 0 0-1.347.49l-1.5 2.598a1.125 1.125 0 0 0 .284 1.432l1.262.98c-.05.465-.05.943 0 1.41l-1.262.98a1.125 1.125 0 0 0-.284 1.432l1.5 2.598c.27.468.85.69 1.347.49l1.49-.56c.56.29 1.14.525 1.746.705l.56 1.395c.15.374.54.617.95.617h3c.49 0 .93-.303 1.05-.74l.56-1.395c.606-.18 1.186-.415 1.746-.705l1.49.56c.497.2 1.078-.022 1.347-.49l1.5-2.598a1.125 1.125 0 0 0-.284-1.432l-1.262-.98c.05-.467.05-.945 0-1.41l1.262-.98c.38-.295.49-.83.284-1.432l-1.5-2.598a1.125 1.125 0 0 0-1.347-.49l-1.49.56a8.91 8.91 0 0 0-1.746-.705l-.56-1.395a1.125 1.125 0 0 0-1.05-.74h-3Zm.344 9.328a3 3 0 1 0 1.156 5.906 3 3 0 0 0-1.156-5.906Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8l2-5 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
    </svg>
  )
}

export function ExternalLinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18m0 0v4.5M18 6l-6.75 6.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5h-1.5A2.25 2.25 0 0 0 4.5 9.75v9A2.25 2.25 0 0 0 6.75 21h9a2.25 2.25 0 0 0 2.25-2.25v-1.5" />
    </svg>
  )
}

export function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
