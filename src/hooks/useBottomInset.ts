import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { scanTabButtonRise } from '@/constants/theme';

// Extra bottom space a screen needs so nothing covers its last content or
// bottom buttons. Inside the tabs that is the raised Scan Code tab button (the
// tab bar itself already sits above the system navigation bar). On pushed
// stack screens it is the system navigation bar / home indicator, because
// Android draws the app edge-to-edge behind it.
const useBottomInset = (): number => {
  const insets = useSafeAreaInsets();
  const isInTabs = useContext(BottomTabBarHeightContext) !== undefined;
  return isInTabs ? scanTabButtonRise : insets.bottom;
};

export default useBottomInset;
