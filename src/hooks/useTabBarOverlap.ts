import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { useContext } from 'react';

import { scanTabButtonRise } from '@/constants/theme';

// Extra bottom space a tab screen needs so the raised Scan Code tab button
// does not cover its content. Zero outside the tabs (e.g. pushed stack screens),
// where the tab context is not provided.
const useTabBarOverlap = (): number =>
  useContext(BottomTabBarHeightContext) === undefined ? 0 : scanTabButtonRise;

export default useTabBarOverlap;
