import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import TransactionListView from '@/features/transaction/TransactionListView';

const TransactionListScreen = () => {
  const router = useRouter();
  const { isAdmin } = useAuth();

  return (
    <TransactionListView enableAddButton={isAdmin} onAdd={() => router.push('/transaction/form')} />
  );
};

export default TransactionListScreen;
