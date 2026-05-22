import { InventoryWorkspace } from '@/features/inventory/InventoryWorkspace';

type InventoryPageProps = {
  params: Promise<{ segments?: string[] }>;
};

export default async function InventoryPage({ params }: InventoryPageProps) {
  const { segments } = await params;
  return <InventoryWorkspace segments={segments ?? []} />;
}
