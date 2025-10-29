import { notFound } from 'next/navigation';
import { workItems } from '../workItems';

interface WorkDetailPageProps {
  params: {
    id: string;
  };
}

export default function WorkDetailPage({ params }: WorkDetailPageProps) {
  const workItem = workItems.find((item) => item.id === params.id);

  if (!workItem) {
    notFound();
  }

  return (
    <div className="work-detail">
      <h1>{workItem.title}</h1>
      {/* Add more work item details here */}
    </div>
  );
}

export async function generateStaticParams() {
  // This function tells Next.js which paths to pre-render
  return workItems.map((item) => ({
    id: item.id,
  }));
}
