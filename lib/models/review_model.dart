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

  // Convert to Realtime Database document
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'discussionId': discussionId,
      'fromUserId': fromUserId,
      'toUserId': toUserId,
      'rating': rating,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  // Create from Realtime Database document
  factory Review.fromMap(Map<dynamic, dynamic> map, String documentId) {
    return Review(
      id: documentId,
      discussionId: map['discussionId'] ?? '',
      fromUserId: map['fromUserId'] ?? '',
      toUserId: map['toUserId'] ?? '',
      rating: map['rating'] ?? 0,
      createdAt: map['createdAt'] != null
          ? DateTime.parse(map['createdAt'])
          : DateTime.now(),
    );
  }
}
