import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'core/api_service.dart';
import 'core/theme.dart';
import 'providers/auth_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/auth/auth_screen.dart';
import 'screens/auth/forgot_password_screen.dart';
import 'screens/auth/reset_password_screen.dart';
import 'screens/shared/messages_screen.dart';
import 'screens/patient/symptom_analyzer_screen.dart';
import 'screens/settings/server_settings_screen.dart';
import 'screens/doctor/doctor_patients_list_screen.dart';
import 'screens/settings/change_password_screen.dart';
import 'screens/patient/patient_home.dart';
import 'screens/patient/doctor_profile_screen.dart';
import 'screens/patient/book_appointment_screen.dart';
import 'screens/patient/appointment_detail_screen.dart';
import 'screens/doctor/doctor_home.dart';
import 'screens/doctor/doctor_appointment_detail_screen.dart';
import 'screens/doctor/doctor_earnings_screen.dart';
import 'screens/shared/notifications_screen.dart';
import 'screens/patient/find_doctors_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiService.init();

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    systemNavigationBarColor: Colors.white,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));

  runApp(const DoctorLinkApp());
}

class DoctorLinkApp extends StatelessWidget {
  const DoctorLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: MaterialApp(
        title: 'DoctorLink',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: '/',
        onGenerateRoute: (settings) {
          Widget page;
          switch (settings.name) {
            case '/':
              page = const SplashScreen();
              break;
            case '/login':
              page = const AuthScreen();
              break;
            case '/register':
              page = const AuthScreen();
              break;
            case '/forgot-password':
              page = const ForgotPasswordScreen();
              break;
            case '/reset-password':
              final token = settings.arguments as String;
              page = ResetPasswordScreen(token: token);
              break;
            case '/patient-home':
              page = const PatientHome();
              break;
            case '/doctor-home':
              page = const DoctorHome();
              break;
            case '/doctor-profile':
              final doctorId = settings.arguments as String;
              page = DoctorProfileScreen(doctorId: doctorId);
              break;
            case '/book-appointment':
              final doctor = settings.arguments as Map<String, dynamic>;
              page = BookAppointmentScreen(doctor: doctor);
              break;
            case '/appointment-detail':
              final id = settings.arguments as String;
              page = AppointmentDetailScreen(appointmentId: id);
              break;
            case '/doctor-appointment-detail':
              final id = settings.arguments as String;
              page = DoctorAppointmentDetailScreen(appointmentId: id);
              break;
            case '/doctor-earnings':
              page = const DoctorEarningsScreen();
              break;
            case '/notifications':
              page = const NotificationsScreen();
              break;
            case '/find-doctors':
              page = const FindDoctorsScreen();
              break;
            case '/messages':
              final withId = settings.arguments is String ? settings.arguments as String : null;
              page = MessagesScreen(withId: withId);
              break;
            case '/symptom-analyzer':
              page = const SymptomAnalyzerScreen();
              break;
            case '/server-settings':
              final firstRun = settings.arguments == 'firstRun';
              page = ServerSettingsScreen(firstRun: firstRun);
              break;
            case '/doctor-patients':
              page = const DoctorPatientsListScreen();
              break;
            case '/change-password':
              page = const ChangePasswordScreen();
              break;
            default:
              page = const SplashScreen();
          }

          return PageRouteBuilder(
            settings: settings,
            pageBuilder: (context, animation, secondaryAnimation) => page,
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return FadeTransition(
                opacity: CurvedAnimation(parent: animation, curve: Curves.easeOut),
                child: child,
              );
            },
            transitionDuration: const Duration(milliseconds: 200),
          );
        },
      ),
    );
  }
}
