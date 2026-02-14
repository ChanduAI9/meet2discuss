import 'package:firebase_database/firebase_database.dart';
import '../models/review_model.dart';
import 'user_service.dart';

class ReviewService {
  final DatabaseReference _reviewsRef =
      FirebaseDatabase.instance.ref().child('reviews');
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
      final existingReview = await hasReviewed(
        discussionId: discussionId,
        fromUserId: fromUserId,
        toUserId: toUserId,
      );

      if (existingReview) {
        throw 'You have already reviewed this participant';
      }

      // Create review
      final newReviewRef = _reviewsRef.push();
      final review = {
        'id': newReviewRef.key!,
        'discussionId': discussionId,
        'fromUserId': fromUserId,
        'toUserId': toUserId,
        'rating': rating,
        'createdAt': DateTime.now().toIso8601String(),
      };

      await newReviewRef.set(review);

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
      final snapshot = await _reviewsRef
          .orderByChild('discussionId')
          .equalTo(discussionId)
          .get();

      if (!snapshot.exists) {
        return false;
      }

      final data = snapshot.value as Map<dynamic, dynamic>;
      for (var entry in data.entries) {
        final review = entry.value as Map<dynamic, dynamic>;
        if (review['fromUserId'] == fromUserId &&
            review['toUserId'] == toUserId) {
          return true;
        }
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  // Get all reviews for a user
  Future<List<Review>> getUserReviews(String userId) async {
    try {
      final snapshot = await _reviewsRef
          .orderByChild('toUserId')
          .equalTo(userId)
          .get();

      if (!snapshot.exists) {
        return [];
      }

      final reviews = <Review>[];
      final data = snapshot.value as Map<dynamic, dynamic>;
      data.forEach((key, value) {
        reviews.add(Review.fromMap(value as Map<dynamic, dynamic>, key));
      });

      return reviews;
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
      final snapshot = await _reviewsRef
          .orderByChild('discussionId')
          .equalTo(discussionId)
          .get();

      if (!snapshot.exists) {
        return [];
      }

      final reviews = <Review>[];
      final data = snapshot.value as Map<dynamic, dynamic>;
      data.forEach((key, value) {
        final review = value as Map<dynamic, dynamic>;
        if (review['fromUserId'] == fromUserId) {
          reviews.add(Review.fromMap(review, key));
        }
      });

      return reviews;
    } catch (e) {
      throw e.toString();
    }
  }
}
