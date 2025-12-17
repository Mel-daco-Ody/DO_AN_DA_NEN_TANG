import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import filmzoneApi from '../services/filmzone-api';
import { useAuth } from '../contexts/AuthContext';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  isPopular?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: 'VN',
    description: 'Thanh toán qua cổng VNPay',
    isPopular: true,
  },
];

export default function PaymentServiceScreen() {
  const { updateSubscription, authState, updateUser } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [momoPhoneNumber, setMomoPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [planPriceMap, setPlanPriceMap] = useState<Record<string, { label: string; amount: number; currency: string; priceId?: number }>>({});

  // helpers
  const getPlanId = (plan: any) => plan?.planID ?? plan?.planId ?? plan?.id;
  const getPriceId = (plan: any) => plan?.priceID ?? plan?.priceId;
  const formatPrice = (price: any) => {
    if (!price) return 'N/A';
    if (price.amount !== undefined) {
      const amountNum = Number(price.amount);
      const currency = price.currency || '';
      if (!isNaN(amountNum) && amountNum === 0) return 'Free';
      return `${price.amount} ${currency}`.trim();
    }
    return price.toString();
  };

  useEffect(() => {
    loadPaymentMethods();
    loadPlans();
  }, []);

  // Ensure auth token is set on filmzoneApi for protected payment endpoint
  useEffect(() => {
    if (authState.token) {
      filmzoneApi.setToken(authState.token);
    }
  }, [authState.token]);

  useEffect(() => {
  console.log('Payment: selectedMethod changed to:', selectedMethod);
  }, [selectedMethod]);

  useEffect(() => {
  console.log('Payment: selectedPlan changed to:', selectedPlan);
  }, [selectedPlan]);

  const loadPaymentMethods = async () => {
    // Chỉ sử dụng phương thức thanh toán VNPay (danh sách tĩnh)
    try {
      setIsLoadingMethods(true);
      setAvailableMethods(paymentMethods);
      // Tự động chọn VNPay nếu chưa có phương thức nào được chọn
      setSelectedMethod(prev => prev || 'vnpay');
    } finally {
      setIsLoadingMethods(false);
    }
  };

  const loadPlans = async () => {
    setPlansLoading(true);
    try {
      let pricesData: any[] = [];
      // load prices
      try {
        const pricesRes = await filmzoneApi.getAllPrices();
        const ok = (pricesRes as any).success === true || (pricesRes.errorCode >= 200 && pricesRes.errorCode < 300);
        pricesData = ok && pricesRes.data ? pricesRes.data : [];
        setPriceList(pricesData);
      } catch {
        pricesData = [];
        setPriceList([]);
      }

      // load plans
      const plansRes = await filmzoneApi.getAllPlans();
      const plansOk = (plansRes as any).success === true || (plansRes.errorCode >= 200 && plansRes.errorCode < 300);
      if (plansOk && plansRes.data) {
        const activePlans = (plansRes.data || []).filter((p: any) => p.isActive !== false);
        setPlans(activePlans);

        const priceEntries = await Promise.all(
          activePlans.map(async (p: any, idx: number) => {
            const pid = String(getPlanId(p) ?? idx);
            const priceId = getPriceId(p);
            if (priceId) {
              const priceRes = await filmzoneApi.getPriceById(priceId);
              const priceOk = (priceRes as any).success === true || (priceRes.errorCode >= 200 && priceRes.errorCode < 300);
              if (priceOk && priceRes.data) {
                return [pid, { label: formatPrice(priceRes.data), amount: Number(priceRes.data.amount) || 0, currency: priceRes.data.currency || '', priceId: priceRes.data.priceID ?? priceRes.data.priceId ?? priceId }] as const;
              }
            }
            if (pricesData.length) {
              const matched = pricesData.find((pr: any) => String(pr.planID ?? pr.planId) === pid);
              if (matched) {
                return [pid, { label: formatPrice(matched), amount: Number(matched.amount) || 0, currency: matched.currency || '', priceId: matched.priceID ?? matched.priceId }] as const;
              }
            }
            return [pid, { label: 'N/A', amount: 0, currency: '', priceId: undefined }] as const;
          })
        );
        const map: Record<string, { label: string; amount: number; currency: string; priceId?: number }> = {};
        const paidPlanIds = new Set<string>();
        priceEntries.forEach(entry => {
          if (entry) {
            const [pid, priceObj] = entry;
            map[pid] = priceObj;
            if (priceObj.amount > 0) paidPlanIds.add(pid);
          }
        });
        setPlanPriceMap(map);

        // Only keep plans that have price > 0
        const paidPlans = activePlans.filter((p: any, idx: number) => {
          const pid = String(getPlanId(p) ?? idx);
          return paidPlanIds.has(pid);
        });
        setPlans(paidPlans);

        // default selected plan (paid only)
        if (paidPlans.length > 0) {
          setSelectedPlan(prev => prev || String(getPlanId(paidPlans[0]) ?? ''));
        } else {
          setSelectedPlan('');
        }
      } else {
        setPlans([]);
      }
    } catch {
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };


  const handleMethodSelect = async (methodId: string) => {
  console.log('Payment: Method selected:', methodId);
  console.log('Payment: Previous selectedMethod:', selectedMethod);
    
    try {
      await Haptics.selectionAsync();
    } catch {}
    setSelectedMethod(methodId);
    
  console.log('Payment: New selectedMethod set to:', methodId);
  };

  const handlePayment = async () => {
  console.log('Payment: handlePayment called');
  console.log('Payment: selectedMethod:', selectedMethod);
  console.log('Payment: selectedPlan:', selectedPlan);
  console.log('Payment: isProcessing:', isProcessing);
    
    if (!selectedMethod) {
  console.log('Payment: No payment method selected');
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (selectedMethod === 'credit_card') {
  console.log('Payment: Credit card validation');
  console.log('Payment: cardNumber:', cardNumber);
  console.log('Payment: expiryDate:', expiryDate);
  console.log('Payment: cvv:', cvv);
  console.log('Payment: cardholderName:', cardholderName);
      
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
  console.log('Payment: Credit card details incomplete');
        Alert.alert('Error', 'Please fill in all credit card details');
        return;
      }
    }

    if (selectedMethod === 'momo') {
  console.log('Payment: MoMo validation');
  console.log('Payment: momoPhoneNumber:', momoPhoneNumber);
      
      if (!momoPhoneNumber || momoPhoneNumber.length < 10) {
  console.log('Payment: MoMo phone number invalid');
        Alert.alert('Error', 'Please enter a valid MoMo phone number');
        return;
      }
    }

  console.log('Payment: Validation passed, processing payment...');
    setIsProcessing(true);
    
    try {
      const priceObj = planPriceMap[selectedPlan];
      if (!priceObj || !priceObj.priceId) {
        Alert.alert('Error', 'Price information not available for this plan.');
        return;
      }

      // VNPay checkout
      const response = await filmzoneApi.createVnPayCheckout({ priceId: Number(priceObj.priceId) });
      console.log('VNPay checkout response:', JSON.stringify(response, null, 2));
      const isOk = (response as any).success === true || (response.errorCode >= 200 && response.errorCode < 300);

      if (isOk && response.data?.paymentUrl) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await Linking.openURL(response.data.paymentUrl);
        Alert.alert('Redirecting to payment', 'We are opening the VNPay checkout page.');

        // Optimistically update current subscription in authState so Home/Profile reflect new plan
        try {
          const selectedPlanObj = plans.find(p => String(getPlanId(p)) === String(selectedPlan));
          const legacyCode = (selectedPlanObj?.code || selectedPlanObj?.name || '').toLowerCase();
          let legacyPlan: 'starter' | 'premium' | 'cinematic' = 'starter';
          if (legacyCode.includes('cinema')) legacyPlan = 'cinematic';
          else if (legacyCode.includes('prem')) legacyPlan = 'premium';

          // Keep legacy update for mock flows
          await updateSubscription(legacyPlan);

          // Also update FilmZone-style subscription fields (planID/priceID) for UI
          if (selectedPlanObj) {
            const planIdValue = getPlanId(selectedPlanObj);
            updateUser({
              subscription: {
                ...(authState.user?.subscription as any),
                plan: selectedPlanObj.code || selectedPlanObj.name || legacyPlan,
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: authState.user?.subscription?.endDate,
                autoRenew: true,
                planID: planIdValue,
                planId: planIdValue,
                priceID: priceObj.priceId,
                priceId: priceObj.priceId,
              } as any,
            } as any);
          }
        } catch (err) {
          console.warn('Payment: failed to update subscription after checkout start', err);
        }
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Payment Failed', response.errorMessage || `Unable to start checkout (code ${response.errorCode ?? 'n/a'})`);
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Payment Failed', 'Please try again or use a different payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  const goBack = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    router.back();
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <Pressable
      key={method.id}
      onPress={() => handleMethodSelect(method.id)}
      style={({ pressed }) => [
        styles.paymentMethodCard,
        selectedMethod === method.id && styles.selectedMethod,
        pressed && styles.pressedMethod,
      ]}
    >
      <View style={styles.methodHeader}>
        <Text style={styles.methodIcon}>{method.icon}</Text>
        <View style={styles.methodInfo}>
          <Text style={styles.methodName}>{method.name}</Text>
          <Text style={styles.methodDescription}>{method.description}</Text>
        </View>
        {method.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
      </View>
      {selectedMethod === method.id && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedText}>Selected</Text>
        </View>
      )}
    </Pressable>
  );

  const renderCreditCardForm = () => {
    if (selectedMethod !== 'credit_card') return null;

    return (
      <View style={styles.creditCardForm}>
        <Text style={styles.formTitle}>Credit Card Details</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Card Number"
          placeholderTextColor="#8e8e93"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
          maxLength={19}
        />
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="MM/YY"
            placeholderTextColor="#8e8e93"
            value={expiryDate}
            onChangeText={setExpiryDate}
            keyboardType="numeric"
            maxLength={5}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="CVV"
            placeholderTextColor="#8e8e93"
            value={cvv}
            onChangeText={setCvv}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Cardholder Name"
          placeholderTextColor="#8e8e93"
          value={cardholderName}
          onChangeText={setCardholderName}
          autoCapitalize="words"
        />
      </View>
    );
  };

  const renderMomoForm = () => {
    if (selectedMethod !== 'momo') return null;

    return (
      <View style={styles.creditCardForm}>
        <Text style={styles.formTitle}>MoMo Wallet Details</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Phone Number (e.g., 0901234567)"
          placeholderTextColor="#8e8e93"
          value={momoPhoneNumber}
          onChangeText={setMomoPhoneNumber}
          keyboardType="phone-pad"
          maxLength={11}
        />
        
        <View style={styles.momoInfo}>
          <Text style={styles.momoInfoText}>
            MoMo will redirect you to the MoMo app for payment confirmation
          </Text>
          <Text style={styles.momoInfoText}>
            Your payment is secured by MoMo's encryption
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ImageBackground
        source={{ uri: 'https://flixgo.volkovdesign.com/main/img/bg/section__bg.jpg' }}
        style={styles.background}
      >
        <View style={styles.overlay} />
        
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={goBack} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Payment Service</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Plan Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Subscription Plan</Text>
              <Text style={styles.sectionSubtitle}>
                Select your preferred subscription plan:
              </Text>
              
              {plansLoading ? (
                <View style={[styles.planCard, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                  <Text style={styles.planTitle}>Loading plans...</Text>
                </View>
              ) : plans.length > 0 ? (
                <View style={styles.plansContainer}>
                  {plans.map((p: any, idx: number) => {
                    const pid = String(getPlanId(p) ?? idx);
                    const selected = selectedPlan === pid;
                    const priceLabel = planPriceMap[pid]?.label || 'N/A';
                    return (
                      <Pressable 
                        key={pid}
                        onPress={() => setSelectedPlan(pid)}
                        style={({ pressed }) => [
                          styles.planCard,
                          selected && styles.planCardSelected,
                          pressed && { opacity: 0.9 }
                        ]}
                      >
                        <Text style={styles.planTitle}>{p.name || p.code || `Plan ${pid}`}</Text>
                        <Text style={styles.planPrice}>{priceLabel}</Text>
                        {p.description ? <Text style={styles.planDuration}>{p.description}</Text> : null}
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.sectionSubtitle}>No active plans available.</Text>
              )}
            </View>

            {/* Payment Methods */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Payment Method</Text>
              <Text style={styles.sectionSubtitle}>Select your preferred payment method</Text>
              
              {isLoadingMethods ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading payment methods...</Text>
                </View>
              ) : (
                availableMethods.map(renderPaymentMethod)
              )}
            </View>

            {/* Credit Card Form */}
            {renderCreditCardForm()}

            {/* MoMo Form */}
            {renderMomoForm()}

            {/* Payment Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {selectedPlan
                      ? `Plan #${selectedPlan}`
                      : 'Select a plan'}
                  </Text>
                  <Text style={styles.summaryValue}>
                    {selectedPlan && planPriceMap[selectedPlan]?.label
                      ? planPriceMap[selectedPlan].label
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalValue}>
                    {selectedPlan && planPriceMap[selectedPlan]?.label
                      ? planPriceMap[selectedPlan].label
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Payment Button */}
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.paymentButton,
                (!selectedMethod || isProcessing) && styles.disabledButton,
              ]}
              onPress={handlePayment}
              disabled={!selectedMethod || isProcessing}
            >
              <Text style={styles.paymentButtonText}>
                {isProcessing ? 'Processing...' : 'Complete Payment'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#e50914',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#8e8e93',
    fontSize: 14,
    marginBottom: 20,
  },
  paymentMethodCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMethod: {
    borderColor: '#e50914',
    backgroundColor: '#2a1a1a',
  },
  pressedMethod: {
    opacity: 0.8,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodDescription: {
    color: '#8e8e93',
    fontSize: 12,
  },
  popularBadge: {
    backgroundColor: '#e50914',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  selectedIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e50914',
  },
  selectedText: {
    color: '#e50914',
    fontSize: 14,
    fontWeight: '600',
  },
  creditCardForm: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#8e8e93',
    fontSize: 14,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#3a3a3a',
    marginVertical: 12,
  },
  summaryTotalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryTotalValue: {
    color: '#e50914',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  paymentButton: {
    backgroundColor: '#e50914',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#e50914',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#666',
    shadowOpacity: 0,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#8e8e93',
    fontSize: 14,
  },
  momoInfo: {
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#8B4513',
  },
  momoInfoText: {
    color: '#c7c7cc',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  planCard: {
    backgroundColor: '#1c1c23',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: '#e50914',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  planTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  planPrice: {
    color: '#ffd166',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  planDuration: {
    color: '#8e8e93',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  planFeatures: {
    color: '#c7c7cc',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  planStatus: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  planUpgrade: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  planDowngrade: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});

