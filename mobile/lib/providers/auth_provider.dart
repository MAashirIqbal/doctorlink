import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_service.dart';

class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  String? _token;
  String? _role;
  bool _isLoading = true;
  bool _isAuthenticated = false;

  Map<String, dynamic>? get user => _user;
  String? get token => _token;
  String? get role => _role;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String get userName => _user?['name'] ?? '';
  String get userEmail => _user?['email'] ?? '';
  String get userAvatar => _user?['avatar'] ?? '';
  String get userId => _user?['_id'] ?? '';

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    _role = prefs.getString('role');

    if (_token != null) {
      try {
        final res = await ApiService.getMe();
        _user = Map<String, dynamic>.from(res.data['user']);
        _role = _user?['role'] ?? _role;
        _isAuthenticated = true;
      } catch (e) {
        await _clearAuth();
      }
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final res = await ApiService.login(email, password);
      final data = res.data;
      if (data['token'] != null) {
        await _saveAuth(data['token'], data['user']);
        return {'success': true};
      }
      return {'success': false, 'message': 'Login failed'};
    } catch (e) {
      return {'success': false, 'message': _extractError(e)};
    }
  }

  Future<Map<String, dynamic>> doctorLogin(String email, String password) async {
    try {
      final res = await ApiService.doctorLogin(email, password);
      final data = res.data;
      if (data['token'] != null) {
        await _saveAuth(data['token'], data['user']);
        return {'success': true};
      }
      return {'success': false, 'message': 'Login failed'};
    } catch (e) {
      return {'success': false, 'message': _extractError(e)};
    }
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    try {
      final res = await ApiService.register(data);
      final resData = res.data;
      if (resData['token'] != null) {
        await _saveAuth(resData['token'], resData['user']);
        return {'success': true};
      }
      return {'success': false, 'message': 'Registration failed'};
    } catch (e) {
      return {'success': false, 'message': _extractError(e)};
    }
  }

  Future<void> refreshUser() async {
    try {
      final res = await ApiService.getMe();
      _user = Map<String, dynamic>.from(res.data['user']);
      notifyListeners();
    } catch (_) {}
  }

  void updateUserLocal(Map<String, dynamic> updates) {
    if (_user != null) {
      _user = {..._user!, ...updates};
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _clearAuth();
    notifyListeners();
  }

  Future<void> _saveAuth(String token, Map<String, dynamic> user) async {
    _token = token;
    _user = Map<String, dynamic>.from(user);
    _role = user['role'];
    _isAuthenticated = true;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    await prefs.setString('role', _role ?? 'patient');
    notifyListeners();
  }

  Future<void> _clearAuth() async {
    _token = null;
    _user = null;
    _role = null;
    _isAuthenticated = false;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('role');
  }

  String _extractError(dynamic e) {
    if (e is DioException && e.response?.data != null) {
      final data = e.response!.data;
      if (data is Map && data['message'] != null) return data['message'];
    }
    return 'Something went wrong. Please try again.';
  }
}
