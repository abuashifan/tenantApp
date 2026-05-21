import { MasterDataResourcePage } from '@/features/accounting/master-data/MasterDataResourcePage';
import { getMasterDataResource } from '@/features/accounting/master-data/config';

export default function ContactsPage() {
  return <MasterDataResourcePage resource={getMasterDataResource('contacts')} />;
}
