export interface WorkItem {
  id: string;
  title: string;
  description: string;
  // Add more fields as needed
}

export const workItems: WorkItem[] = [
  {
    id: '1',
    title: 'Work Item 1',
    description: 'Description for work item 1',
  },
  {
    id: '2',
    title: 'Work Item 2',
    description: 'Description for work item 2',
  },
  // Add more work items as needed
];
