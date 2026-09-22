import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Default fallback. Real value is loaded from SharedPreferences on init()
  // and can be changed at runtime via the in-app Server Settings screen.
  static const String defaultBaseUrl = 'https://fyp-doctor-link-backend.vercel.app/api';
  static const String _prefsKey = 'apiBaseUrl';

  // Mutable so we can swap it at runtime without restarting the app.
  static String _baseUrl = defaultBaseUrl;
  static String get baseUrl => _baseUrl;

  static final Dio _dio = Dio(BaseOptions(
    baseUrl: defaultBaseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Content-Type': 'application/json'},
  ));

  static bool _initialized = false;

  // Normalize any user-entered URL into something Dio will accept.
  static String normalizeUrl(String input) {
    var s = input.trim();
    if (s.isEmpty) return defaultBaseUrl;
    s = s.replaceAll(RegExp(r'/+$'), '');
    // ensure scheme
    if (!RegExp(r'^https?://').hasMatch(s)) s = 'http://$s';
    // ensure /api suffix
    if (!RegExp(r'/api(/.*)?$').hasMatch(s)) s = '$s/api';
    return s;
  }

  static Future<void> init() async {
    if (_initialized) return;
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_prefsKey);
    if (saved != null && saved.isNotEmpty) {
      _baseUrl = saved;
      _dio.options.baseUrl = saved;
    }
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        return handler.next(error);
      },
    ));
    _initialized = true;
  }

  // Persist a new base URL and switch the live Dio client over to it.
  static Future<void> setBaseUrl(String raw) async {
    final normalized = normalizeUrl(raw);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, normalized);
    _baseUrl = normalized;
    _dio.options.baseUrl = normalized;
  }

  // Returns true if the user has explicitly configured a URL (or false if
  // we're still on the default — used by Splash to gate first-run setup).
  static Future<bool> isConfigured() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_prefsKey);
    return saved != null && saved.isNotEmpty;
  }

  // Quick reachability check against /api/health.
  static Future<bool> healthCheck(String url) async {
    final normalized = normalizeUrl(url);
    try {
      final probe = Dio(BaseOptions(
        baseUrl: normalized,
        connectTimeout: const Duration(seconds: 6),
        receiveTimeout: const Duration(seconds: 6),
      ));
      final res = await probe.get('/health');
      return res.statusCode == 200 && (res.data is Map);
    } catch (_) {
      return false;
    }
  }

  static Dio get dio => _dio;

  // ==================== AUTH ====================
  static Future<Response> login(String email, String password) =>
      _dio.post('/auth/login', data: {'email': email, 'password': password});

  static Future<Response> register(Map<String, dynamic> data) =>
      _dio.post('/auth/register', data: data);

  static Future<Response> doctorLogin(String email, String password) =>
      _dio.post('/doctors/login', data: {'email': email, 'password': password});

  static Future<Response> getMe() => _dio.get('/auth/me');

  static Future<Response> updateProfile(Map<String, dynamic> data) =>
      _dio.put('/auth/profile', data: data);

  static Future<Response> changePassword(Map<String, dynamic> data) =>
      _dio.put('/auth/password', data: data);

  static Future<Response> forgotPassword(String email) =>
      _dio.post('/auth/forgot-password', data: {'email': email});

  static Future<Response> resetPassword(String token, String password) =>
      _dio.post('/auth/reset-password/$token', data: {'password': password});

  // ==================== DOCTORS ====================
  static Future<Response> getDoctors({Map<String, dynamic>? params}) =>
      _dio.get('/doctors', queryParameters: params);

  static Future<Response> getDoctor(String id) => _dio.get('/doctors/$id');

  static Future<Response> getDoctorSlots(String id, {Map<String, dynamic>? params}) =>
      _dio.get('/doctors/$id/slots', queryParameters: params);

  static Future<Response> getDoctorProfile() => _dio.get('/doctors/me/profile');

  static Future<Response> updateDoctorProfile(Map<String, dynamic> data) =>
      _dio.put('/doctors/me/profile', data: data);

  static Future<Response> updateSchedule(Map<String, dynamic> data) =>
      _dio.put('/doctors/me/schedule', data: data);

  static Future<Response> getDoctorDashboard() => _dio.get('/doctors/me/dashboard');

  static Future<Response> getDoctorPatients() => _dio.get('/doctors/me/patients');

  static Future<Response> getDoctorEarnings() => _dio.get('/doctors/me/earnings');

  static Future<Response> getRecommendedDoctors({String? specialization, int limit = 5}) =>
      _dio.get('/doctors/recommended', queryParameters: {
        if (specialization != null) 'specialization': specialization,
        'limit': limit,
      });

  static Future<Response> getRecommendedForMe() =>
      _dio.get('/doctors/recommended-for-me');

  static Future<Response> geocodeMyClinic() =>
      _dio.post('/doctors/me/geocode');

  // ==================== APPOINTMENTS ====================
  static Future<Response> createAppointment(Map<String, dynamic> data) =>
      _dio.post('/appointments', data: data);

  static Future<Response> getMyAppointments({Map<String, dynamic>? params}) =>
      _dio.get('/appointments/my', queryParameters: params);

  static Future<Response> getPatientDashboard() =>
      _dio.get('/appointments/dashboard');

  static Future<Response> getDoctorAppointments({Map<String, dynamic>? params}) =>
      _dio.get('/appointments/doctor', queryParameters: params);

  static Future<Response> getAppointmentDetail(String id) =>
      _dio.get('/appointments/$id');

  static Future<Response> acceptAppointment(String id) =>
      _dio.put('/appointments/$id/accept');

  static Future<Response> rejectAppointment(String id, {Map<String, dynamic>? data}) =>
      _dio.put('/appointments/$id/reject', data: data);

  static Future<Response> completeAppointment(String id) =>
      _dio.put('/appointments/$id/complete');

  static Future<Response> cancelAppointment(String id, {Map<String, dynamic>? data}) =>
      _dio.put('/appointments/$id/cancel', data: data);

  static Future<Response> markNoShow(String id) =>
      _dio.put('/appointments/$id/no-show');

  static Future<Response> rescheduleAppointment(String id, Map<String, dynamic> data) =>
      _dio.put('/appointments/$id/reschedule', data: data);

  static Future<Response> acceptReschedule(String id) =>
      _dio.put('/appointments/$id/reschedule/accept');

  static Future<Response> rejectReschedule(String id) =>
      _dio.put('/appointments/$id/reschedule/reject');

  // Prescriptions (doctor)
  static Future<Response> uploadPrescription(String appointmentId, String filePath, {String? notes}) async {
    final form = FormData.fromMap({
      'prescription': await MultipartFile.fromFile(filePath, filename: filePath.split(RegExp(r'[\\/]')).last),
      if (notes != null && notes.isNotEmpty) 'notes': notes,
    });
    return _dio.post('/appointments/$appointmentId/prescription', data: form);
  }

  // Doctor referral
  static Future<Response> referAppointment(String appointmentId, Map<String, dynamic> data) =>
      _dio.post('/appointments/$appointmentId/refer', data: data);

  // ==================== PAYMENTS ====================
  static Future<Response> createCheckout(String appointmentId) =>
      _dio.post('/payments/create-checkout', data: {'appointmentId': appointmentId});

  static Future<Response> verifyStripeSession(String sessionId) =>
      _dio.post('/payments/verify-session', data: {'sessionId': sessionId});

  static Future<Response> getMyPayments() => _dio.get('/payments/my');

  // ==================== AI SYMPTOM ANALYZER ====================
  static Future<Response> analyzeSymptoms({
    required String symptoms,
    String? age,
    String? gender,
    String? imagePath,
  }) async {
    final formMap = <String, dynamic>{
      'symptoms': symptoms,
      if (age != null && age.isNotEmpty) 'age': age,
      if (gender != null && gender.isNotEmpty) 'gender': gender,
    };
    if (imagePath != null && imagePath.isNotEmpty) {
      formMap['image'] = await MultipartFile.fromFile(
        imagePath,
        filename: imagePath.split(RegExp(r'[\\/]')).last,
      );
    }
    return _dio.post('/ai/analyze-symptoms', data: FormData.fromMap(formMap));
  }

  // ==================== MESSAGES ====================
  static Future<Response> listConversations() =>
      _dio.get('/messages/conversations');

  static Future<Response> getMessageThread(String withId) =>
      _dio.get('/messages/thread', queryParameters: {'with': withId});

  static Future<Response> sendMessage(String withId, String body) =>
      _dio.post('/messages', data: {'with': withId, 'body': body});

  static Future<Response> markThreadRead(String withId) =>
      _dio.put('/messages/read', queryParameters: {'with': withId});

  static Future<Response> getUnreadMessageCount() =>
      _dio.get('/messages/unread-count');

  // ==================== NOTIFICATIONS ====================
  static Future<Response> getMyNotifications() =>
      _dio.get('/notifications/my');

  static Future<Response> markNotificationRead(String id) =>
      _dio.put('/notifications/$id/read');

  static Future<Response> markAllNotificationsRead() =>
      _dio.put('/notifications/read-all');

  // ==================== REVIEWS ====================
  static Future<Response> createReview(Map<String, dynamic> data) =>
      _dio.post('/reviews', data: data);

  static Future<Response> getDoctorReviews(String doctorId) =>
      _dio.get('/reviews/doctor/$doctorId');

  // ==================== ANNOUNCEMENTS ====================
  static Future<Response> getActiveAnnouncements() =>
      _dio.get('/announcements/active');

  static Future<Response> dismissAnnouncement(String id) =>
      _dio.put('/announcements/$id/dismiss');
}
