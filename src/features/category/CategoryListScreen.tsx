import { useRouter } from 'expo-router';

import ZAvatar from '@/components/ZAvatar';
import ZListView from '@/components/ZListView';
import { useAuth } from '@/context/AuthContext';
import useDeleteRecord from '@/hooks/useDeleteRecord';
import usePaginatedList from '@/hooks/usePaginatedList';
import translator from '@/lib/translator';
import { CategoryType } from '@/types';

const CategoryListScreen = () => {
  const router = useRouter();
  const { isAdmin } = useAuth();

  const categories = usePaginatedList<CategoryType>({
    defaultSort: { field: 'name', order: 'asc' },
    endpoint: '/categories',
  });
  const onDelete = useDeleteRecord('/categories', categories.reload);

  return (
    <ZListView
      columns={[{ field: 'name', label: translator('name') }]}
      enableAddButton={isAdmin}
      enableDeleteButton={isAdmin}
      enableEditButton={isAdmin}
      getTitle={(item) => item.name}
      idField="id"
      list={categories}
      onAdd={() => router.push('/category/form')}
      onDelete={onDelete}
      onEdit={(id) => router.push({ pathname: '/category/form', params: { id } })}
      renderLeading={() => <ZAvatar icon="category" />}
    />
  );
};

export default CategoryListScreen;
