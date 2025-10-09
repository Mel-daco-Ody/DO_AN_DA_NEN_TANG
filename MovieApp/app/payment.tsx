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
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { movieAppApi } from '../services/mock-api';
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
    id: 'credit_card',
    name: 'Credit Card',
    icon: '💳',
    description: 'Visa, Mastercard, American Express',
    isPopular: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
    description: 'Pay with your PayPal account',
    isPopular: true,
  },
  {
    id: 'momo',
    name: 'MoMo',
    icon: '💜',
    description: 'MoMo Wallet - Quick and secure',
    isPopular: true,
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: '🍎',
    description: 'Touch ID or Face ID payment',
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    icon: 'G',
    description: 'Quick and secure payment',
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: '🏦',
    description: 'Direct bank transfer',
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    icon: '₿',
    description: 'Bitcoin, Ethereum, and more',
  },
];

export default function PaymentServiceScreen() {
  const { updateSubscription, authState } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'cinematic'>('premium');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [momoPhoneNumber, setMomoPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoadingMethods(true);
      const response = await movieAppApi.getPaymentMethods();
      if (response.success && response.data) {
        setAvailableMethods(response.data);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      // Fallback to static methods
      setAvailableMethods(paymentMethods);
    } finally {
      setIsLoadingMethods(false);
    }
  };


  const handleMethodSelect = async (methodId: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setSelectedMethod(methodId);
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (selectedMethod === 'credit_card') {
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        Alert.alert('Error', 'Please fill in all credit card details');
        return;
      }
    }

    if (selectedMethod === 'momo') {
      if (!momoPhoneNumber || momoPhoneNumber.length < 10) {
        Alert.alert('Error', 'Please enter a valid MoMo phone number');
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      const planPrice = selectedPlan === 'premium' ? 19.99 : 39.99;
      const taxAmount = selectedPlan === 'premium' ? 1.99 : 3.99;
      const totalAmount = planPrice + taxAmount;

      const paymentData = {
        method: selectedMethod,
        amount: totalAmount,
        currency: 'USD',
        ...(selectedMethod === 'credit_card' && {
          cardDetails: {
            number: cardNumber,
            expiry: expiryDate,
            cvv: cvv,
            name: cardholderName,
          },
        }),
        ...(selectedMethod === 'momo' && {
          momoDetails: {
            phoneNumber: momoPhoneNumber,
            amount: 10.98,
          },
        }),
      };

      const response = await movieAppApi.processPayment(paymentData);
      
      if (response.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Update subscription based on selected plan
        await updateSubscription(selectedPlan);
        
        // Add billing history
        if (authState.user) {
          const billingData = {
            userID: authState.user.userID,
            subscriptionPlan: selectedPlan,
            amount: totalAmount,
            paymentMethod: selectedMethod,
            status: 'completed',
            transactionID: response.data?.transactionId,
            description: `Subscription: ${selectedPlan.toUpperCase()} plan`
          };
          
          await movieAppApi.addBillingHistory(billingData);
        }
        
        const currentPlan = authState.user?.subscription?.plan || 'starter';
        const planHierarchy = { 'starter': 0, 'premium': 1, 'cinematic': 2 };
        const currentLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 0;
        const selectedLevel = planHierarchy[selectedPlan as keyof typeof planHierarchy] || 0;
        
        let actionText = '';
        if (selectedLevel > currentLevel) {
          actionText = 'upgraded to';
        } else if (selectedLevel < currentLevel) {
          actionText = 'downgraded to';
        } else {
          actionText = 'renewed';
        }
        
        Alert.alert(
          'Payment Successful',
          `Your payment has been processed successfully!\nTransaction ID: ${response.data?.transactionId}\n\nYour subscription has been ${actionText} ${selectedPlan.toUpperCase()} plan!`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Payment Failed', response.errorMessage || 'Please try again or use a different payment method');
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
          <Text style={styles.selectedText}>✓ Selected</Text>
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
            💜 MoMo will redirect you to the MoMo app for payment confirmation
          </Text>
          <Text style={styles.momoInfoText}>
            🔒 Your payment is secured by MoMo's encryption
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
                {(() => {
                  const currentPlan = authState.user?.subscription?.plan || 'starter';
                  const planHierarchy = { 'starter': 0, 'premium': 1, 'cinematic': 2 };
                  const currentLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 0;
                  
                  if (currentLevel === 0) {
                    return 'Select your preferred subscription plan:';
                  } else if (currentLevel === 1) {
                    return 'Upgrade to Cinematic or stay with Premium:';
                  } else {
                    return 'Downgrade to Premium or stay with Cinematic:';
                  }
                })()}
              </Text>
              
              <View style={styles.plansContainer}>
                <Pressable 
                  onPress={() => setSelectedPlan('premium')}
                  style={({ pressed }) => [
                    styles.planCard,
                    selectedPlan === 'premium' && styles.planCardSelected,
                    pressed && { opacity: 0.9 }
                  ]}
                >
                  <Text style={styles.planTitle}>Premium</Text>
                  <Text style={styles.planPrice}>$19.99</Text>
                  <Text style={styles.planDuration}>per month</Text>
                  {(() => {
                    const currentPlan = authState.user?.subscription?.plan || 'starter';
                    if (currentPlan === 'premium') {
                      return <Text style={styles.planStatus}>Current Plan</Text>;
                    } else if (currentPlan === 'cinematic') {
                      return <Text style={styles.planDowngrade}>Downgrade</Text>;
                    } else {
                      return <Text style={styles.planUpgrade}>Upgrade</Text>;
                    }
                  })()}
                  <Text style={styles.planFeatures}>• Full HD</Text>
                  <Text style={styles.planFeatures}>• Lifetime Availability</Text>
                  <Text style={styles.planFeatures}>• TV & Desktop</Text>
                  <Text style={styles.planFeatures}>• 24/7 Support</Text>
                </Pressable>
                
                <Pressable 
                  onPress={() => setSelectedPlan('cinematic')}
                  style={({ pressed }) => [
                    styles.planCard,
                    selectedPlan === 'cinematic' && styles.planCardSelected,
                    pressed && { opacity: 0.9 }
                  ]}
                >
                  <Text style={styles.planTitle}>Cinematic</Text>
                  <Text style={styles.planPrice}>$39.99</Text>
                  <Text style={styles.planDuration}>per 2 months</Text>
                  {(() => {
                    const currentPlan = authState.user?.subscription?.plan || 'starter';
                    if (currentPlan === 'cinematic') {
                      return <Text style={styles.planStatus}>Current Plan</Text>;
                    } else {
                      return <Text style={styles.planUpgrade}>Upgrade</Text>;
                    }
                  })()}
                  <Text style={styles.planFeatures}>• Ultra HD</Text>
                  <Text style={styles.planFeatures}>• Lifetime Availability</Text>
                  <Text style={styles.planFeatures}>• Any Device</Text>
                  <Text style={styles.planFeatures}>• 24/7 Support</Text>
                </Pressable>
              </View>
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
                    FlixGo {selectedPlan === 'premium' ? 'Premium' : 'Cinematic'}
                  </Text>
                  <Text style={styles.summaryValue}>
                    ${selectedPlan === 'premium' ? '19.99' : '39.99'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>
                    ${selectedPlan === 'premium' ? '1.99' : '3.99'}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalValue}>
                    ${selectedPlan === 'premium' ? '21.98' : '43.98'}
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
