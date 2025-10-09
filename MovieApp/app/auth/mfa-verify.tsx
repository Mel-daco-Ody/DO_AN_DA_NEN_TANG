import React from 'react';
import { StatusBar } from 'expo-status-bar';
import MfaVerification from '../../components/MfaVerification';

export default function MfaVerifyScreen() {
  return (
    <>
      <StatusBar style="light" />
      <MfaVerification />
    </>
  );
}

