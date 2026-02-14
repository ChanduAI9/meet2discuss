import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'firebase_options.dart';
import 'screens/welcome_screen.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/home_screen.dart';
import 'screens/create_discussion_screen.dart';
import 'screens/discussion_details_screen.dart';
import 'screens/profile_screen.dart';

// Global flag to track Firebase initialization status
bool isFirebaseInitialized = false;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    isFirebaseInitialized = true;
    print('✅ Firebase initialized successfully');
  } catch (e) {
    isFirebaseInitialized = false;
    print('⚠️  Firebase initialization failed: $e');
    print('📱 Running in DEMO MODE - Firebase features disabled');
    print('ℹ️  To enable Firebase, follow FIREBASE_SETUP.md');
  }
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Meet2Discuss',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2563EB)),
        useMaterial3: true,
        scaffoldBackgroundColor: Colors.white,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => _AuthWrapper(),
        '/welcome': (context) => const WelcomeScreen(),
        '/login': (context) => const LoginScreen(),
        '/signup': (context) => const SignUpScreen(),
        '/home': (context) => const HomeScreen(),
        '/create-discussion': (context) => const CreateDiscussionScreen(),
        '/profile': (context) => const ProfileScreen(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/discussion-details') {
          final discussionId = settings.arguments as String;
          return MaterialPageRoute(
            builder: (context) => DiscussionDetailsScreen(discussionId: discussionId),
          );
        }
        return null;
      },
    );
  }
}

// Auth wrapper to check authentication state
class _AuthWrapper extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // If Firebase is not initialized, go directly to welcome screen
    if (!isFirebaseInitialized) {
      return const WelcomeScreen();
    }
    
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }
        
        if (snapshot.hasData) {
          return const HomeScreen();
        }
        
        return const WelcomeScreen();
      },
    );
  }
}
