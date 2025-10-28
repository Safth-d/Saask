'use client'

import dynamic from 'next/dynamic'
import { ProjectPageSkeleton } from "./project-details";

const ProjectDetails = dynamic(() => import('./project-details'), { 
  ssr: false,
  loading: () => <ProjectPageSkeleton />
})

export default function Page({ params }: { params: { id: string } }) {
  return <ProjectDetails params={params} />
}