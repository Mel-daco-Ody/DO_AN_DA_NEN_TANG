import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation data
const translations = {
  en: {
    // Header
    'header.search': 'Search',
    'header.signin': 'sign in',
    'header.menu': 'Menu',
    'header.language': 'Language',
    
    // Home Screen
    'home.watch_now': 'Watch now',
    'home.recently_updated': 'Recently Updated',
    'home.new_items': 'New Items',
    'home.all_content': 'All Content',
    'home.now_watching': 'Now Watching',
    'home.select_plan': 'Select Your Plan',
    'home.your_current_plan': 'Your Current Plan',
    'home.our_partners': 'Our Partners',
    'home.partners_description': 'We strive for long-term cooperation with our partners. Become a partner.',
    'home.expand': 'Expand',
    'home.collapse': 'Collapse',
    'home.upgrade_premium': 'Upgrade to Premium for unlimited access to all content!',
    'home.upgrade_now': 'Upgrade Now',
    
    // Plans
    'plan.starter': 'Starter',
    'plan.premium': 'Premium',
    'plan.cinematic': 'Cinematic',
    'plan.choose_plan': 'Choose plan',
    'plan.manage_plan': 'Manage plan',
    'plan.current_plan': 'Current Plan',
    'plan.free': 'Free',
    
    // Search
    'search.title': 'Search Movies & TV Shows',
    'search.placeholder': 'Search for movies, TV shows...',
    'search.no_results': 'No results found for',
    'search.try_different': 'Try searching with different keywords',
    'search.popular_searches': 'Popular Searches',
    'search.filter_description': 'Choose a genre to search for movies',
    
        // Filter
        'filter.options': 'Filter Options',
        'filter.genre': 'Genre',
        'filter.year': 'Year',
        'filter.studio': 'Studio',
        'filter.apply': 'Apply',
        'filter.reset': 'Reset',
        'filter.active_filters': 'Active Filters',
        'filter.signin_required_title': 'Sign In Required',
        'filter.signin_required_message': 'Please sign in to use the filter feature',
    
    // Common
    'common.movie': 'Movie',
    'common.tv_show': 'TV Show',
    'common.hd': 'HD',
    'common.cancel': 'Cancel',
    'common.signin': 'Sign In',
    'common.ultra_hd': 'Ultra HD',
    'common.full_hd': 'Full HD',
    'common.resolution': 'Resolution',
    'common.availability': 'Availability',
    'common.support': 'Support',
    'common.desktop_only': 'Desktop Only',
    'common.tv_desktop': 'TV & Desktop',
    'common.any_device': 'Any Device',
    'common.limited_support': 'Limited Support',
    'common.support_24_7': '24/7 Support',
    
    // Details Pages
    'details.introduction': 'Introduction',
    'details.episodes': 'Episodes',
    'details.rating': 'Rating',
    'details.comments': 'Comments',
    'details.release_year': 'Release Year',
    'details.duration': 'Duration',
    'details.country': 'Country',
    'details.genre': 'Genre',
    'details.actors': 'Actors',
    'details.seasons': 'Seasons',
    'details.episode': 'Episode',
    'details.continue_watching': 'Continue Watching',
    'details.no_episodes': 'No episodes available',
    'details.episodes_coming_soon': 'Episodes coming soon',
    'details.write_comment': 'Write your comment...',
    'details.post_comment': 'Post Comment',
    'details.like': 'Like',
    'details.unlike': 'Unlike',
    'details.save': 'Save',
    'details.unsave': 'Unsave',
    'details.play': 'Play',
    'details.watch_now': 'Watch Now',
    'details.advertisement': 'Advertisement',
    'common.lifetime_availability': 'Lifetime Availability',
    'common.limited_availability': 'Limited Availability',
    'common.days': 'days',
    'common.month': 'Month',
    'common.months': 'Months',
    
    // Profile Page
    'profile.settings': 'Settings',
    'profile.logout': 'Logout',
    'profile.profile_picture': 'Profile Picture',
    'profile.update_profile': 'Update Profile',
    'profile.updating': 'Updating...',
    'profile.pay_now': 'Pay Now',
    'profile.payment': 'Payment',
    'profile.error': 'Error',
    'profile.success': 'Success',
    'profile.profile_updated': 'Profile updated successfully',
    'profile.payment_gateway': 'Redirecting to payment gateway...',
    'profile.payment_failed': 'Failed to create payment',
    'profile.payment_unavailable': 'Payment service unavailable',
    
    // Menu
    'menu.actor': 'Actor',
    'menu.about_us': 'About Us',
    'menu.help_center': 'Help Center',
    'menu.contacts': 'Contacts',
    'menu.privacy_policy': 'Privacy Policy',
    
    // Language options
    'language.english': 'English',
    'language.vietnamese': 'Vietnamese',
    
    // MovieBox Screen
    'moviebox.title': 'MovieBox',
    'moviebox.subtitle': 'movies saved',
    'moviebox.sort_by': 'Sort by:',
    'moviebox.sort_date': 'Date Added',
    'moviebox.sort_title': 'Movie Title',
    'moviebox.sort_rating': 'Rating',
    'moviebox.episodes': 'episodes',
    'moviebox.season': 'Season',
    'moviebox.remove_from_box': 'Remove from MovieBox',
    'moviebox.add_to_box': 'Add to MovieBox',
    'moviebox.empty_title': 'Your MovieBox is empty',
    'moviebox.empty_subtitle': 'Start building your collection by saving movies and TV shows',
    'moviebox.browse_movies': 'Browse Movies',
    'moviebox.login_required_title': 'Login Required',
    'moviebox.login_required_subtitle': 'Please sign in to access your saved movies',
    'moviebox.sign_in': 'Sign In',
    'moviebox.network_error_title': 'Connection Error',
    'moviebox.network_error_subtitle': 'Please check your internet connection and try again',
    'moviebox.server_error_title': 'Server Error',
    'moviebox.server_error_subtitle': 'Something went wrong on our end. Please try again',
    'moviebox.retry': 'Retry',
    'moviebox.loading': 'Loading your movies...',
  },
  vi: {
    // Header
    'header.search': 'Tìm kiếm',
    'header.signin': 'đăng nhập',
    'header.menu': 'Menu',
    'header.language': 'Ngôn ngữ',
    
    // Home Screen
    'home.watch_now': 'Xem ngay',
    'home.recently_updated': 'Cập nhật gần đây',
    'home.new_items': 'Nội dung mới',
    'home.all_content': 'Tất cả nội dung',
    'home.now_watching': 'Đang xem',
    'home.select_plan': 'Chọn gói của bạn',
    'home.your_current_plan': 'Gói hiện tại của bạn',
    'home.our_partners': 'Đối tác của chúng tôi',
    'home.partners_description': 'Chúng tôi phấn đấu hợp tác lâu dài với các đối tác. Trở thành đối tác.',
    'home.expand': 'Mở rộng',
    'home.collapse': 'Thu gọn',
    'home.upgrade_premium': 'Nâng cấp lên Premium để truy cập không giới hạn tất cả nội dung!',
    'home.upgrade_now': 'Nâng cấp ngay',
    
    // Plans
    'plan.starter': 'Cơ bản',
    'plan.premium': 'Cao cấp',
    'plan.cinematic': 'Điện ảnh',
    'plan.choose_plan': 'Chọn gói',
    'plan.manage_plan': 'Quản lý gói',
    'plan.current_plan': 'Gói hiện tại',
    'plan.free': 'Miễn phí',
    
    // Search
    'search.title': 'Tìm kiếm phim & TV show',
    'search.placeholder': 'Tìm kiếm phim, TV show...',
    'search.no_results': 'Không tìm thấy kết quả cho',
    'search.try_different': 'Thử tìm kiếm với từ khóa khác',
    'search.popular_searches': 'Tìm kiếm phổ biến',
    'search.filter_description': 'Chọn thể loại để tìm kiếm phim',
    
        // Filter
        'filter.options': 'Tùy chọn lọc',
        'filter.genre': 'Thể loại',
        'filter.year': 'Năm',
        'filter.studio': 'Studio',
        'filter.apply': 'Áp dụng',
        'filter.reset': 'Đặt lại',
        'filter.active_filters': 'Bộ lọc đang hoạt động',
        'filter.signin_required_title': 'Yêu cầu đăng nhập',
        'filter.signin_required_message': 'Vui lòng đăng nhập để sử dụng tính năng lọc',
    
    // Common
    'common.movie': 'Phim',
    'common.tv_show': 'TV Show',
    'common.hd': 'HD',
    'common.cancel': 'Hủy',
    'common.signin': 'Đăng nhập',
    'common.ultra_hd': 'Ultra HD',
    'common.full_hd': 'Full HD',
    'common.resolution': 'Độ phân giải',
    'common.availability': 'Tính khả dụng',
    'common.support': 'Hỗ trợ',
    'common.desktop_only': 'Chỉ máy tính',
    'common.tv_desktop': 'TV & Máy tính',
    'common.any_device': 'Mọi thiết bị',
    'common.limited_support': 'Hỗ trợ hạn chế',
    'common.support_24_7': 'Hỗ trợ 24/7',
    'common.lifetime_availability': 'Truy cập trọn đời',
    'common.limited_availability': 'Truy cập hạn chế',
    'common.days': 'ngày',
    'common.month': 'Tháng',
    'common.months': 'Tháng',
    
    // Profile Page
    'profile.settings': 'Cài đặt',
    'profile.logout': 'Đăng xuất',
    'profile.profile_picture': 'Ảnh đại diện',
    'profile.update_profile': 'Cập nhật hồ sơ',
    'profile.updating': 'Đang cập nhật...',
    'profile.pay_now': 'Thanh toán ngay',
    'profile.payment': 'Thanh toán',
    'profile.error': 'Lỗi',
    'profile.success': 'Thành công',
    'profile.profile_updated': 'Cập nhật hồ sơ thành công',
    'profile.payment_gateway': 'Đang chuyển hướng đến cổng thanh toán...',
    'profile.payment_failed': 'Tạo thanh toán thất bại',
    'profile.payment_unavailable': 'Dịch vụ thanh toán không khả dụng',
    
    // Details Pages
    'details.introduction': 'Giới thiệu',
    'details.episodes': 'Danh sách tập',
    'details.rating': 'Đánh giá',
    'details.comments': 'Bình luận',
    'details.release_year': 'Năm phát hành',
    'details.duration': 'Thời lượng',
    'details.country': 'Quốc gia',
    'details.genre': 'Thể loại',
    'details.actors': 'Diễn viên',
    'details.seasons': 'Mùa',
    'details.episode': 'Tập',
    'details.continue_watching': 'Tiếp tục',
    'details.no_episodes': 'Chưa có thông tin tập',
    'details.episodes_coming_soon': 'Dữ liệu sẽ được cập nhật sớm',
    'details.write_comment': 'Viết bình luận của bạn...',
    'details.post_comment': 'Đăng bình luận',
    'details.like': 'Thích',
    'details.unlike': 'Không thích',
    'details.save': 'Lưu',
    'details.unsave': 'Bỏ lưu',
    'details.play': 'Phát',
    'details.watch_now': 'Xem ngay',
    'details.advertisement': 'Quảng cáo',
    
    // Menu
    'menu.actor': 'Diễn viên',
    'menu.about_us': 'Về chúng tôi',
    'menu.help_center': 'Trung tâm trợ giúp',
    'menu.contacts': 'Liên hệ',
    'menu.privacy_policy': 'Chính sách bảo mật',
    
    // Language options
    'language.english': 'English',
    'language.vietnamese': 'Tiếng Việt',
    
    // MovieBox Screen
    'moviebox.title': 'MovieBox',
    'moviebox.subtitle': 'phim đã lưu',
    'moviebox.sort_by': 'Sắp xếp theo:',
    'moviebox.sort_date': 'Ngày thêm',
    'moviebox.sort_title': 'Tên phim',
    'moviebox.sort_rating': 'Đánh giá',
    'moviebox.episodes': 'tập',
    'moviebox.season': 'Mùa',
    'moviebox.remove_from_box': 'Xóa khỏi MovieBox',
    'moviebox.add_to_box': 'Thêm vào MovieBox',
    'moviebox.empty_title': 'MovieBox của bạn trống',
    'moviebox.empty_subtitle': 'Bắt đầu xây dựng bộ sưu tập bằng cách lưu phim và TV show',
    'moviebox.browse_movies': 'Duyệt phim',
    'moviebox.login_required_title': 'Cần đăng nhập',
    'moviebox.login_required_subtitle': 'Vui lòng đăng nhập để truy cập phim đã lưu',
    'moviebox.sign_in': 'Đăng nhập',
    'moviebox.network_error_title': 'Lỗi kết nối',
    'moviebox.network_error_subtitle': 'Vui lòng kiểm tra kết nối internet và thử lại',
    'moviebox.server_error_title': 'Lỗi máy chủ',
    'moviebox.server_error_subtitle': 'Đã xảy ra lỗi từ phía chúng tôi. Vui lòng thử lại',
    'moviebox.retry': 'Thử lại',
    'moviebox.loading': 'Đang tải phim của bạn...',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language_preference');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'vi')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
    }
  };

  const saveLanguagePreference = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language_preference', lang);
    } catch (error) {
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguagePreference(lang);
  };

  const t = (key: string): string => {
    const langMap = (translations as any)[language] as Record<string, string> | undefined;
    return (langMap && (langMap[key] as string)) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
