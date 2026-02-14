import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/discussion_model.dart';
import 'user_service.dart';

class DiscussionService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final UserService _userService = UserService();

  // Create a new discussion
  Future<String> createDiscussion({
    required String hostId,
    required String title,
    required String description,
    required String location,
    required DateTime dateTime,
    required int maxParticipants,
  }) async {
    try {
      // Create discussion document
      DocumentReference docRef = await _firestore.collection('discussions').add({
        'hostId': hostId,
        'title': title,
        'description': description,
        'location': location,
        'dateTime': Timestamp.fromDate(dateTime),
        'maxParticipants': maxParticipants,
        'participants': [hostId],
        'status': 'upcoming',
        'createdAt': Timestamp.now(),
      });

      // Update discussion with its ID
      await docRef.update({'id': docRef.id});

      // Increment host's discussions hosted count
      await _userService.incrementDiscussionsHosted(hostId);

      return docRef.id;
    } catch (e) {
      throw e.toString();
    }
  }

  // Get all upcoming discussions
  Stream<List<Discussion>> getUpcomingDiscussions({String? city}) {
    Query query = _firestore
        .collection('discussions')
        .where('status', isEqualTo: 'upcoming')
        .orderBy('dateTime', descending: false);

    // For MVP, filter by city in the location field if provided
    if (city != null && city.isNotEmpty) {
      // This is a simple text match - in production, use proper location filtering
      return query.snapshots().map((snapshot) {
        return snapshot.docs
            .map((doc) => Discussion.fromMap(doc.data() as Map<String, dynamic>, doc.id))
            .where((discussion) => 
                discussion.location.toLowerCase().contains(city.toLowerCase()))
            .toList();
      });
    }

    return query.snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => Discussion.fromMap(doc.data() as Map<String, dynamic>, doc.id))
          .toList();
    });
  }

  // Get discussion by ID
  Future<Discussion?> getDiscussionById(String discussionId) async {
    try {
      DocumentSnapshot doc = await _firestore.collection('discussions').doc(discussionId).get();
      if (doc.exists) {
        return Discussion.fromMap(doc.data() as Map<String, dynamic>, doc.id);
      }
      return null;
    } catch (e) {
      throw e.toString();
    }
  }

  // Get discussion stream
  Stream<Discussion?> getDiscussionStream(String discussionId) {
    return _firestore.collection('discussions').doc(discussionId).snapshots().map((snapshot) {
      if (snapshot.exists) {
        return Discussion.fromMap(snapshot.data() as Map<String, dynamic>, snapshot.id);
      }
      return null;
    });
  }

  // Join a discussion
  Future<void> joinDiscussion(String discussionId, String userId) async {
    try {
      DocumentSnapshot doc = await _firestore.collection('discussions').doc(discussionId).get();
      
      if (!doc.exists) {
        throw 'Discussion not found';
      }

      Discussion discussion = Discussion.fromMap(doc.data() as Map<String, dynamic>, doc.id);

      // Check if already a participant
      if (discussion.participants.contains(userId)) {
        throw 'Already joined this discussion';
      }

      // Check if discussion is full
      if (discussion.isFull) {
        throw 'Discussion is full';
      }

      // Add user to participants
      await _firestore.collection('discussions').doc(discussionId).update({
        'participants': FieldValue.arrayUnion([userId]),
      });

      // Increment user's discussions attended count
      await _userService.incrementDiscussionsAttended(userId);
    } catch (e) {
      throw e.toString();
    }
  }

  // Mark discussion as completed
  Future<void> markAsCompleted(String discussionId) async {
    try {
      await _firestore.collection('discussions').doc(discussionId).update({
        'status': 'completed',
      });
    } catch (e) {
      throw e.toString();
    }
  }

  // Get user's hosted discussions
  Stream<List<Discussion>> getUserHostedDiscussions(String userId) {
    return _firestore
        .collection('discussions')
        .where('hostId', isEqualTo: userId)
        .orderBy('dateTime', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => Discussion.fromMap(doc.data() as Map<String, dynamic>, doc.id))
          .toList();
    });
  }

  // Get user's attended discussions
  Stream<List<Discussion>> getUserAttendedDiscussions(String userId) {
    return _firestore
        .collection('discussions')
        .where('participants', arrayContains: userId)
        .orderBy('dateTime', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => Discussion.fromMap(doc.data() as Map<String, dynamic>, doc.id))
          .where((discussion) => discussion.hostId != userId)
          .toList();
    });
  }
}
