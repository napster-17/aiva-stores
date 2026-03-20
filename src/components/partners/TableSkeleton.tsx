//src/components/partners/TableSkeleton.tsx
import React from 'react'

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          {[...Array(columns)].map((_, j) => (
            <td key={j} className="p-4">
              <div className="h-4 bg-gray-100 rounded-md w-full"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}