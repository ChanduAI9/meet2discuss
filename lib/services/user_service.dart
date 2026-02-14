import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';

class UserService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Get user by ID
  Future<UserModel?> getUserById(String uid) async {
    try {
      DocumentSnapshot doc = await _firestore.collection('users').doc(uid).get();
      if (doc.exists) {
        return UserModel.fromMap(doc.data() as Map<String, dynamic>);
      }
      return null;
    } catch (e) {
      throw e.toString();
    }
  }

  // Get user stream
  Stream<UserModel?> getUserStream(String uid) {
    return _firestore.collection('users').doc(uid).snapshots().map((snapshot) {
      if (snapshot.exists) {
        return UserModel.fromMap(snapshot.data() as Map<String, dynamic>);
      }
      return null;
    });
  }

  // Update user profile
  Future<void> updateUser(UserModel user) async {
    try {
      await _firestore.collection('users').doc(user.uid).update(user.toMap());
    } catch (e) {
      throw e.toString();
    }
  }

  // Increment discussions hosted
  Future<void> incrementDiscussionsHosted(String uid) async {
    try {
      await _firestore.collection('users').doc(uid).update({
        'discussionsHosted': FieldValue.increment(1),
      });
    } catch (e) {
      throw e.toString();
    }
  }

  // Increment discussions attended
  Future<void> incrementDiscussionsAttended(String uid) async {
    try {
      await _firestore.collection('users').doc(uid).update({
        'discussionsAttended': FieldValue.increment(1),
      });
    } catch (e) {
      throw e.toString();
    }
  }

  // Update reputation score
  Future<void> updateReputationScore(String uid, double newScore, int totalReviews) async {
    try {
      String level = _calculateLevel(newScore);
      await _firestore.collection('users').doc(uid).update({
        'reputationScore': newScore,
        'totalReviews': totalReviews,
        'level': level,
      });
    } catch (e) {
      throw e.toString();
    }
  }

  // Calculate level based on reputation score
  String _calculateLevel(double score) {
    if (score >= 4.4) return 'Authority';
    if (score >= 3.6) return 'Specialist';
    if (score >= 2.6) return 'Contributor';
    return 'Learner';
  }

  // Get multiple users by IDs
  Future<List<UserModel>> getUsersByIds(List<String> userIds) async {
    try {
      if (userIds.isEmpty) return [];
      
      List<UserModel> users = [];
      for (String uid in userIds) {
        UserModel? user = await getUserById(uid);
        if (user != null) {
          users.add(user);
        }
      }
      return users;
    } catch (e) {
      throw e.toString();
    }
  }
}
