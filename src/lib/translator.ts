import { getLocales } from 'expo-localization';

import en from '@/languages/en.json';
import id from '@/languages/id.json';

export type TranslationKeyType = keyof typeof en;

const dictionary: Record<TranslationKeyType, string> =
  getLocales()[0]?.languageCode === 'id' ? id : en;

const translator = (key: TranslationKeyType): string => dictionary[key] ?? key;

export default translator;
