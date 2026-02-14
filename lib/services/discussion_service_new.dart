import 'package:firebase_database/firebase_database.dart';
import '../models/discussion_model.dart';

class DiscussionService {
  final DatabaseReference _database = FirebaseDatabase.instance.ref();

  // Create discussion
  Future<String> createDiscussion({
    required String hostId,
    required String title,
    required String description,
    required String location,
    required DateTime dateTime,
    required int maxParticipants,
  }) async {
    try {
      DatabaseReference newDiscussionRef = _database.child('discussions').push();
      
      await newDiscussionRef.set({
        'id': newDiscussionRef.key,
        'hostId': hostId,
        'title': title,
        'description': description,
        'location': location,
        'dateTime': dateTime.toIso8601String(),
        'maxParticipants': maxParticipants,
        'participants': [hostId],
        'status': 'upcoming',
        'createdAt': DateTime.now().toIso8601String(),
      });

      return newDiscussionRef.key!;
    } catch (e) {
      throw e.toString();
    }
  }

  // Get discussions stream
  Stream<List<Discussion>> getDiscussionsStream({String? city}) {
    Query query = _database.child('discussions');
    
    return query.onValue.map((event) {
      List<Discussion> discussions = [];
      if (event.snapshot.value != null) {
        Map<dynamic, dynamic> values = event.snapshot.value as Map<dynamic, dynamic>;
        values.forEach((key, value) {
          try {
            Discussion discussion = Discussion.fromMap(Map<String, dynamic>.from(value));
            // Filter by city if provided
            if (city == null || city.isEmpty || 
                discussion.location.toLowerCase().contains(city.toLowerCase())) {
              discussions.add(discussion);
            }
          } catch (e) {
            print('Error parsing discussion: $e');
          }
        });
      }
      // Sort by date
      discussions.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      return discussions;
    });
  }

  // Get discussion by ID
  Future<Discussion?> getDiscussionById(String discussionId) async {
    try {
      DataSnapshot snapshot = await _database.child('discussions').child(discussionId).get();
      if (snapshot.exists) {
        return Discussion.fromMap(Map<String, dynamic>.from(snapshot.value as Map));
      }
      return null;
    } catch (e) {
      throw e.toString();
    }
  }

  // Join discussion
  Future<void> joinDiscussion(String discussionId, String userId) async {
    try {
      Discussion? discussion = await getDiscussionById(discussionId);
      if (discussion != null) {
        if (!discussion.participants.contains(userId)) {
          List<String> updatedParticipants = [...discussion.participants, userId];
          await _database.child('discussions').child(discussionId).update({
            'participants': updatedParticipants,
          });
        }
      }
    } catch (e) {
      throw e.toString();
    }
  }

  // Complete discussion
  Future<void> completeDiscussion(String discussionId) async {
    try {
      await _database.child('discussions').child(discussionId).update({
        'status': 'completed',
      });
    } catch (e) {
      throw e.toString();
    }
  }

  // Get user's hosted discussions
  Stream<List<Discussion>> getUserHostedDiscussions(String userId) {
    return getDiscussionsStream().map((discussions) {
      return discussions.where((d) => d.hostId == userId).toList();
    });
  }

  // Get user's joined discussions
  Stream<List<Discussion>> getUserJoinedDiscussions(String userId) {
    return getDiscussionsStream().map((discussions) {
      return discussions.where((d) => d.participants.contains(userId) && d.hostId != userId).toList();
    });
  }
}
