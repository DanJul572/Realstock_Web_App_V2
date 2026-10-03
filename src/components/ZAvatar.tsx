import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, withAlpha } from '@/constants/theme';

type PropsType = {
  color?: string;
  icon?: ComponentProps<typeof MaterialIcons>['name'];
  imageUri?: string | null;
  name?: string;
  shape?: 'circle' | 'rounded';
  size?: number;
};

// Shows an image, otherwise an icon, otherwise the initial of `name`.
const ZAvatar = ({
  color = colors.primary,
  icon,
  imageUri,
  name,
  shape = 'rounded',
  size = 48,
}: PropsType) => {
  const borderRadius = shape === 'circle' ? radius.round : radius.md;
  const box = { borderRadius, height: size, width: size };

  if (imageUri) {
    return <Image contentFit="cover" source={{ uri: imageUri }} style={[styles.image, box]} />;
  }

  return (
    <View style={[styles.avatar, box, { backgroundColor: withAlpha(color, 0.1) }]}>
      {icon ? (
        <MaterialIcons color={color} name={icon} size={size * 0.5} />
      ) : (
        <Text style={[styles.initial, { color, fontSize: size * 0.4 }]}>
          {name?.trim().charAt(0).toUpperCase() || '?'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: colors.skeleton,
  },
  initial: {
    fontWeight: '700',
  },
});

export default ZAvatar;
