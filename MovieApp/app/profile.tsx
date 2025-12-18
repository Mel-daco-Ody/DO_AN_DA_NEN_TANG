import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ImageBackground, ScrollView, Pressable, TextInput, Switch, Alert, ActivityIndicator, Modal } from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { movieAppApi } from '../services/api';
import filmzoneApi from '../services/filmzone-api';
import * as Haptics from 'expo-haptics';
import { ListSkeleton } from '../components/SkeletonPlaceholder';
import { NetworkErrorState, ServerErrorState } from '../components/ErrorState';
import { AnimatedButton, AnimatedCard } from '../components/AnimatedPressable';

export default function ProfileScreen() {
  const { authState, signOut: authSignOut, updateSubscription, updateUser } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { 
    notificationsEnabled, 
    notificationSettings,
    togglePushNotifications,
    toggleEmailUpdates,
    toggleMovieRecommendations,
    toggleNewContentAlerts,
    toggleSubscriptionReminders,
    sendTestNotification
  } = useNotifications();
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [activeTab, setActiveTab] = useState('overview');
  const [avatar, setAvatar] = useState('');
  // Notification states - sử dụng từ context thay vì local state
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCommittingPassword, setIsCommittingPassword] = useState(false);
  const [passwordChangeTicket, setPasswordChangeTicket] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [expandComments, setExpandComments] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [planPrices, setPlanPrices] = useState<Record<string, string>>({});
  const [priceList, setPriceList] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any | null>(null);
  const [plansLoading, setPlansLoading] = useState(false);
  const [fetchedSubscription, setFetchedSubscription] = useState<any | null>(null);

  // helper for plan/price
  const getPlanId = (plan: any) => plan?.planID ?? plan?.planId ?? plan?.id;
  const getPriceId = (plan: any, sub?: any) =>
    sub?.priceID ?? sub?.priceId ?? plan?.priceID ?? plan?.priceId;
  const formatPrice = (price: any) => {
    if (!price) return 'N/A';
    if (price.amount !== undefined) {
      const amountNum = Number(price.amount);
      if (!isNaN(amountNum) && amountNum === 0) return 'Free';
      const currency = price.currency || '';
      return `${price.amount} ${currency}`.trim();
    }
    return price.toString();
  };

  useEffect(() => {
    if (authState.user) {
      setName(authState.user.userName || 'User');
      setEmail(authState.user.email || '');
      setAvatar(authState.user.avatar || '');
    }
  }, [authState.user]);

  // Load plans/prices when subscription tab active or user changes
  useEffect(() => {
    const loadPlans = async () => {
      setPlansLoading(true);
      try {
        const userId = authState.user?.userID;

        // Fetch latest subscription by user (choose max subscriptionID)
        let apiSubscription: any = null;
        if (userId) {
          try {
            const subsRes = await filmzoneApi.getSubscriptionsByUser(userId);
            const subsOk = (subsRes as any).success === true || (subsRes.errorCode >= 200 && subsRes.errorCode < 300);
            if (subsOk && subsRes.data) {
              const subsArr = Array.isArray(subsRes.data) ? subsRes.data : [subsRes.data];
              if (subsArr.length > 0) {
                apiSubscription = subsArr
                  .filter((s: any) => s)
                  .sort((a: any, b: any) => {
                    const aId = Number(a.subscriptionID ?? a.subscriptionId ?? 0);
                    const bId = Number(b.subscriptionID ?? b.subscriptionId ?? 0);
                    return bId - aId;
                  })[0];
              }
            }
          } catch (err) {
            console.log('Profile: getSubscriptionsByUser failed', err);
          }
        }

        // Chỉ sử dụng subscription lấy từ API, không fallback sang authState
        const sub = apiSubscription || null;
        setFetchedSubscription(sub);
        if (!sub) {
          setCurrentPlan(null);
        }
        let subPlanId = (sub as any)?.planID ?? (sub as any)?.planId;

        // load all prices
        let pricesData: any[] = [];
        try {
          const pricesRes = await filmzoneApi.getAllPrices();
          const pricesOk = (pricesRes as any).success === true || (pricesRes.errorCode >= 200 && pricesRes.errorCode < 300);
          pricesData = pricesOk && pricesRes.data ? pricesRes.data : [];
          setPriceList(pricesData);
        } catch {
          pricesData = [];
          setPriceList([]);
        }

        // Nếu không có planID nhưng có priceID, cố gắng suy ra planID từ price
        if (sub && !subPlanId && ((sub as any)?.priceID ?? (sub as any)?.priceId)) {
          const subPriceId = (sub as any)?.priceID ?? (sub as any)?.priceId;
          try {
            const priceRes = await filmzoneApi.getPriceById(Number(subPriceId));
            const priceOk = (priceRes as any).success === true || (priceRes.errorCode >= 200 && priceRes.errorCode < 300);
            if (priceOk && priceRes.data) {
              subPlanId = priceRes.data.planID ?? priceRes.data.planId ?? subPlanId;
            }
          } catch {}
        }

        if (sub) {
          // current plan từ subscription (lấy subscriptionID lớn nhất) và planID chính xác
          const rawPlanId =
            subPlanId ??
            (sub as any)?.planID ??
            (sub as any)?.planId;
          const planIdNum = Number(rawPlanId);
          const planIdStr = String(rawPlanId ?? 'current');

          // Lấy thông tin plan từ /api/plans/{planID} để dùng name chính xác
          let planFromApi: any | null = null;
          if (!Number.isNaN(planIdNum) && Number.isFinite(planIdNum) && planIdNum > 0) {
            try {
              const planRes = await filmzoneApi.getPlanById(planIdNum);
              const planOk =
                (planRes as any).success === true ||
                (planRes.errorCode >= 200 && planRes.errorCode < 300);
              if (planOk && planRes.data) {
                planFromApi = planRes.data;
              }
            } catch {
              // ignore, sẽ fallback bên dưới
            }
          }

          if (planFromApi) {
          setCurrentPlan({
              ...(planFromApi as any),
              planID: planFromApi.planID ?? planFromApi.planId ?? planIdNum,
              name: planFromApi.name,
              code: planFromApi.code,
          });
          } else {
            // Nếu không gọi được /api/plans/{planID}, coi như không có current plan
            setCurrentPlan(null);
          }

          // tải danh sách plans để hiển thị available plans
          const plansRes = await filmzoneApi.getAllPlans();
          const plansOk = (plansRes as any).success === true || (plansRes.errorCode >= 200 && plansRes.errorCode < 300);
          if (plansOk && plansRes.data) {
            const activePlans = (plansRes.data || []).filter((p: any) => p.isActive !== false);
            setPlans(activePlans);

            // Map giá cho từng plan từ bảng Price (amount + currency) – chỉ dùng cho Available plans
            if (activePlans.length && pricesData.length) {
              const priceMap: Record<string, string> = {};
              activePlans.forEach((p: any) => {
                const pid = String(getPlanId(p) ?? '');
                if (!pid) return;
                const matched = pricesData.find(
                  (pr: any) => String(pr.planID ?? pr.planId) === pid
                );
                if (matched) {
                  priceMap[pid] = formatPrice(matched);
                }
              });
              if (Object.keys(priceMap).length) {
                setPlanPrices(prev => ({ ...prev, ...priceMap }));
              }
            }
          } else {
            setPlans([]);
          }
        } else {
          // Không có subscription: không đặt current plan
          setCurrentPlan(null);

          // load plans để phần available plans vẫn có dữ liệu
          const plansRes = await filmzoneApi.getAllPlans();
          const plansOk = (plansRes as any).success === true || (plansRes.errorCode >= 200 && plansRes.errorCode < 300);
          if (plansOk && plansRes.data) {
            const activePlans = (plansRes.data || []).filter((p: any) => p.isActive !== false);
            setPlans(activePlans);

            // Map giá cho từng plan từ bảng Price (amount + currency)
            if (activePlans.length && pricesData.length) {
              const priceMap: Record<string, string> = {};
              activePlans.forEach((p: any) => {
                const pid = String(getPlanId(p) ?? '');
                if (!pid) return;
                const matched = pricesData.find(
                  (pr: any) => String(pr.planID ?? pr.planId) === pid
                );
                if (matched) {
                  priceMap[pid] = formatPrice(matched);
                }
              });
              if (Object.keys(priceMap).length) {
                setPlanPrices(prev => ({ ...prev, ...priceMap }));
              }
            }
          } else {
            setPlans([]);
          }
        }
      } catch {
        setPlans([]);
        setCurrentPlan(null);
      } finally {
        setPlansLoading(false);
      }
    };

    if (activeTab === 'subscription') {
      loadPlans();
    }
  }, [activeTab, authState.user]);

  // Function to refresh overview stats
  const refreshOverviewStats = async () => {
    if (authState.user && authState.user.userID) {
      try {
        const { movieAppApi } = await import('../services/mock-api');
        const response = await (movieAppApi as any).getOverviewStats(authState.user.userID.toString());
        
        if (response.success && response.data) {
          setOverviewStats(response.data);
        }
      } catch (error) {
      }
    }
  };

  // Load overview stats
  useEffect(() => {
    const loadOverviewStats = async () => {
      if (activeTab === 'overview' && authState.user && authState.user.userID) {
        setIsLoadingStats(true);
        try {
          // Load watch progress (films watched)
          let watchedFilms: any[] = [];
          try {
            const watchProgressResponse = await filmzoneApi.getWatchProgressByUserId(authState.user.userID);
            const progressOk = (watchProgressResponse as any).success === true || (watchProgressResponse.errorCode >= 200 && watchProgressResponse.errorCode < 300);
            
            if (progressOk && watchProgressResponse.data) {
              const progressList = Array.isArray(watchProgressResponse.data) ? watchProgressResponse.data : [watchProgressResponse.data];
              
              // Filter: Only consider movies that have been watched at least 80% (considered as "watched")
              const watchedProgressList = progressList.filter((p: any) => {
                if (!p.positionSeconds || !p.durationSeconds || p.durationSeconds === 0) {
                  return false; // Skip if no valid progress data
                }
                const progressPercentage = (p.positionSeconds / p.durationSeconds) * 100;
                return progressPercentage >= 80; // Only movies watched >= 80% are considered "watched"
              });
              
              // Get unique movie IDs from watched movies
              const uniqueMovieIds = [...new Set(watchedProgressList.map((p: any) => p.movieID).filter(Boolean))];
              
              // Fetch movie info for each unique movie
              watchedFilms = await Promise.all(
                uniqueMovieIds.map(async (movieId: number) => {
                  try {
                    const movieResponse = await filmzoneApi.getMovieById(movieId);
                    const movieOk = (movieResponse as any).success === true || (movieResponse.errorCode >= 200 && movieResponse.errorCode < 300);
                    if (movieOk && movieResponse.data) {
                      // Find the latest watch progress for this movie
                      const latestProgress = watchedProgressList
                        .filter((p: any) => p.movieID === movieId)
                        .sort((a: any, b: any) => {
                          const dateA = new Date(a.updatedAt || 0).getTime();
                          const dateB = new Date(b.updatedAt || 0).getTime();
                          return dateB - dateA;
                        })[0];
                      
                      return {
                        id: movieResponse.data.movieID,
                        title: movieResponse.data.title || 'Movie',
                        image: movieResponse.data.image || null,
                        lastWatchedAt: latestProgress?.updatedAt || new Date().toISOString(),
                      };
                    }
                  } catch (err) {
                    console.warn('Failed to fetch movie for watch progress:', err);
                    return null;
                  }
                  return null;
                })
              );
              // Filter out null values and sort by last watched date
              watchedFilms = watchedFilms
                .filter(Boolean)
                .sort((a: any, b: any) => {
                  const dateA = new Date(a.lastWatchedAt || 0).getTime();
                  const dateB = new Date(b.lastWatchedAt || 0).getTime();
                  return dateB - dateA;
                });
            }
          } catch (err) {
            console.warn('Failed to load watch progress:', err);
          }

          // Load comments from backend API
          const commentsResponse = await filmzoneApi.getCommentsByUserID(authState.user.userID);
          const commentsOk = (commentsResponse as any).success === true || (commentsResponse.errorCode >= 200 && commentsResponse.errorCode < 300);
          
          let latestComments: any[] = [];
          if (commentsOk && commentsResponse.data) {
            const comments = Array.isArray(commentsResponse.data) ? commentsResponse.data : [commentsResponse.data];
            // Sort by createdAt descending (don't slice here, we'll show 3 by default and all when expanded)
            const sortedComments = comments
              .sort((a: any, b: any) => {
                const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
                const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
                return dateB - dateA;
              });

            // Fetch movie info for each comment
            latestComments = await Promise.all(
              sortedComments.map(async (comment: any) => {
                let movieInfo: { title: string; image: string | null } = { title: 'Movie', image: null };
                if (comment.movieID) {
                  try {
                    const movieResponse = await filmzoneApi.getMovieById(comment.movieID);
                    const movieOk = (movieResponse as any).success === true || (movieResponse.errorCode >= 200 && movieResponse.errorCode < 300);
                    if (movieOk && movieResponse.data) {
                      movieInfo = {
                        title: movieResponse.data.title || 'Movie',
                        image: movieResponse.data.image || null,
                      };
                    }
                  } catch (err) {
                    console.warn('Failed to fetch movie for comment:', err);
                  }
                }
                return {
                  ...comment,
                  movie: comment.movie || movieInfo,
                };
              })
            );
          }

          // Load other stats from mock API (if needed)
          try {
            const { movieAppApi } = await import('../services/mock-api');
            const response = await (movieAppApi as any).getOverviewStats(authState.user.userID.toString());
            
            if (response.success && response.data) {
              setOverviewStats({
                ...response.data,
                latestComments: latestComments,
                commentsCount: latestComments.length > 0 ? commentsResponse.data?.length || 0 : (response.data.commentsCount || 0),
                watchedFilms: watchedFilms,
                filmsWatched: watchedFilms.length,
              });
            } else {
              // If mock API fails, still set comments and watched films
              setOverviewStats({
                latestComments: latestComments,
                commentsCount: latestComments.length > 0 ? commentsResponse.data?.length || 0 : 0,
                watchedFilms: watchedFilms,
                filmsWatched: watchedFilms.length,
              });
            }
          } catch (error) {
            // If mock API fails, still set comments and watched films
            setOverviewStats({
              latestComments: latestComments,
              commentsCount: latestComments.length > 0 ? commentsResponse.data?.length || 0 : 0,
              watchedFilms: watchedFilms,
              filmsWatched: watchedFilms.length,
            });
          }
        } catch (error) {
          console.error('Error loading overview stats:', error);
        } finally {
          setIsLoadingStats(false);
        }
      }
    };

    const loadBillingHistory = async () => {
      if ((activeTab === 'subscription' || activeTab === 'overview') && authState.user && authState.user.userID) {
        try {
          const response = await filmzoneApi.getPaymentOrdersByUser(authState.user.userID);
          const ok = (response as any).success === true || (response.errorCode >= 200 && response.errorCode < 300);
          if (ok && response.data) {
            // Backend có thể trả về 1 order object, hoặc list orders, hoặc list wrapper { errorCode, data }
            const rawList = Array.isArray(response.data) ? response.data : [response.data];
            const orders = rawList
              .map((x: any) => (x && typeof x === 'object' && 'data' in x ? x.data : x))
              .filter(Boolean);

            if (rawList.length) {
              console.log('Billing: sample raw keys:', Object.keys(rawList[0] || {}));
              console.log('Billing: sample raw:', JSON.stringify(rawList[0], null, 2));
            }
            if (orders.length) {
              console.log('Billing: normalized order keys:', Object.keys(orders[0] || {}));
              console.log('Billing: normalized order:', JSON.stringify(orders[0], null, 2));
            }
            // Enrich each order with plan name
            const enrichedOrders = await Promise.all(
              orders.map(async (order: any) => {
                let planName = 'N/A';
                let amount: number | null = null;
                let currency: string | null = null;

                // Many backends only store priceId on order -> use /api/price/{priceID} to get amount/currency + planID
                const priceId = order.priceID ?? order.priceId ?? order.PriceID ?? order.PriceId;
                // Prefer planID from order (as swagger). Fallback to other variants.
                let planId =
                  order.planID ??
                  order.planId ??
                  order.plan_id ??
                  order.PlanID ??
                  order.PlanId ??
                  order.plan ??
                  order.Plan;

                if (priceId) {
                  try {
                    const priceRes = await filmzoneApi.getPriceById(Number(priceId));
                    const priceOk =
                      (priceRes as any).success === true ||
                      (priceRes.errorCode >= 200 && priceRes.errorCode < 300);
                    if (priceOk && priceRes.data) {
                      amount = Number((priceRes.data as any).amount);
                      currency = (priceRes.data as any).currency || 'VND';
                      // Only use planID from price if order didn't provide it
                      planId = planId ?? (priceRes.data as any).planID ?? (priceRes.data as any).planId;
                    }
                  } catch (err) {
                    console.warn('Failed to fetch price for order:', err);
                  }
                }

                // Fallback: try amount/currency directly on order
                if (amount === null || Number.isNaN(amount)) {
                  const a = order.amount ?? order.Amount ?? order.totalAmount ?? order.TotalAmount;
                  amount = a !== undefined && a !== null ? Number(a) : null;
                }
                if (!currency) {
                  currency =
                    order.currency ?? order.Currency ?? order.currencyCode ?? order.CurrencyCode ?? 'VND';
                }

                if (planId !== undefined && planId !== null) {
                  try {
                    const planIdNum = Number(planId);
                    if (!Number.isFinite(planIdNum)) {
                      throw new Error(`Invalid planId: ${String(planId)}`);
                    }
                    const planRes = await filmzoneApi.getPlanById(planIdNum);
                    const planOk =
                      (planRes as any).success === true ||
                      (planRes.errorCode >= 200 && planRes.errorCode < 300);
                    if (planOk && planRes.data) {
                      planName = planRes.data.name || planRes.data.code || 'N/A';
                    }
                  } catch (err) {
                    console.warn('Failed to fetch plan for order:', err);
                  }
                }
                // Map fields from order response
                // Map fields (prefer exact swagger field names first)
                const provider =
                  order.provider ??
                  order.paymentProvider ??
                  order.PaymentProvider ??
                  order.payment_provider ??
                  'VNPay';
                const status =
                  order.status ??
                  order.orderStatus ??
                  order.Status ??
                  order.order_status ??
                  'N/A';
                const createdAt =
                  order.createdAt ??
                  order.createdDate ??
                  order.CreatedAt ??
                  order.created_at ??
                  null;
                const orderAmount =
                  amount !== null && !Number.isNaN(Number(amount))
                    ? Number(amount)
                    : (order.amount ?? order.Amount ?? order.totalAmount ?? order.TotalAmount ?? null);
                const orderCurrency = currency || (order.currency ?? order.Currency ?? order.currencyCode ?? order.CurrencyCode ?? 'VND');

                return {
                  billingID: order.orderID ?? order.orderId ?? order.id,
                  subscriptionPlan: planName,
                  amount: orderAmount === null ? null : Number(orderAmount),
                  currency: orderCurrency,
                  paymentMethod: provider,
                  status,
                  billingDate: createdAt || new Date().toISOString(),
                  transactionID: order.transactionID ?? order.transactionId ?? order.TransactionID ?? order.transaction_id ?? order.orderId ?? order.orderID ?? null,
                };
              })
            );
            setBillingHistory(enrichedOrders);
          } else {
            setBillingHistory([]);
          }
        } catch (error) {
          console.warn('Failed to load billing history:', error);
          setBillingHistory([]);
        }
      }
    };

    loadOverviewStats();
    loadBillingHistory();
    // Reset expand state when switching tabs
    if (activeTab !== 'overview') {
      setExpandComments(false);
    }
  }, [activeTab, authState.user]);

  // Refresh overview stats when switching to overview tab
  useEffect(() => {
    if (activeTab === 'overview' && authState.user) {
      refreshOverviewStats();
    }
  }, [activeTab]);

  // Refresh overview stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (activeTab === 'overview' && authState.user) {
        // Add a small delay to ensure data is updated
        setTimeout(() => {
          refreshOverviewStats();
        }, 100);
      }
    }, [activeTab, authState.user])
  );

  // Sync selectedPlan with current subscription
  useEffect(() => {
    if (authState.user?.subscription) {
      setSelectedPlan(authState.user.subscription.plan);
    } else {
      setSelectedPlan('starter');
    }
  }, [authState.user?.subscription]);

  const handleChangePassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsChangingPassword(true);
    try {
      await Haptics.selectionAsync();
      
      // Start password change process using /account/password/change/email/start
      const startResponse = await filmzoneApi.startPasswordChangeByEmail({ email: email.trim() });
      
      const isOk = (startResponse as any).success === true || (startResponse.errorCode >= 200 && startResponse.errorCode < 300);
      
      if (isOk) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Mở modal OTP
        setShowOtpModal(true);
        setOtpCode(['', '', '', '', '', '']);
        // Focus vào ô đầu tiên sau khi modal mở
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', startResponse.errorMessage || 'Failed to send verification email');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'An error occurred while sending verification email');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleVerifyOtpCode = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await Haptics.selectionAsync();
      
      // Verify OTP code using /account/password/change/email/verify
      const verifyResponse = await filmzoneApi.verifyEmailCode({
        email: email.trim(),
        code: code,
      });
      
      const isOk = (verifyResponse as any).success === true || (verifyResponse.errorCode >= 200 && verifyResponse.errorCode < 300);
                          
      if (isOk) {
                            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Lưu ticket từ response - data là string trực tiếp (ticket)
        const ticket = verifyResponse.data || '';
        if (ticket) {
          setPasswordChangeTicket(ticket);
          setShowOtpModal(false);
          setOtpCode(['', '', '', '', '', '']);
          setShowPasswordChangeModal(true);
          setOldPassword('');
                            setNewPassword('');
          setShowOldPassword(false);
          setShowNewPassword(false);
                          } else {
          Alert.alert('Error', 'Failed to get verification ticket');
                          }
                        } else {
                          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                          Alert.alert('Error', verifyResponse.errorMessage || 'Invalid verification code');
                        }
                      } catch (error) {
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'An error occurred while verifying code');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleOtpCodeChange = (index: number, value: string) => {
    // Chỉ cho phép số
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length > 1) {
      // Nếu paste nhiều số (từ autofill), chia vào các ô
      const digits = numericValue.split('').slice(0, 6);
      const newCode = [...otpCode];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
                    }
      });
      setOtpCode(newCode);
      
      // Focus vào ô tiếp theo sau ô cuối cùng được điền
      const nextIndex = Math.min(index + digits.length, 5);
      if (nextIndex < 6) {
        otpInputRefs.current[nextIndex]?.focus();
      } else {
        // Nếu đã điền đủ 6 số, blur input
        otpInputRefs.current[5]?.blur();
      }
      } else {
      const newCode = [...otpCode];
      newCode[index] = numericValue;
      setOtpCode(newCode);
      
      // Tự động focus sang ô tiếp theo nếu đã nhập số
      if (numericValue && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpCodeKeyPress = (index: number, key: string) => {
    // Xử lý backspace: xóa số hiện tại và focus về ô trước
    if (key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleCommitPasswordChange = async () => {
    if (!oldPassword.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (oldPassword.trim() === newPassword.trim()) {
      Alert.alert('Error', 'New password must be different from old password');
      return;
    }

    if (!passwordChangeTicket) {
      Alert.alert('Error', 'Missing verification ticket. Please start the process again.');
      return;
    }

    setIsCommittingPassword(true);
    try {
      await Haptics.selectionAsync();
      
      // Commit password change using /account/password/change/commit
      const commitResponse = await filmzoneApi.commitPasswordChange({
        ticket: passwordChangeTicket,
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
      });
      
      const isOk = (commitResponse as any).success === true || (commitResponse.errorCode >= 200 && commitResponse.errorCode < 300);
      
      if (isOk) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Success',
          'Password changed successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowPasswordChangeModal(false);
                setOldPassword('');
                setNewPassword('');
                setPasswordChangeTicket(null);
                setShowOldPassword(false);
                setShowNewPassword(false);
              }
            }
          ]
        );
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        // Hiển thị thông báo lỗi cụ thể
        let errorMessage = commitResponse.errorMessage || 'Failed to change password';
        if (commitResponse.errorCode === 408) {
          errorMessage = 'Request timeout. Please check your internet connection and try again.';
        }
        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Xử lý các loại lỗi khác nhau
      let errorMessage = 'An error occurred while changing password';
      if (error?.name === 'AbortError' || error?.message?.includes('Aborted')) {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsCommittingPassword(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to change your profile picture!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const newAvatarUri = result.assets[0].uri;
      setAvatar(newAvatarUri);

      // Gửi avatar mới lên backend qua /user/update/profile (multipart/form-data)
      try {
        const user = authState.user;
        if (!user || !user.userID) {
          Alert.alert('Error', 'Missing user info. Please sign in again.');
        } else {
          await Haptics.selectionAsync();

          await filmzoneApi.updateUserProfileAvatar({
            userID: user.userID,
            avatarUri: newAvatarUri,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
          } as any);
        }
      } catch (error) {
        console.warn('Failed to upload avatar to backend', error);
      }

      // Cập nhật avatar trong authState để sync toàn app
      updateUser({
        avatar: newAvatarUri,
        profilePicture: newAvatarUri,
      });
    }
  };

  const removeAvatar = () => {
    setAvatar('');
    // Update avatar in authState to sync across the app
    updateUser({
      avatar: '',
      profilePicture: ''
    });
  };

  // Notification handlers
  const handleTogglePushNotifications = async (enabled: boolean) => {
    try {
      await Haptics.selectionAsync();
      await togglePushNotifications(enabled);
      
      Alert.alert(
        enabled ? 'Notifications Enabled' : 'Notifications Disabled',
        enabled 
          ? 'You will now receive push notifications from FlixGo.' 
          : 'You will no longer receive push notifications.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating notifications.');
    }
  };

  const handleToggleEmailUpdates = async (enabled: boolean) => {
    try {
      await Haptics.selectionAsync();
      await toggleEmailUpdates(enabled);
      setEmailUpdates(enabled);
      
      Alert.alert(
        enabled ? 'Email Updates Enabled' : 'Email Updates Disabled',
        enabled 
          ? 'You will now receive email updates about new content and features.' 
          : 'You will no longer receive email updates.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating email settings.');
    }
  };

  const handleSendTestNotification = async () => {
    try {
      await Haptics.selectionAsync();
      await sendTestNotification();
      
      Alert.alert(
        'Test Notification Sent',
        'Check your notification panel to see the test notification!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const handleToggleMovieRecommendations = async (enabled: boolean) => {
    try {
      await Haptics.selectionAsync();
      await toggleMovieRecommendations(enabled);
    } catch (error) {
    }
  };

  const handleToggleNewContentAlerts = async (enabled: boolean) => {
    try {
      await Haptics.selectionAsync();
      await toggleNewContentAlerts(enabled);
    } catch (error) {
    }
  };

  const handleToggleSubscriptionReminders = async (enabled: boolean) => {
    try {
      await Haptics.selectionAsync();
      await toggleSubscriptionReminders(enabled);
    } catch (error) {
    }
  };

  return (
    <>
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentInsetAdjustmentBehavior="automatic">
      <ImageBackground source={{ uri: 'https://flixgo.volkovdesign.com/main/img/bg/section__bg.jpg' }} style={styles.hero}>
        <View style={styles.overlay} />
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.9 }]}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerRow}>
          {avatar ? (
            <ImageWithPlaceholder source={{ uri: avatar }} style={styles.avatar} showRedBorder={false} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{name?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
          )}
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerName}>{name || 'User'}</Text>
            <Text style={styles.headerMeta}>Member</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => { authSignOut(); router.replace('/'); }} style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}>
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </Pressable>
        </View>
      </ImageBackground>

      {/* Navigation tabs */}
      <View style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}>
        <Pressable onPress={() => setActiveTab('overview')} style={({ pressed }) => [styles.tab, activeTab === 'overview' && styles.tabActive, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive, { color: theme.colors.text }]}>Overview</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('settings')} style={({ pressed }) => [styles.tab, activeTab === 'settings' && styles.tabActive, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive, { color: theme.colors.text }]}>{t('profile.settings')}</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('subscription')} style={({ pressed }) => [styles.tab, activeTab === 'subscription' && styles.tabActive, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.tabText, activeTab === 'subscription' && styles.tabTextActive, { color: theme.colors.text }]}>Subscription</Text>
        </Pressable>
      </View>

      {/* Overview Content */}
      {activeTab === 'overview' && (
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          {!authState.user ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>Please login to view overview</Text>
            </View>
          ) : isLoadingStats ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
            </View>
          ) : (
            <>
              {/* Statistics Cards */}
              <View style={styles.statsGrid}>
                <View style={[styles.overviewStatCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.overviewStatTitle, { color: theme.colors.text }]}>Total Spent on Plans</Text>
                  <Text style={styles.overviewStatValue}>
                    {(() => {
                      const items = Array.isArray(billingHistory) ? billingHistory : [];
                      if (!items.length) return '0 VND';
                      // Calculate total from all billing items' amount
                      const total = items.reduce((sum, b) => {
                        const amount = b?.amount;
                        if (amount === null || amount === undefined) return sum;
                        const n = Number(amount);
                        return sum + (Number.isFinite(n) && !Number.isNaN(n) ? n : 0);
                      }, 0);
                      // Use currency from first item if available; otherwise default to VND
                      const currency = items.find((b: any) => b?.currency)?.currency || 'VND';
                      return `${total.toFixed(2)}`;
                    })()}
                  </Text>
                  <Text style={[styles.overviewStatSubtext, { color: theme.colors.textSecondary }]}>
                    Sum of all billing items
                  </Text>
                </View>
                
                <View style={[styles.overviewStatCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.overviewStatTitle, { color: theme.colors.text }]}>Films Watched</Text>
                  <Text style={styles.overviewStatFilmValue}>
                    {overviewStats?.filmsWatched !== undefined ? overviewStats.filmsWatched : (overviewStats?.watchedFilms?.length || 0)}
                  </Text>
                </View>
                
                <View style={[styles.overviewStatCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.overviewStatTitle, { color: theme.colors.text }]}>Comments</Text>
                  <Text style={styles.overviewStatValue}>
                    {overviewStats?.commentsCount !== undefined ? overviewStats.commentsCount : '---'}
                  </Text>
                </View>
              </View>

              {/* Films Watched List */}
              <View style={styles.overviewSection}>
                <Text style={[styles.overviewSectionTitle, { color: theme.colors.text }]}>Films Watched</Text>
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    This feature will be added in a later update.
                  </Text>
                </View>
                {/* 
                {overviewStats?.watchedFilms && overviewStats.watchedFilms.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {overviewStats.watchedFilms.map((film: any, index: number) => (
                      <Pressable
                        key={film.id || index}
                        onPress={() => {
                          const isSeries = film.isSeries || false;
                          router.push({
                            pathname: isSeries ? '/details/series/[id]' : '/details/movie/[id]',
                            params: {
                              id: film.id,
                              title: film.title,
                              cover: film.image,
                            }
                          } as any);
                        }}
                        style={({ pressed }) => [
                          styles.recentViewCard,
                          { backgroundColor: theme.colors.surface },
                          pressed && { opacity: 0.8 }
                        ]}
                      >
                        <ImageWithPlaceholder 
                          source={{ uri: film.image || 'https://via.placeholder.com/120x160/333/fff?text=Movie' }} 
                          style={styles.recentViewImage} 
                          showRedBorder={false} 
                        />
                        <Text style={[styles.recentViewTitle, { color: theme.colors.text }]} numberOfLines={2}>
                          {film.title}
                        </Text>
                        <Text style={[styles.recentViewDate, { color: theme.colors.textSecondary }]}>
                          {film.lastWatchedAt ? new Date(film.lastWatchedAt).toLocaleDateString() : ''}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No films watched yet</Text>
                  </View>
                )}
                */}
              </View>

              {/* Latest Comments */}
              <View style={styles.overviewSection}>
                <Text style={[styles.overviewSectionTitle, { color: theme.colors.text }]}>Latest Comments</Text>
                {overviewStats?.latestComments && overviewStats.latestComments.length > 0 ? (
                  <>
                    <View style={styles.commentsList}>
                      {(expandComments 
                        ? overviewStats.latestComments 
                        : overviewStats.latestComments.slice(0, 3)
                      ).map((comment: any, index: number) => {
                        return (
                        <View key={index} style={[styles.commentCard, { backgroundColor: theme.colors.surface }]}>
                          <View style={styles.commentContent}>
                            <ImageWithPlaceholder 
                              source={{ uri: comment.movie?.image || 'https://via.placeholder.com/60x90/333/fff?text=Movie' }}
                              style={styles.commentMovieImage}
                              showRedBorder={false}
                              errorText="?"
                            />
                            <View style={styles.commentTextContent}>
                              <View style={styles.commentHeader}>
                                <Text style={[styles.commentMovieTitle, { color: theme.colors.text }]}>
                                  {comment.movie?.title || 'Movie'}
                                </Text>
                                <Text style={[styles.commentDate, { color: theme.colors.textSecondary }]}>
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </Text>
                              </View>
                              <Text style={[styles.commentText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                                {comment.content}
                              </Text>
                            </View>
                          </View>
                        </View>
                        );
                      })}
                    </View>
                    {overviewStats.latestComments.length > 3 && (
                      <Pressable
                        style={({ pressed }) => [
                          styles.expandButton,
                          { backgroundColor: theme.colors.surface },
                          pressed && { opacity: 0.8 }
                        ]}
                        onPress={() => setExpandComments(!expandComments)}
                      >
                        <Text style={[styles.expandButtonText, { color: theme.colors.primary || '#e50914' }]}>
                          {expandComments ? 'Show Less' : `Show All (${overviewStats.latestComments.length})`}
                        </Text>
                      </Pressable>
                    )}
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No comments yet</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      )}

      {/* Settings Content */}
      {activeTab === 'settings' && (
        <>
          {/* Profile Picture Section */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.profile_picture')}</Text>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                  {avatar ? (
                    <ImageWithPlaceholder source={{ uri: avatar }} style={styles.settingsAvatar} showRedBorder={false} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { width: 80, height: 80, borderRadius: 40 }]}>
                      <Text style={[styles.avatarInitial, { fontSize: 32 }]}>{name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                    </View>
                  )}
              </View>
              <View style={styles.avatarActions}>
                <Pressable onPress={pickImage} style={({ pressed }) => [styles.avatarBtn, pressed && { opacity: 0.9 }]}>
                  <Text style={styles.avatarBtnText}>Change Photo</Text>
                </Pressable>
                <Pressable onPress={removeAvatar} style={({ pressed }) => [styles.avatarBtn, styles.avatarBtnDanger, pressed && { opacity: 0.9 }]}>
                  <Text style={[styles.avatarBtnText, styles.avatarBtnTextDanger]}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Account Information */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account Information</Text>
            <TextInput
              placeholder="Email"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
              keyboardType="email-address"
            />
            <Pressable 
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }, isChangingPassword && styles.disabledButton]}
              onPress={handleChangePassword}
              disabled={isChangingPassword}
            >
              <Text style={styles.primaryBtnText}>
                {isChangingPassword ? 'Sending...' : 'Confirm Change Password'}
              </Text>
            </Pressable>
          </View>

          {/* Preferences */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferences</Text>
            
            {/* Push Notifications */}
            <View style={[styles.preferenceRow, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.preferenceContent}>
                <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>Push Notifications</Text>
                <Text style={[styles.preferenceSubtext, { color: theme.colors.textSecondary }]}>
                  Receive notifications about new content and updates
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleTogglePushNotifications}
                trackColor={{ false: '#767577', true: '#e50914' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
                disabled={false}
              />
            </View>

            {/* Test Notification Button */}
            {notificationsEnabled && (
              <Pressable 
                style={({ pressed }) => [styles.testNotificationBtn, pressed && { opacity: 0.9 }]}
                onPress={handleSendTestNotification}
                disabled={false}
              >
                <Text style={styles.testNotificationBtnText}>Send Test Notification</Text>
              </Pressable>
            )}

            {/* Email Updates */}
            <View style={[styles.preferenceRow, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.preferenceContent}>
                <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>Email Updates</Text>
                <Text style={[styles.preferenceSubtext, { color: theme.colors.textSecondary }]}>
                  Get notified via email about new features
                </Text>
              </View>
              <Switch
                value={notificationSettings.emailUpdates}
                onValueChange={handleToggleEmailUpdates}
                trackColor={{ false: '#767577', true: '#e50914' }}
                thumbColor={notificationSettings.emailUpdates ? '#fff' : '#f4f3f4'}
                disabled={false}
              />
            </View>

            {/* Movie Recommendations */}
            <View style={[styles.preferenceRow, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.preferenceContent}>
                <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>Movie Recommendations</Text>
                <Text style={[styles.preferenceSubtext, { color: theme.colors.textSecondary }]}>
                  Get notified about personalized movie suggestions
                </Text>
              </View>
              <Switch
                value={notificationSettings.movieRecommendations}
                onValueChange={handleToggleMovieRecommendations}
                trackColor={{ false: '#767577', true: '#e50914' }}
                thumbColor={notificationSettings.movieRecommendations ? '#fff' : '#f4f3f4'}
                disabled={!notificationsEnabled}
              />
            </View>

            {/* New Content Alerts */}
            <View style={[styles.preferenceRow, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.preferenceContent}>
                <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>New Content Alerts</Text>
                <Text style={[styles.preferenceSubtext, { color: theme.colors.textSecondary }]}>
                  Notifications when new movies or series are added
                </Text>
              </View>
              <Switch
                value={notificationSettings.newContentAlerts}
                onValueChange={handleToggleNewContentAlerts}
                trackColor={{ false: '#767577', true: '#e50914' }}
                thumbColor={notificationSettings.newContentAlerts ? '#fff' : '#f4f3f4'}
                disabled={!notificationsEnabled}
              />
            </View>

            {/* Subscription Reminders */}
            <View style={[styles.preferenceRow, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.preferenceContent}>
                <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>Subscription Reminders</Text>
                <Text style={[styles.preferenceSubtext, { color: theme.colors.textSecondary }]}>
                  Reminders about subscription expiry and renewals
                </Text>
              </View>
              <Switch
                value={notificationSettings.subscriptionReminders}
                onValueChange={handleToggleSubscriptionReminders}
                trackColor={{ false: '#767577', true: '#e50914' }}
                thumbColor={notificationSettings.subscriptionReminders ? '#fff' : '#f4f3f4'}
                disabled={!notificationsEnabled}
              />
            </View>

            {/* Dark Mode */}
            <View style={[styles.preferenceRow, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.preferenceContent}>
                <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>Dark Mode</Text>
                <Text style={[styles.preferenceSubtext, { color: theme.colors.textSecondary }]}>
                  Switch between light and dark themes
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: '#e50914' }}
                thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
              />
            </View>

            {/* Error Display */}
          </View>

          {/* Danger Zone */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Danger Zone</Text>
            <Pressable style={({ pressed }) => [styles.dangerBtn, pressed && { opacity: 0.9 }]}>
              <Text style={styles.dangerBtnText}>Delete Account</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Subscription Content */}
      {activeTab === 'subscription' && (
        <>
          {/* Current plan */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current plan</Text>
            {plansLoading ? (
              <View style={[styles.planCard, styles.planActive, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <ActivityIndicator color="#e50914" size="small" />
                <Text style={styles.planTitle}>Loading...</Text>
              </View>
            ) : (
              (() => {
                const sub: any = fetchedSubscription || null;
                const hasCurrentPlan = !!sub && !!currentPlan;

                if (!hasCurrentPlan) {
                  return (
                    <View style={[styles.planCard, styles.planActive]}>
                      <Text style={styles.planTitle}>No active subscription</Text>
                      <Text style={styles.planStatus}>Inactive</Text>
                    </View>
                  );
                }

                const planTitle =
                  currentPlan?.name ||
                  currentPlan?.code ||
                  'Current Plan';

                // Expires: đọc trực tiếp từ subscription.currentPeriodEnd (từ API)
                let expiryText: string | null = null;
                if (sub?.currentPeriodEnd) {
                  const d = new Date(sub.currentPeriodEnd);
                  if (!isNaN(d.getTime())) {
                    expiryText = d.toLocaleDateString();
                  }
                }

                return (
                  <View style={[styles.planCard, styles.planActive]}>
                    <Text style={styles.planTitle}>{planTitle}</Text>
                    <Text style={styles.planStatus}>
                      {sub?.status === 'active' ? 'Active' : 'Inactive'}
                    </Text>
              
                    {expiryText ? (
                      <Text style={styles.planExpiry}>
                        Expires: {expiryText}
                      </Text>
                    ) : null}
                  </View>
                );
              })()
            )}
          </View>

          {/* Available plans */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available plans</Text>
            <Text style={styles.sectionSubtitle}>Choose your subscription plan:</Text>
            {plansLoading ? (
              <View style={[styles.planCard, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <ActivityIndicator color="#e50914" size="small" />
                <Text style={styles.planTitle}>Loading...</Text>
              </View>
            ) : plans.length > 0 ? (
              <View style={styles.plansGrid}>
                {plans.map((p: any, idx: number) => {
                  const pid = String(getPlanId(p) ?? idx);
                  const selected = selectedPlan === pid;
                  return (
                    <Pressable
                      key={pid}
                      onPress={() => setSelectedPlan(pid)}
                      style={({ pressed }) => [styles.planCard, selected && styles.planSelected, pressed && { opacity: 0.9 }]}
                    >
                      <Text style={styles.planTitle}>{p.name || p.code || `Plan ${pid}`}</Text>
                      <Text style={styles.planPrice}>{planPrices[pid] || 'N/A'}</Text>
                      {p.description ? <Text style={styles.planDuration}>{p.description}</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary || '#999' }]}>No active plans available.</Text>
            )}
            
            {/* Action button for all plans */}
            <Pressable 
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
              onPress={async () => {
                try {
                  await Haptics.selectionAsync();
                  if (!authState.isAuthenticated) {
                    router.push('/auth/signin');
                    return;
                  }
                  router.push('/payment');
                } catch (error) {
                }
              }}
            >
              <Text style={styles.primaryBtnText}>
                {selectedPlan ? `Continue with plan #${selectedPlan}` : 'Select a plan'}
              </Text>
            </Pressable>
          </View>

          {/* Billing History */}
          <View style={styles.section}>
            <Pressable 
              style={styles.billingHistoryButton}
              onPress={() => setShowBillingHistory(!showBillingHistory)}
            >
              <Text style={styles.billingHistoryButtonText}>
                {showBillingHistory ? 'Hide' : 'Show'} Billing History ({billingHistory.length})
              </Text>
              <Text style={styles.billingHistoryButtonIcon}>
                {showBillingHistory ? '▲' : '▼'}
              </Text>
            </Pressable>
            
            {showBillingHistory && (
              <ScrollView 
                style={styles.billingHistoryContainer}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {billingHistory.length > 0 ? (
                  billingHistory.map((billing, index) => (
                    <View key={billing.billingID || index} style={styles.billingItem}>
                      <View style={styles.billingHeader}>
                        <Text style={styles.billingPlan}>{billing.subscriptionPlan.toUpperCase()}</Text>
                        <Text style={styles.billingAmount}>
                          {billing.amount === null || billing.amount === undefined || Number.isNaN(Number(billing.amount))
                            ? 'N/A'
                            : Number(billing.amount) === 0
                              ? 'Free'
                              : `${Number(billing.amount)} ${billing.currency || 'VND'}`}
                        </Text>
                      </View>
                      <Text style={styles.billingMethod}>Payment Method: {billing.paymentMethod}</Text>
                      <Text style={styles.billingStatus}>Status: {billing.status}</Text>
                      <Text style={styles.billingDate}>
                        {billing.billingDate ? new Date(billing.billingDate).toLocaleDateString() : 'N/A'}
                      </Text>
                      {billing.transactionID && (
                        <Text style={styles.billingTransaction}>
                          Transaction ID: {billing.transactionID}
                        </Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noBillingHistory}>No billing history found</Text>
                )}
              </ScrollView>
            )}
          </View>

          {/* Cancel subscription */}
          <View style={styles.section}>
            <Pressable 
              style={({ pressed }) => [styles.dangerBtn, pressed && { opacity: 0.9 }]}
              onPress={() => {
                Alert.alert(
                  'Cancel Subscription',
                  'Are you sure you want to cancel your subscription? Paid plans will be cancelled and you will return to the Starter plan.',
                  [
                    { text: 'Keep Subscription', style: 'cancel' },
                    { 
                      text: 'Cancel Subscription', 
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          const userId = authState.user?.userID;
                          if (!userId) {
                            Alert.alert('Error', 'Missing user info. Please sign in again.');
                            return;
                          }

                          // Call cancel subscription API
                          const cancelRes = await filmzoneApi.cancelSubscription(userId);
                          const cancelOk = (cancelRes as any).success === true || (cancelRes.errorCode >= 200 && cancelRes.errorCode < 300);
                          if (!cancelOk) {
                            Alert.alert('Error', cancelRes.errorMessage || 'Failed to cancel subscription.');
                            return;
                          }

                          // Reload latest subscription
                          try {
                            const subsRes = await filmzoneApi.getSubscriptionsByUser(userId);
                            const subsOk = (subsRes as any).success === true || (subsRes.errorCode >= 200 && subsRes.errorCode < 300);
                            if (subsOk && subsRes.data) {
                              const subsArr = Array.isArray(subsRes.data) ? subsRes.data : [subsRes.data];
                              if (subsArr.length > 0) {
                                const latest = subsArr
                                  .filter((s: any) => s)
                                  .sort((a: any, b: any) => {
                                    const aId = Number(a.subscriptionID ?? a.subscriptionId ?? 0);
                                    const bId = Number(b.subscriptionID ?? b.subscriptionId ?? 0);
                                    return bId - aId;
                                  })[0];
                                updateUser({ subscription: latest } as any);
                              } else {
                                updateUser({ subscription: null } as any);
                              }
                            } else {
                              updateUser({ subscription: null } as any);
                            }
                          } catch {
                            updateUser({ subscription: null } as any);
                          }

                          // Reset current plan selection (fallback starter/free if available)
                          const freePrice = priceList.find((p: any) => Number(p.amount) === 0);
                          const freePlan = freePrice
                            ? plans.find((pl: any) => String(getPlanId(pl)) === String(freePrice.planID ?? freePrice.planId))
                            : undefined;
                          if (freePlan) {
                            setCurrentPlan(freePlan);
                            setSelectedPlan(String(getPlanId(freePlan)));
                          } else {
                            setCurrentPlan(null);
                            setSelectedPlan('');
                          }

                          Alert.alert(
                            'Subscription Cancelled',
                            'Your subscription has been cancelled.'
                          );
                        } catch (e) {
                          Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.dangerBtnText}>Cancel Subscription</Text>
            </Pressable>
          </View>

        </>
      )}

      {/* Overview Content */}
      
    </ScrollView>

    {/* OTP Verification Modal */}
    <Modal
      visible={showOtpModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowOtpModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Nhập mã xác thực</Text>
          <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
            Vui lòng nhập mã 6 số đã được gửi đến email của bạn
          </Text>
          
          <View style={styles.otpInputContainer}>
            {otpCode.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  otpInputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: digit ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                value={digit}
                onChangeText={(value) => handleOtpCodeChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleOtpCodeKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={index === 0 ? 6 : 1}
                selectTextOnFocus
                textAlign="center"
                textContentType={index === 0 ? "oneTimeCode" : "none"}
                autoComplete={index === 0 ? "sms-otp" : "off"}
              />
            ))}
          </View>

          <View style={styles.modalButtonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.modalCancelButton,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => {
                setShowOtpModal(false);
                setOtpCode(['', '', '', '', '', '']);
              }}
            >
              <Text style={[styles.modalCancelButtonText, { color: theme.colors.text }]}>Hủy</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.modalConfirmButton,
                { backgroundColor: theme.colors.primary },
                pressed && { opacity: 0.9 },
                isVerifyingOtp && styles.disabledButton,
              ]}
              onPress={handleVerifyOtpCode}
              disabled={isVerifyingOtp}
            >
              {isVerifyingOtp ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalConfirmButtonText}>Xác nhận</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>

    {/* Password Change Modal */}
    <Modal
      visible={showPasswordChangeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPasswordChangeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Đổi mật khẩu</Text>
          <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
            Vui lòng nhập mật khẩu cũ và mật khẩu mới
          </Text>
          
          <View style={styles.passwordInputContainer}>
            <TextInput
              placeholder="Mật khẩu cũ"
              placeholderTextColor={theme.colors.textSecondary}
              value={oldPassword}
              onChangeText={setOldPassword}
              style={[
                styles.passwordInput,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              secureTextEntry={!showOldPassword}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowOldPassword(!showOldPassword)}
              style={({ pressed }) => [
                styles.passwordToggleButton,
                pressed && styles.passwordTogglePressed
              ]}
              hitSlop={8}
            >
              <Image 
                source={require('../assets/icons/eye-icon.png')}
                style={[
                  styles.passwordToggleIcon,
                  { tintColor: showOldPassword ? theme.colors.primary : theme.colors.textSecondary }
                ]}
              />
            </Pressable>
          </View>

          <View style={styles.passwordInputContainer}>
            <TextInput
              placeholder="Mật khẩu mới"
              placeholderTextColor={theme.colors.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              style={[
                styles.passwordInput,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={({ pressed }) => [
                styles.passwordToggleButton,
                pressed && styles.passwordTogglePressed
              ]}
              hitSlop={8}
            >
              <Image 
                source={require('../assets/icons/eye-icon.png')}
                style={[
                  styles.passwordToggleIcon,
                  { tintColor: showNewPassword ? theme.colors.primary : theme.colors.textSecondary }
                ]}
              />
            </Pressable>
          </View>

          <View style={styles.modalButtonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.modalCancelButton,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => {
                setShowPasswordChangeModal(false);
                setOldPassword('');
                setNewPassword('');
                setPasswordChangeTicket(null);
                setShowOldPassword(false);
                setShowNewPassword(false);
              }}
            >
              <Text style={[styles.modalCancelButtonText, { color: theme.colors.text }]}>Hủy</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.modalConfirmButton,
                { backgroundColor: theme.colors.primary },
                pressed && { opacity: 0.9 },
                isCommittingPassword && styles.disabledButton,
              ]}
              onPress={handleCommitPasswordChange}
              disabled={isCommittingPassword}
            >
              {isCommittingPassword ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalConfirmButtonText}>Confirm</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2b2b31' },
  hero: { height: 180, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  backBtn: { position: 'absolute', top: 12, left: 12, width: 36, height: 36, borderWidth: 2, borderColor: '#e50914', borderRadius: 8, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  backArrow: { color: '#e50914', fontSize: 20, fontWeight: '800' },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#14141b' },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#e50914', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#fff', fontSize: 24, fontWeight: '700' },
  headerName: { color: '#fff', fontWeight: '800', fontSize: 18 },
  headerMeta: { color: '#c7c7cc', marginTop: 4 },

  section: { margin: 12, backgroundColor: '#121219', borderRadius: 12, padding: 12 },
  sectionTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 8 },
  sectionSubtitle: { color: '#8e8e93', fontSize: 12, marginBottom: 12 },
  input: { backgroundColor: '#14141b', borderRadius: 10, paddingHorizontal: 12, height: 44, color: '#fff', marginBottom: 10, borderWidth: 1, borderColor: '#e50914' },
  primaryBtn: { backgroundColor: '#e50914', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  logoutBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e50914', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  logoutText: { color: '#e50914', fontWeight: '700' },

  cardRow: { flexDirection: 'row' },
  card: { flex: 1, backgroundColor: '#14141b', borderRadius: 10, padding: 12, marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
  cardSelected: { borderColor: '#e50914' },
  cardTitle: { color: '#fff', fontWeight: '700' },
  cardText: { color: '#c7c7cc', marginTop: 4 },

  activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  activityText: { color: '#c7c7cc' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#e50914', marginRight: 8 },

  dangerBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e50914', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  dangerBtnText: { color: '#e50914', fontWeight: '700' },
  thumbRow: { flexDirection: 'row', flexWrap: 'wrap' },
  thumbCard: { width: '31%', marginRight: '3.5%', marginBottom: 10 },
  thumbImg: { width: '100%', aspectRatio: 2/3, borderRadius: 10 },
  thumbTitle: { color: '#fff', fontSize: 12, marginTop: 6 },
  tabBar: { flexDirection: 'row', backgroundColor: '#000', marginHorizontal: 12, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#e50914' },
  tabText: { color: '#fff', fontWeight: '700' },
  tabTextActive: { color: '#fff' },

  // Settings styles
  avatarSection: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { marginRight: 16 },
  settingsAvatar: { width: 80, height: 80, borderRadius: 40 },
  avatarActions: { flex: 1 },
  avatarBtn: { backgroundColor: '#e50914', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8 },
  avatarBtnDanger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e50914' },
  avatarBtnText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  avatarBtnTextDanger: { color: '#e50914' },
  preferenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  preferenceContent: { flex: 1, marginRight: 12 },
  preferenceLabel: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 2 },
  preferenceSubtext: { color: '#8e8e93', fontSize: 12, lineHeight: 16 },
  testNotificationBtn: { backgroundColor: '#e50914', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginVertical: 8, alignItems: 'center' },
  testNotificationBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  errorContainer: { backgroundColor: 'rgba(255, 0, 0, 0.1)', padding: 12, borderRadius: 8, marginTop: 8 },
  errorText: { color: '#ff4444', fontSize: 12, textAlign: 'center' },

  // Subscription styles
  planCard: { backgroundColor: '#14141b', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 2, borderColor: '#1c1c24', alignItems: 'center' },
  planActive: { borderColor: '#e50914', backgroundColor: 'rgba(229, 9, 20, 0.12)' },
  planSelected: { borderColor: '#e50914' },
  planTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  planPrice: { color: '#ffd166', fontWeight: '800', fontSize: 20, marginTop: 4, fontFamily: 'SpaceMono-Regular' },
  planDuration: { color: '#8e8e93', fontSize: 12, marginTop: 2 },
  planStatus: { color: '#c7c7cc', marginTop: 4 },
  planExpiry: { color: '#8e8e93', marginTop: 2, fontSize: 12 },
  planFeatures: { color: '#c7c7cc', marginTop: 4, fontSize: 12 },
  planDescription: { color: '#c7c7cc', marginTop: 6, fontSize: 12, lineHeight: 16 },
  plansGrid: { flexDirection: 'column' },
  
  // Additional styles for new features
  disabledButton: { opacity: 0.6 },
  secondaryBtn: { backgroundColor: 'transparent', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#e50914' },
  secondaryBtnText: { color: '#e50914', fontSize: 16, fontWeight: '600' },
  paymentBtn: { backgroundColor: '#28a745', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  paymentBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  // Overview styles
  content: { flex: 1 },
  loadingContainer: { padding: 20, alignItems: 'center' },
  loadingText: { fontSize: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  overviewStatCard: { flex: 1, minWidth: '30%', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  overviewStatTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  overviewStatValue: { fontSize: 20, fontWeight: '700', color: '#e50914' },
  overviewStatFilmValue: { fontSize: 40, fontWeight: '700', color: '#e50914' },
  overviewStatSubtext: { fontSize: 12, fontWeight: '500', marginTop: 4, textAlign: 'center' },
  overviewSection: { paddingHorizontal: 16, paddingVertical: 16 },
  overviewSectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  emptyState: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  
  // Recent Views styles
  recentViewCard: { width: 120, marginRight: 12, borderRadius: 8, padding: 8 },
  recentViewImage: { width: '100%', height: 80, borderRadius: 6, marginBottom: 8 },
  recentViewTitle: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  recentViewDate: { fontSize: 10 },
  
  // Comments styles - With movie images
  commentsList: { gap: 8 },
  commentCard: { 
    padding: 12, 
    borderRadius: 8, 
    backgroundColor: '#1a1a1f',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)'
  },
  expandButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e50914',
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  commentMovieImage: {
    width: 50,
    height: 70,
    borderRadius: 6,
    backgroundColor: '#333'
  },
  commentTextContent: {
    flex: 1
  },
  commentHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  commentMovieTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#e50914',
    flex: 1
  },
  commentDate: { 
    fontSize: 11, 
    color: '#8e8e93'
  },
  commentText: { 
    fontSize: 13, 
    lineHeight: 18, 
    color: '#c7c7cc'
  },
  
  // Billing History Styles
  billingHistoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1c1c23',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  billingHistoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  billingHistoryButtonIcon: {
    color: '#e50914',
    fontSize: 16,
    fontWeight: 'bold',
  },
  billingHistoryContainer: {
    marginTop: 8,
    maxHeight: 600, // Enough for ~5 items (each item ~110-120px with padding/margin)
  },
  billingItem: {
    backgroundColor: '#1c1c23',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  billingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billingPlan: {
    color: '#e50914',
    fontSize: 16,
    fontWeight: 'bold',
  },
  billingAmount: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  billingMethod: {
    color: '#c7c7cc',
    fontSize: 14,
    marginBottom: 4,
  },
  billingStatus: {
    color: '#c7c7cc',
    fontSize: 14,
    marginBottom: 4,
  },
  billingDate: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  billingTransaction: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  noBillingHistory: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  
  // OTP Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
  },
  passwordToggleButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 50,
    zIndex: 1,
  },
  passwordTogglePressed: {
    opacity: 0.7,
  },
  passwordToggleIcon: {
    width: 20,
    height: 20,
  },
});


