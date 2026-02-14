import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/review_model.dart';
import 'user_service.dart';

class ReviewService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final UserService _userService = UserService();

  // Submit a review
  Future<void> submitReview({
    required String discussionId,
    required String fromUserId,
    required String toUserId,
    required int rating,
  }) async {
    try {
      // Check if review already exists
      QuerySnapshot existingReview = await _firestore
          .collection('reviews')
          .where('discussionId', isEqualTo: discussionId)
          .where('fromUserId', isEqualTo: fromUserId)
          .where('toUserId', isEqualTo: toUserId)
          .get();

      if (existingReview.docs.isNotEmpty) {
        throw 'You have already reviewed this participant';
      }

      // Create review
      DocumentReference docRef = await _firestore.collection('reviews').add({
        'discussionId': discussionId,
        'fromUserId': fromUserId,
        'toUserId': toUserId,
        'rating': rating,
        'createdAt': Timestamp.now(),
      });

      await docRef.update({'id': docRef.id});

      // Update recipient's reputation score
      await _updateUserReputation(toUserId);
    } catch (e) {
      throw e.toString();
    }
  }

  // Check if user has reviewed a participant in a discussion
  Future<bool> hasReviewed({
    required String discussionId,
    required String fromUserId,
    required String toUserId,
  }) async {
    try {
      QuerySnapshot snapshot = await _firestore
          .collection('reviews')
          .where('discussionId', isEqualTo: discussionId)
          .where('fromUserId', isEqualTo: fromUserId)
          .where('toUserId', isEqualTo: toUserId)
          .get();

      return snapshot.docs.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  // Get all reviews for a user
  Future<List<Review>> getUserReviews(String userId) async {
    try {
      QuerySnapshot snapshot = await _firestore
          .collection('reviews')
          .where('toUserId', isEqualTo: userId)
          .get();

      return snapshot.docs
          .map((doc) => Review.fromMap(doc.data() as Map<String, dynamic>, doc.id))
          .toList();
    } catch (e) {
      throw e.toString();
    }
  }

  // Update user's reputation score
  Future<void> _updateUserReputation(String userId) async {
    try {
      // Get all reviews for the user
      List<Review> reviews = await getUserReviews(userId);

      if (reviews.isEmpty) return;

      // Calculate average rating
      double totalRating = 0;
      for (Review review in reviews) {
        totalRating += review.rating;
      }
      double averageRating = totalRating / reviews.length;

      // Update user's reputation score
      await _userService.updateReputationScore(
        userId,
        averageRating,
        reviews.length,
      );
    } catch (e) {
      throw e.toString();
    }
  }

  // Get reviews given by a user for a specific discussion
  Future<List<Review>> getUserReviewsForDiscussion({
    required String discussionId,
    required String fromUserId,
  }) async {
    try {
      QuerySnapshot snapshot = await _firestore
          .collection('reviews')
          .where('discussionId', isEqualTo: discussionId)
          .where('fromUserId', isEqualTo: fromUserId)
          .get();

      return snapshot.docs
          .map((doc) => Review.fromMap(doc.data() as Map<String, dynamic>, doc.id))
          .toList();
    } catch (e) {
      throw e.toString();
    }
  }
}
