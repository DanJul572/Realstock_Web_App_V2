import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
} from 'expo-image-picker';
import { Platform } from 'react-native';

import translator from '@/lib/translator';

const maxSize = 500;

export type ImageSourceType = 'camera' | 'library';

export type PickedImageType = {
  dataUrl: string;
  name: string;
};

const getSaveFormat = (mimeType?: string): SaveFormat => {
  if (mimeType === 'image/png') {
    return SaveFormat.PNG;
  }
  if (mimeType === 'image/webp') {
    return SaveFormat.WEBP;
  }
  return SaveFormat.JPEG;
};

// Browsers have no camera permission step: the file input opens the camera
// (or a file chooser on desktop) and must be opened right in the tap handler.
const launchCamera = async () => {
  if (Platform.OS !== 'web') {
    const permission = await requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error(translator('camera_permission_hint'));
    }
  }
  return launchCameraAsync({ mediaTypes: ['images'] });
};

// Picks an image from the library or takes a photo, and downsizes it to fit in
// 500x500, returning it as a base64 data URL (the format the API expects).
const pickResizedImage = async (
  source: ImageSourceType = 'library'
): Promise<PickedImageType | null> => {
  const result =
    source === 'camera'
      ? await launchCamera()
      : await launchImageLibraryAsync({ mediaTypes: ['images'] });
  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  const scale = Math.min(1, maxSize / asset.width, maxSize / asset.height);
  const context = ImageManipulator.manipulate(asset.uri);
  if (scale < 1) {
    context.resize({
      width: Math.round(asset.width * scale),
      height: Math.round(asset.height * scale),
    });
  }

  const image = await context.renderAsync();
  const format = getSaveFormat(asset.mimeType);
  const saved = await image.saveAsync({ base64: true, format });
  // Camera photos usually have no file name.
  const fallbackName = source === 'camera' ? `photo-${Date.now()}` : 'image';

  return {
    dataUrl: `data:image/${format};base64,${saved.base64}`,
    name: asset.fileName ?? `${fallbackName}.${format}`,
  };
};

export default pickResizedImage;
