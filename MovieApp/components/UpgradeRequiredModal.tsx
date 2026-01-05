import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUpgradeModal } from '../contexts/UpgradeModalContext';

interface Props {
  onUpgrade?: () => void;
}

export const UpgradeRequiredModal: React.FC<Props> = ({ onUpgrade }) => {
  const { modalState, hideUpgradeModal } = useUpgradeModal();

  return (
    <Modal
      visible={modalState.isVisible}
      transparent
      animationType="fade"
      onRequestClose={hideUpgradeModal}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Nâng cấp để sử dụng</Text>
          <Text style={styles.message}>
            Tính năng này đang yêu cầu quý khách nâng cấp tài khoản để trải nghiệm.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.secondary]} onPress={hideUpgradeModal}>
              <Text style={styles.secondaryText}>Để sau</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primary]}
              onPress={() => {
                hideUpgradeModal();
                onUpgrade?.();
              }}
            >
              <Text style={styles.primaryText}>Nâng cấp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#d1d1d6',
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primary: {
    backgroundColor: '#ff3b30',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3a3a3c',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

