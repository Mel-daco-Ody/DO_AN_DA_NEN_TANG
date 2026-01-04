# Phân Tích Hệ Thống Permission Hiện Tại

## 📋 Tóm Tắt

### ✅ Những gì đã hoàn thành:
1. **Client-side permission guard**: Kiểm tra permission trước khi gọi API (UX improvement)
2. **Permission constants**: Tất cả permission strings đã được chuyển thành constants
3. **Action-gating**: UI vẫn hiển thị, chỉ block khi user thực hiện action
4. **Global upgrade modal**: Modal hiển thị khi thiếu permission
5. **Permission map**: Mapping đầy đủ từ CSV vào `api-permission-map.ts`

### ⚠️ Những vấn đề còn tồn tại:

#### 1. **Permissions chỉ được lấy từ Login Response**
- **Vấn đề**: Permissions được lấy một lần khi login và lưu trong `AsyncStorage` + `AuthContext`
- **Hệ quả**: 
  - Nếu admin thay đổi permissions/roles của user trên backend, client sẽ không biết
  - User phải logout và login lại để có permissions mới
  - Không có cơ chế sync permissions từ backend

#### 2. **Thiếu API Methods để Fetch Permissions**
- **API mới có sẵn**:
  - `GET /permissions/getbyUserID/{ID}` - Lấy permissions theo UserID
  - `GET /permissions/getbyRoleID/{ID}` - Lấy permissions theo RoleID
- **Trạng thái**: Đã có trong `api-permission-map.ts` nhưng **chưa có implementation** trong `filmzone-api.ts`

#### 3. **Không có cơ chế Refresh Permissions**
- Không có function để refresh permissions từ backend
- Không có auto-sync khi app mở lại
- Không có manual refresh option

## 🔍 Đánh Giá Chi Tiết

### A. Permission Flow Hiện Tại:

```
Login → Backend trả permissions trong response
  ↓
Lưu vào AsyncStorage + AuthContext state
  ↓
Client-side check trong filmzone-api.ts
  ↓
Nếu thiếu permission → Throw PermissionDeniedError → Show modal
```

**Vấn đề**: Permissions chỉ được update khi login, không có cơ chế sync.

### B. Backend Permission Enforcement:

✅ **Backend vẫn là source of truth**: 
- Backend kiểm tra JWT token và permissions trong token
- Client-side check chỉ là UX improvement, không thay thế backend validation

⚠️ **Nhưng có gap**:
- Nếu permissions thay đổi trên backend (admin thay đổi role), JWT token cũ vẫn có permissions cũ
- Client-side permissions cũng không được update

## 💡 Đề Xuất Cải Tiến

### 1. **Thêm API Methods để Fetch Permissions**

Thêm vào `filmzone-api.ts`:

```typescript
/**
 * GET /permissions/getbyUserID/{ID}
 * Lấy danh sách permissions của user
 */
async getPermissionsByUserID(userID: number): Promise<FilmZoneResponse<string[]>> {
  const response = await this.request<any>(`/permissions/getbyUserID/${userID}`);
  // Backend có thể trả về array of permission objects hoặc array of strings
  // Cần parse response để extract permission codes
  if (response.data && Array.isArray(response.data)) {
    const permissions = response.data.map((p: any) => 
      typeof p === 'string' ? p : p.code || p.permissionCode
    );
    return { ...response, data: permissions };
  }
  return { ...response, data: [] };
}

/**
 * GET /permissions/getbyRoleID/{ID}
 * Lấy danh sách permissions của role
 */
async getPermissionsByRoleID(roleID: number): Promise<FilmZoneResponse<string[]>> {
  const response = await this.request<any>(`/permissions/getbyRoleID/${roleID}`);
  if (response.data && Array.isArray(response.data)) {
    const permissions = response.data.map((p: any) => 
      typeof p === 'string' ? p : p.code || p.permissionCode
    );
    return { ...response, data: permissions };
  }
  return { ...response, data: [] };
}
```

### 2. **Thêm Function Refresh Permissions trong AuthContext**

Thêm vào `AuthContext.tsx`:

```typescript
/**
 * Refresh permissions từ backend
 * Nên gọi sau khi:
 * - App mở lại (on mount)
 * - Sau khi subscription thay đổi
 * - Sau khi admin thay đổi roles/permissions
 */
const refreshPermissions = async (): Promise<void> => {
  if (!authState.user?.userID || !authState.isAuthenticated) {
    return;
  }

  try {
    const response = await filmzoneApi.getPermissionsByUserID(authState.user.userID);
    if (response.errorCode === 200 && Array.isArray(response.data)) {
      const newPermissions = response.data;
      setAuthState(prev => ({
        ...prev,
        permissions: newPermissions,
      }));
      
      // Update AsyncStorage
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          ...parsed,
          permissions: newPermissions,
        }));
      }
      
      console.log('AuthContext: Permissions refreshed from backend');
    }
  } catch (error) {
    console.error('AuthContext: Failed to refresh permissions:', error);
    // Silent fail - không block user flow
  }
};
```

### 3. **Auto-refresh Permissions khi App Mở Lại**

Thêm vào `useEffect` trong `AuthContext`:

```typescript
// Refresh permissions khi app mở lại và user đã authenticated
useEffect(() => {
  if (authState.isAuthenticated && authState.user?.userID) {
    // Refresh permissions từ backend để đảm bảo sync
    refreshPermissions();
  }
}, [authState.isAuthenticated, authState.user?.userID]);
```

### 4. **Refresh Permissions sau khi Subscription Thay Đổi**

Trong function `updateSubscription`:

```typescript
const updateSubscription = async (plan: 'starter' | 'premium' | 'cinematic') => {
  // ... existing code ...
  
  // Sau khi update subscription thành công, refresh permissions
  await refreshPermissions();
};
```

### 5. **Manual Refresh Option (Optional)**

Có thể thêm một function để user manually refresh permissions nếu cần:

```typescript
const refreshUserPermissions = async (): Promise<boolean> => {
  try {
    await refreshPermissions();
    return true;
  } catch (error) {
    return false;
  }
};

// Export trong AuthContextType
interface AuthContextType {
  // ... existing ...
  refreshUserPermissions: () => Promise<boolean>;
}
```

## 📊 So Sánh: Trước vs Sau

### Trước (Hiện tại):
- ✅ Permissions từ login response
- ❌ Không sync từ backend
- ❌ Phải logout/login để có permissions mới
- ❌ Không có API methods để fetch permissions

### Sau (Sau khi cải tiến):
- ✅ Permissions từ login response (initial)
- ✅ Auto-refresh khi app mở lại
- ✅ Manual refresh option
- ✅ API methods để fetch permissions
- ✅ Sync sau khi subscription thay đổi

## 🎯 Kết Luận

### Permission System Hiện Tại:
- ✅ **Client-side guard**: Hoàn chỉnh
- ✅ **Backend enforcement**: Backend vẫn là source of truth
- ⚠️ **Permission sync**: Chưa có cơ chế sync từ backend

### Cần Cải Tiến:
1. **Thêm API methods** để fetch permissions từ backend
2. **Thêm refresh function** trong AuthContext
3. **Auto-refresh** khi app mở lại
4. **Refresh sau subscription changes**

### Mức Độ Ưu Tiên:
- **Cao**: Thêm API methods (dễ implement, tác động lớn)
- **Trung bình**: Auto-refresh khi app mở lại (cải thiện UX)
- **Thấp**: Manual refresh option (nice to have)

## 📝 Next Steps

1. Implement API methods trong `filmzone-api.ts`
2. Thêm `refreshPermissions` function trong `AuthContext`
3. Thêm auto-refresh logic
4. Test với backend để đảm bảo response format đúng
5. Update documentation

