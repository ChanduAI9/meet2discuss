import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Get current user stream
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Get current user
  User? get currentUser => _auth.currentUser;

  // Sign up with email and password
  Future<UserCredential?> signUpWithEmail({
    required String email,
    required String password,
    required String name,
    required String professionalRole,
    required List<String> expertise,
    required int yearsOfExperience,
  }) async {
    try {
      // Create auth user
      UserCredential userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Create user profile in Firestore
      if (userCredential.user != null) {
        UserModel userModel = UserModel(
          uid: userCredential.user!.uid,
          name: name,
          email: email,
          professionalRole: professionalRole,
          expertise: expertise,
          yearsOfExperience: yearsOfExperience,
        );

        await _firestore
            .collection('users')
            .doc(userCredential.user!.uid)
            .set(userModel.toMap());
      }

      return userCredential;
    } catch (e) {
      throw e.toString();
    }
  }

  // Sign in with email and password
  Future<UserCredential?> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      UserCredential userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return userCredential;
    } catch (e) {
      throw e.toString();
    }
  }

  // Sign in with Google
  Future<UserCredential?> signInWithGoogle({
    String? name,
    String? professionalRole,
    List<String>? expertise,
    int? yearsOfExperience,
  }) async {
    try {
      // Trigger Google Sign-In flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      // Obtain auth details
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // Create credential
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Sign in to Firebase
      UserCredential userCredential = await _auth.signInWithCredential(credential);

      // Check if user profile exists, if not create one
      if (userCredential.user != null) {
        DocumentSnapshot userDoc = await _firestore
            .collection('users')
            .doc(userCredential.user!.uid)
            .get();

        if (!userDoc.exists && name != null && professionalRole != null) {
          // Create new user profile
          UserModel userModel = UserModel(
            uid: userCredential.user!.uid,
            name: name,
            email: userCredential.user!.email ?? '',
            profilePhoto: userCredential.user!.photoURL,
            professionalRole: professionalRole,
            expertise: expertise ?? [],
            yearsOfExperience: yearsOfExperience ?? 0,
          );

          await _firestore
              .collection('users')
              .doc(userCredential.user!.uid)
              .set(userModel.toMap());
        }
      }

      return userCredential;
    } catch (e) {
      throw e.toString();
    }
  }

  // Sign out
  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
  }
}
