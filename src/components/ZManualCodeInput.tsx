import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import ZButton from '@/components/ZButton';
import ZTextField from '@/components/ZTextField';
import { spacing } from '@/constants/theme';
import { maxCodeLength } from '@/lib/productCode';
import translator from '@/lib/translator';

type PropsType = {
  onSubmit: (code: string) => void;
};

// Fallback for when the camera can't be used (no camera, permission denied,
// damaged label).
const ZManualCodeInput = ({ onSubmit }: PropsType) => {
  const [code, setCode] = useState('');

  const submit = () => {
    const value = code.trim();
    if (value) {
      onSubmit(value);
      setCode('');
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <ZTextField
          autoCapitalize="characters"
          icon="keyboard"
          maxLength={maxCodeLength}
          onChangeText={setCode}
          onSubmitEditing={submit}
          placeholder={translator('enter_code_manually')}
          value={code}
        />
      </View>
      <ZButton
        disabled={!code.trim()}
        onPress={submit}
        style={styles.button}
        title={translator('use_code')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
  },
  button: {
    minHeight: 50,
  },
});

export default ZManualCodeInput;
