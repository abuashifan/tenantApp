import { PurchaseWorkspace } from '@/features/purchase/PurchaseWorkspace';

type PurchasePageProps = {
  params: Promise<{ segments?: string[] }>;
};

export default async function PurchasePage({ params }: PurchasePageProps) {
  const { segments } = await params;
  return <PurchaseWorkspace segments={segments ?? []} />;
}
