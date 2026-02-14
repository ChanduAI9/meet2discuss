import 'package:cloud_firestore/cloud_firestore.dart';

class Review {
  final String id;
  final String discussionId;
  final String fromUserId;
  final String toUserId;
  final int rating; // 1-5 stars
  final DateTime createdAt;

  Review({
    required this.id,
    required this.discussionId,
    required this.fromUserId,
    required this.toUserId,
    required this.rating,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  // Convert to Firestore document
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'discussionId': discussionId,
      'fromUserId': fromUserId,
      'toUserId': toUserId,
      'rating': rating,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  // Create from Firestore document
  factory Review.fromMap(Map<String, dynamic> map, String documentId) {
    return Review(
      id: documentId,
      discussionId: map['discussionId'] ?? '',
      fromUserId: map['fromUserId'] ?? '',
      toUserId: map['toUserId'] ?? '',
      rating: map['rating'] ?? 0,
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }
}
