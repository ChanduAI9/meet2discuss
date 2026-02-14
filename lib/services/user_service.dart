import 'package:firebase_database/firebase_database.dart';
import '../models/user_model.dart';

class UserService {
  final DatabaseReference _database = FirebaseDatabase.instance.ref();

  // Get user by ID
  Future<UserModel?> getUserById(String uid) async {
    try {
      DataSnapshot snapshot = await _database.child('users').child(uid).get();
      if (snapshot.exists) {
        return UserModel.fromMap(Map<String, dynamic>.from(snapshot.value as Map));
      }
      return null;
    } catch (e) {
      throw e.toString();
    }
  }

  // Get user stream
  Stream<UserModel?> getUserStream(String uid) {
    return _database.child('users').child(uid).onValue.map((event) {
      if (event.snapshot.exists) {
        return UserModel.fromMap(Map<String, dynamic>.from(event.snapshot.value as Map));
      }
      return null;
    });
  }

  // Update user profile
  Future<void> updateUser(String uid, Map<String, dynamic> data) async {
    try {
      await _database.child('users').child(uid).update(data);
    } catch (e) {
      throw e.toString();
    }
  }

  // Update reputation score
  Future<void> updateReputation(String uid, double newRating) async {
    try {
      UserModel? user = await getUserById(uid);
      if (user != null) {
        int newTotalReviews = user.totalReviews + 1;
        double newReputationScore = 
            ((user.reputationScore * user.totalReviews) + newRating) / newTotalReviews;
        
        String newLevel = _calculateLevel(newReputationScore);
        
        await _database.child('users').child(uid).update({
          'reputationScore': newReputationScore,
          'totalReviews': newTotalReviews,
          'level': newLevel,
        });
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Update reputation score (for review service compatibility)
  Future<void> updateReputationScore(String uid, double newScore, int totalReviews) async {
    try {
      String level = _calculateLevel(newScore);
      await _database.child('users').child(uid).update({
        'reputationScore': newScore,
        'totalReviews': totalReviews,
        'level': level,
      });
    } catch (e) {
      throw e.toString();
    }
  }

  // Increment discussions hosted
  Future<void> incrementDiscussionsHosted(String uid) async {
    try {
      UserModel? user = await getUserById(uid);
      if (user != null) {
        await _database.child('users').child(uid).update({
          'discussionsHosted': user.discussionsHosted + 1,
        });
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Increment discussions attended
  Future<void> incrementDiscussionsAttended(String uid) async {
    try {
      UserModel? user = await getUserById(uid);
      if (user != null) {
        await _database.child('users').child(uid).update({
          'discussionsAttended': user.discussionsAttended + 1,
        });
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Calculate level based on reputation
  String _calculateLevel(double reputation) {
    if (reputation >= 4.4) return 'Authority';
    if (reputation >= 3.6) return 'Specialist';
    if (reputation >= 2.6) return 'Contributor';
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
