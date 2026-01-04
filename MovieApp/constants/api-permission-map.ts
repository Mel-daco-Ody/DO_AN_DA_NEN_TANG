import { ApiPermissionEntry } from '../types/api-permissions';

/**
 * Full API permission map (client-side).
 *
 * Source: CSV provided by the project owner.
 * Policy: Loose (if an endpoint is not found in this map, client will still call the API).
 *
 * Notes:
 * - `isPublic=true` for GUEST endpoints.
 * - `permission=null` for isPublic endpoints.
 * - Keep this file in sync with backend/OpenAPI.
 */
export const API_PERMISSIONS: readonly ApiPermissionEntry[] = [
  // Account
  { method: 'POST', pathTemplate: '/account/mfa/totp/start', permission: 'account.mfa_setup', isPublic: false },
  { method: 'POST', pathTemplate: '/account/mfa/totp/confirm', permission: 'account.mfa_setup', isPublic: false },
  { method: 'POST', pathTemplate: '/account/mfa/totp/disable', permission: 'account.mfa_setup', isPublic: false },
  { method: 'POST', pathTemplate: '/account/password/change/email/start', permission: 'account.change_password', isPublic: false },
  { method: 'POST', pathTemplate: '/account/password/change/email/verify', permission: 'account.change_password', isPublic: false },
  { method: 'POST', pathTemplate: '/account/password/change/mfa/verify', permission: 'account.change_password', isPublic: false },
  { method: 'POST', pathTemplate: '/account/password/change/commit', permission: 'account.change_password', isPublic: false },
  { method: 'POST', pathTemplate: '/account/password/forgot/email/start', permission: null, isPublic: true },
  { method: 'POST', pathTemplate: '/account/password/forgot/email/verify', permission: null, isPublic: true },
  { method: 'POST', pathTemplate: '/account/password/forgot/mfa/verify', permission: null, isPublic: true },
  { method: 'POST', pathTemplate: '/account/password/forgot/commit', permission: null, isPublic: true },

  // ArchiveUpload
  { method: 'POST', pathTemplate: '/api/upload/archive/file', permission: 'upload.archive', isPublic: false },
  { method: 'POST', pathTemplate: '/api/upload/archive/link', permission: 'upload.archive', isPublic: false },

  // Comment
  { method: 'GET', pathTemplate: '/api/Comment/GetCommentByID/{id}', permission: 'comment.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/Comment/GetCommentsByUserID/{userID}', permission: 'comment.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/Comment/GetCommentsByMovieID/{movieID}', permission: 'comment.read', isPublic: false },
  { method: 'POST', pathTemplate: '/api/Comment/CreateComment', permission: 'comment.create', isPublic: false },
  { method: 'PUT', pathTemplate: '/api/Comment/UpdateComment', permission: 'comment.update_own', isPublic: false },
  { method: 'DELETE', pathTemplate: '/api/Comment/DeleteComment/{id}', permission: 'comment.delete_own', isPublic: false },

  // Episode
  { method: 'GET', pathTemplate: '/api/Episode/GetEpisodeById/{id}', permission: 'episode.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/Episode/GetAllEpisodes/getAll', permission: 'episode.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/Episode/GetEpisodesByMovieId/getbyMovie/{movieId}', permission: 'episode.read', isPublic: false },
  { method: 'POST', pathTemplate: '/api/Episode/CreateEpisode', permission: 'episode.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/api/Episode/UpdateEpisode', permission: 'episode.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/api/Episode/DeleteEpisode/{id}', permission: 'episode.manage', isPublic: false },

  // EpisodeSource
  { method: 'GET', pathTemplate: '/movie/EpisodeSource/GetEpisodeSourceById/{id}', permission: 'source.read', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/EpisodeSource/GetEpisodeSourcesByEpisodeId/{episodeId}', permission: 'source.read', isPublic: false },
  { method: 'POST', pathTemplate: '/movie/EpisodeSource/CreateEpisodeSource', permission: 'source.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/movie/EpisodeSource/UpdateEpisodeSource', permission: 'source.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/movie/EpisodeSource/DeleteEpisodeSource/{id}', permission: 'source.manage', isPublic: false },

  // EpisodeWatchProgress
  { method: 'POST', pathTemplate: '/api/EpisodeWatchProgress/CreateEpisodeWatchProgress', permission: 'progress.track', isPublic: false },
  { method: 'PUT', pathTemplate: '/api/EpisodeWatchProgress/UpdateEpisodeWatchProgress', permission: 'progress.track', isPublic: false },
  { method: 'DELETE', pathTemplate: '/api/EpisodeWatchProgress/DeleteEpisodeWatchProgress/{id}', permission: 'progress.track', isPublic: false },
  { method: 'GET', pathTemplate: '/api/EpisodeWatchProgress/GetEpisodeWatchProgressByID/{id}', permission: 'progress.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/EpisodeWatchProgress/GetEpisodeWatchProgressByUserID/user/{userId}', permission: 'progress.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/EpisodeWatchProgress/GetEpisodeWatchProgressByEpisodeID/episode/{episodeId}', permission: 'progress.read', isPublic: false },

  // Health
  { method: 'GET', pathTemplate: '/healthz', permission: null, isPublic: true },

  // ImageSource
  { method: 'GET', pathTemplate: '/movie/ImageSource/GetImageSourcesByType/{Type}', permission: 'image.read', isPublic: false },
  { method: 'POST', pathTemplate: '/movie/ImageSource/CreateImageSource', permission: 'image.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/movie/ImageSource/UpdateImageSource', permission: 'image.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/movie/ImageSource/DeleteImageSource/{id}', permission: 'image.manage', isPublic: false },

  // Invoice
  { method: 'GET', pathTemplate: '/api/payment/invoice/{orderID}', permission: 'invoice.read_own', isPublic: false },
  { method: 'GET', pathTemplate: '/api/payment/invoice/user/{userID}', permission: 'invoice.read_own', isPublic: false },
  { method: 'GET', pathTemplate: '/api/payment/invoice/all', permission: 'invoice.read_all', isPublic: false },

  // Login
  { method: 'POST', pathTemplate: '/login/logout', permission: 'auth.logout', isPublic: false },
  { method: 'POST', pathTemplate: '/login/logout/session/{sessionId}', permission: 'auth.logout', isPublic: false },
  { method: 'POST', pathTemplate: '/login/logout/all', permission: 'auth.logout', isPublic: false },
  { method: 'POST', pathTemplate: '/login/auth/refresh', permission: 'auth.refresh', isPublic: false },
  { method: 'POST', pathTemplate: '/login/userLogin', permission: null, isPublic: true },
  { method: 'POST', pathTemplate: '/login/login/mobile', permission: null, isPublic: true },
  { method: 'GET', pathTemplate: '/login/google-login', permission: null, isPublic: true },
  { method: 'POST', pathTemplate: '/login/login/mobile/google', permission: null, isPublic: true },
  { method: 'GET', pathTemplate: '/login/google/callback', permission: null, isPublic: true },
  { method: 'GET', pathTemplate: '/login/signin-google', permission: null, isPublic: true },
  { method: 'POST', pathTemplate: '/login/mfa/verify', permission: null, isPublic: true },

  // Movie
  { method: 'GET', pathTemplate: '/api/Movie/GetMovieById/{id}', permission: 'movie.read_details', isPublic: false },
  { method: 'GET', pathTemplate: '/api/Movie/GetAllMovies/gellAll', permission: 'movie.browse', isPublic: false },
  { method: 'GET', pathTemplate: '/api/Movie/GetAllMoviesMainScreen/mainScreen', permission: 'movie.browse', isPublic: false },
  { method: 'GET', pathTemplate: '/api/Movie/GetAllMoviesNewReleaseMainScreen/newReleaseMainScreen', permission: 'movie.browse', isPublic: false },
  { method: 'GET', pathTemplate: '/api/Movie/GetWatchNowMovieByID/watchNow/{id}', permission: 'movie.watch_stream', isPublic: false },
  { method: 'POST', pathTemplate: '/api/Movie/CreateMovie', permission: 'movie.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/api/Movie/UpdateMovie', permission: 'movie.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/api/Movie/DeleteMovie/{id}', permission: 'movie.manage', isPublic: false },

  // MoviePerson
  { method: 'GET', pathTemplate: '/movie/MoviePerson/GetMoviesByPerson/{personID}', permission: 'movie_person.read', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/MoviePerson/GetPersonsByMovie/{movieID}', permission: 'movie_person.read', isPublic: false },
  { method: 'POST', pathTemplate: '/movie/MoviePerson/AddPersonToMovie', permission: 'movie_person.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/movie/MoviePerson/RemovePersonFromMovie/{id}', permission: 'movie_person.manage', isPublic: false },

  // MovieSource
  { method: 'GET', pathTemplate: '/api/movies/{movieId}/vip-source', permission: 'movie.watch_vip', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/MovieSource/GetMovieSourceById/{id}', permission: 'source.read', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/MovieSource/GetMovieSourcesByMovieIdPublic/getByMovieId/{movieId}', permission: 'source.read', isPublic: false },
  { method: 'POST', pathTemplate: '/movie/MovieSource/CreateMovieSource', permission: 'source.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/movie/MovieSource/UpdateMovieSource', permission: 'source.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/movie/MovieSource/DeleteMovieSource/{id}', permission: 'source.manage', isPublic: false },

  // MovieSubTitle
  { method: 'GET', pathTemplate: '/api/MovieSubTitle/GetAllSubTitlesByMovieId/movie/GetAllSubTitlesBySourceID/{sourceID}', permission: 'subtitle.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/MovieSubTitle/GetAllSubTitles/movie/GetAllSubTitles', permission: 'subtitle.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/MovieSubTitle/GetMovieSubTitleByID/movie/GetMovieSubTitleByID/{movieSubTitleID}', permission: 'subtitle.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/MovieSubTitle/GetAllSubTitlesByEpisodeId/episode/GetAllSubTitlesBySourceID/{sourceID}', permission: 'subtitle.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/MovieSubTitle/GetEpisodeSubTitleByID/episode/GetEpisodeSubTitleByID/{episodeSubTitleID}', permission: 'subtitle.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/MovieSubTitle/GetAllEpisodeSubTitles/episode/GetAllSubTitles', permission: 'subtitle.read', isPublic: false },
  { method: 'POST', pathTemplate: '/api/MovieSubTitle/ReceiveTranscribeCallback/Callback/TranscribeResult', permission: null, isPublic: true },
  { method: 'POST', pathTemplate: '/api/MovieSubTitle/UploadMovieSubTitle/UploadMovieSubTitle', permission: 'subtitle.upload', isPublic: false },
  { method: 'POST', pathTemplate: '/api/MovieSubTitle/TranslateFromSource/Translate/AutoFromSource', permission: 'subtitle.translate', isPublic: false },
  { method: 'POST', pathTemplate: '/api/MovieSubTitle/CreateMovieSubTitle/movie/createMovieSubTitle', permission: 'subtitle.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/api/MovieSubTitle/UpdateMovieSubTitle/movie/updateMovieSubTitle', permission: 'subtitle.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/api/MovieSubTitle/DeleteMovieSubTitle/movie/deleteMovieSubTitle/{movieSubTitleID}', permission: 'subtitle.manage', isPublic: false },
  { method: 'POST', pathTemplate: '/api/MovieSubTitle/CreateEpisodeSubTitle/episode/createEpisodeSubTitle', permission: 'subtitle.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/api/MovieSubTitle/UpdateEpisodeSubTitle/episode/updateEpisodeSubTitle', permission: 'subtitle.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/api/MovieSubTitle/DeleteEpisodeSubTitle/episode/deleteEpisodeSubTitle/{episodeSubTitleID}', permission: 'subtitle.manage', isPublic: false },

  // MovieTag
  { method: 'GET', pathTemplate: '/movie/MovieTag/GetMoviesByTag/{tagID}', permission: 'movie_tag.read', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/MovieTag/GetTagsByMovie/{movieID}', permission: 'movie_tag.read', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/MovieTag/GetMoviesByTagIDs/getMovieByTagID', permission: 'movie_tag.read', isPublic: false },
  { method: 'POST', pathTemplate: '/movie/MovieTag/AddTagToMovie', permission: 'movie_tag.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/movie/MovieTag/UpdateMovieTag', permission: 'movie_tag.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/movie/MovieTag/DeleteMovieTag/{id}', permission: 'movie_tag.manage', isPublic: false },

  // Order
  { method: 'GET', pathTemplate: '/api/payment/order/{orderID}', permission: 'order.read_own', isPublic: false },
  { method: 'GET', pathTemplate: '/api/payment/order/user/{userID}', permission: 'order.read_own', isPublic: false },
  { method: 'GET', pathTemplate: '/api/payment/order/all', permission: 'order.read_all', isPublic: false },

  // Payment
  { method: 'POST', pathTemplate: '/api/payment/vnpay/checkout', permission: 'payment.checkout', isPublic: false },
  { method: 'GET', pathTemplate: '/api/payment/vnpay/callback', permission: null, isPublic: true },

  // Permission
  { method: 'POST', pathTemplate: '/permissions/addPermission', permission: 'permission.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/permissions/updatePermission', permission: 'permission.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/permissions/delate', permission: 'permission.manage', isPublic: false },
  { method: 'POST', pathTemplate: '/permissions/BulkCreate', permission: 'permission.manage', isPublic: false },
  { method: 'GET', pathTemplate: '/permissions/getall', permission: 'permission.read', isPublic: false },
  { method: 'GET', pathTemplate: '/permissions/getbyid', permission: 'permission.read', isPublic: false },
  { method: 'GET', pathTemplate: '/permissions/getbyUserID/{ID}', permission: 'permission.read', isPublic: false },
  { method: 'GET', pathTemplate: '/permissions/getbyRoleID/{ID}', permission: 'permission.read', isPublic: false },

  // Person
  { method: 'GET', pathTemplate: '/movie/Person/GetPersonByID/{ID}', permission: 'person.read', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/Person/GetAllPerson/getall', permission: 'person.read', isPublic: false },
  { method: 'POST', pathTemplate: '/movie/Person/CreatePerson', permission: 'person.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/movie/Person/UpdatePerson', permission: 'person.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/movie/Person/DeletePerson/{id}', permission: 'person.manage', isPublic: false },

  // Plan
  { method: 'GET', pathTemplate: '/api/plans/{planID}', permission: 'plan.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/plans/all', permission: 'plan.read', isPublic: false },
  { method: 'POST', pathTemplate: '/api/plans/create', permission: 'plan.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/api/plans/update', permission: 'plan.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/api/plans/delete/{planID}', permission: 'plan.manage', isPublic: false },

  // Price
  { method: 'GET', pathTemplate: '/api/price/{priceID}', permission: 'price.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/price/all', permission: 'price.read', isPublic: false },
  { method: 'POST', pathTemplate: '/api/price/Create', permission: 'price.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/api/price/Update', permission: 'price.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/api/price/Delete/{priceID}', permission: 'price.manage', isPublic: false },

  // Region
  { method: 'GET', pathTemplate: '/movie/Region/GetRegionByID/{ID}', permission: 'region.read', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/Region/GetAllRegions/getAll', permission: 'region.read', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/Region/GetMovieByRegionID/getMovieByRegionID/{regionID}', permission: 'region.read', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/Region/GetPersonByRegionID/getPersonByRegionID/{regionID}', permission: 'region.read', isPublic: false },
  { method: 'POST', pathTemplate: '/movie/Region/CreateRegion', permission: 'region.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/movie/Region/UpdateRegion', permission: 'region.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/movie/Region/DeleteRegion/{id}', permission: 'region.manage', isPublic: false },

  // Register
  { method: 'POST', pathTemplate: '/register', permission: null, isPublic: true },
  { method: 'POST', pathTemplate: '/register/verifyRegisterEmail', permission: null, isPublic: true },

  // Role
  { method: 'GET', pathTemplate: '/roles/getall', permission: 'role.read', isPublic: false },
  { method: 'POST', pathTemplate: '/roles/addRole', permission: 'role.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/roles/updateRole', permission: 'role.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/roles/deleteRole/{roleID}', permission: 'role.manage', isPublic: false },
  { method: 'GET', pathTemplate: '/roles/getRoleByUserID/{userID}', permission: 'role.read', isPublic: false },

  // RolePermission
  { method: 'POST', pathTemplate: '/role-permissions/assign-permissions', permission: 'permission.assign', isPublic: false },

  // SavedMovie
  { method: 'POST', pathTemplate: '/api/SavedMovie/CreateSavedMovie', permission: 'saved_movie.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/api/SavedMovie/UpdateSavedMovie', permission: 'saved_movie.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/api/SavedMovie/DeleteSavedMovie/{id}', permission: 'saved_movie.manage', isPublic: false },
  { method: 'GET', pathTemplate: '/api/SavedMovie/GetSavedMovieByID/{id}', permission: 'saved_movie.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/SavedMovie/GetSavedMoviesByUserID/user/{userId}', permission: 'saved_movie.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/SavedMovie/GetSavedMoviesByMovieID/movie/{movieId}', permission: 'saved_movie.read', isPublic: false },

  // Search
  { method: 'POST', pathTemplate: '/api/search/movies/reset-index', permission: 'search.manage', isPublic: false },
  { method: 'POST', pathTemplate: '/api/search/movies/sync-orphans', permission: 'search.manage', isPublic: false },
  { method: 'GET', pathTemplate: '/api/search/movies', permission: 'search.movie', isPublic: false },
  { method: 'GET', pathTemplate: '/api/search/movies/suggest', permission: 'search.suggest', isPublic: false },
  { method: 'GET', pathTemplate: '/api/search/persons', permission: 'search.person', isPublic: false },
  { method: 'POST', pathTemplate: '/api/search/movies/all', permission: 'search.advanced', isPublic: false },

  // Subscription
  { method: 'GET', pathTemplate: '/api/payment/subscription/all', permission: 'subscription.read_all', isPublic: false },
  { method: 'POST', pathTemplate: '/api/payment/subscription/expire-due', permission: 'subscription.manage', isPublic: false },
  { method: 'GET', pathTemplate: '/api/payment/subscription/{subscriptionID}', permission: 'subscription.read_own', isPublic: false },
  { method: 'GET', pathTemplate: '/api/payment/subscription/user/{userID}', permission: 'subscription.read_own', isPublic: false },
  { method: 'POST', pathTemplate: '/api/payment/subscription/cancel-subs', permission: 'subscription.cancel', isPublic: false },

  // Tag
  { method: 'GET', pathTemplate: '/movie/Tag/GetTagById/{TagID}', permission: 'tag.read', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/Tag/GetAllTags/getALlTags', permission: 'tag.read', isPublic: false },
  { method: 'POST', pathTemplate: '/movie/Tag/CreateTag', permission: 'tag.manage', isPublic: false },
  { method: 'PUT', pathTemplate: '/movie/Tag/UpdateTag', permission: 'tag.manage', isPublic: false },
  { method: 'DELETE', pathTemplate: '/movie/Tag/DeleteTag/{id}', permission: 'tag.manage', isPublic: false },

  // User
  { method: 'DELETE', pathTemplate: '/user/deleteUser', permission: 'user.delete', isPublic: false },
  { method: 'GET', pathTemplate: '/user/me', permission: 'user.read_profile', isPublic: false },
  { method: 'PUT', pathTemplate: '/user/update/profile', permission: 'user.update_profile', isPublic: false },
  { method: 'PUT', pathTemplate: '/user/update/username', permission: 'user.update_profile', isPublic: false },
  { method: 'GET', pathTemplate: '/user/getAllUsers', permission: 'user.read_list', isPublic: false },
  { method: 'GET', pathTemplate: '/user/getUserById', permission: 'user.read_details', isPublic: false },

  // UserRating
  { method: 'GET', pathTemplate: '/api/UserRating/GetUserRatingById/{ID}', permission: 'rating.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/UserRating/GetAllUserRatingsByUserId/{userID}', permission: 'rating.read', isPublic: false },
  { method: 'GET', pathTemplate: '/api/UserRating/GetAllUserRatingsByMovieId/{movieID}', permission: 'rating.read', isPublic: false },
  { method: 'POST', pathTemplate: '/api/UserRating/CreateUserRating', permission: 'rating.create', isPublic: false },
  { method: 'PUT', pathTemplate: '/api/UserRating/UpdateUserRating', permission: 'rating.update', isPublic: false },
  { method: 'DELETE', pathTemplate: '/api/UserRating/DeleteUserRating/{id}', permission: 'rating.delete', isPublic: false },

  // UserRole
  { method: 'POST', pathTemplate: '/user-roles/assign-roles', permission: 'role.assign', isPublic: false },

  // VimeoUpload
  { method: 'POST', pathTemplate: '/api/upload/vimeo/file', permission: 'upload.vimeo', isPublic: false },
  { method: 'POST', pathTemplate: '/api/upload/vimeo/link', permission: 'upload.vimeo', isPublic: false },

  // WatchProgress
  { method: 'POST', pathTemplate: '/movie/WatchProgress/CreateWatchProgress', permission: 'progress.track', isPublic: false },
  { method: 'PUT', pathTemplate: '/movie/WatchProgress/UpdateWatchProgress', permission: 'progress.track', isPublic: false },
  { method: 'DELETE', pathTemplate: '/movie/WatchProgress/DeleteWatchProgress/{id}', permission: 'progress.track', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/WatchProgress/GetWatchProgressByUserId/{userId}', permission: 'progress.read', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/WatchProgress/GetWatchProgressByID/{ID}', permission: 'progress.read', isPublic: false },
  { method: 'GET', pathTemplate: '/movie/WatchProgress/GetWatchProgressByMovieId/{movieId}', permission: 'progress.read', isPublic: false },

  // YouTubeUpload
  { method: 'POST', pathTemplate: '/api/upload/youtube/file', permission: 'upload.youtube', isPublic: false },
] as const;

