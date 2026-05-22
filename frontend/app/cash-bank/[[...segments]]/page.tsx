import { CashBankWorkspace } from '@/features/cash-bank/CashBankWorkspace';

type CashBankPageProps = {
  params: Promise<{ segments?: string[] }>;
};

export default async function CashBankPage({ params }: CashBankPageProps) {
  const { segments } = await params;
  return <CashBankWorkspace segments={segments ?? []} />;
}
