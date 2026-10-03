export type CameraIssueType = 'denied' | 'in_use' | 'insecure' | 'not_found' | 'unknown' | 'unsupported';

// Native platforms go through the OS permission dialog (expo-camera).
export const getCameraSupportIssue = (): CameraIssueType | null => null;

export const probeCamera = async (): Promise<CameraIssueType | null> => null;

// Native cameras already stream at full quality with autofocus.
export const improveCameraQuality = async (_root: unknown) => {};
