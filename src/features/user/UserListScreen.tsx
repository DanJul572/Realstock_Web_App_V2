import { useRouter } from 'expo-router';

import ZAvatar from '@/components/ZAvatar';
import ZBadge from '@/components/ZBadge';
import ZListView from '@/components/ZListView';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import useDeleteRecord from '@/hooks/useDeleteRecord';
import usePaginatedList from '@/hooks/usePaginatedList';
import translator from '@/lib/translator';
import { UserType } from '@/types';

const UserListScreen = () => {
  const router = useRouter();
  const { isAdmin } = useAuth();

  const users = usePaginatedList<UserType>({
    defaultSort: { field: 'name', order: 'asc' },
    endpoint: '/users',
  });
  const onDelete = useDeleteRecord('/users', users.reload);

  return (
    <ZListView
      columns={[
        { field: 'name', label: translator('name') },
        { field: 'email', label: translator('email') },
        { field: 'role_id', label: translator('role_id') },
      ]}
      enableAddButton={isAdmin}
      enableDeleteButton={isAdmin}
      enableEditButton={isAdmin}
      getSubtitle={(item) => item.email}
      getTitle={(item) => item.name}
      idField="id"
      list={users}
      onAdd={() => router.push('/user/form')}
      onDelete={onDelete}
      onEdit={(id) => router.push({ pathname: '/user/form', params: { id } })}
      renderLeading={(item) => (
        <ZAvatar
          color={item.role_id === 1 ? colors.primary : colors.info}
          name={item.name}
          shape="circle"
        />
      )}
      renderMeta={(item) =>
        item.role_id === 1 ? (
          <ZBadge icon="verified-user" label="Admin" />
        ) : (
          <ZBadge color={colors.info} icon="person" label="User" />
        )
      }
    />
  );
};

export default UserListScreen;
