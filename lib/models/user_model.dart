import 'package:cloud_firestore/cloud_firestore.dart';

class UserModel {
  final String uid;
  final String name;
  final String email;
  final String? profilePhoto;
  final String professionalRole;
  final List<String> expertise;
  final int yearsOfExperience;
  final double reputationScore;
  final int totalReviews;
  final int discussionsHosted;
  final int discussionsAttended;
  final String level;
  final DateTime createdAt;

  UserModel({
    required this.uid,
    required this.name,
    required this.email,
    this.profilePhoto,
    required this.professionalRole,
    required this.expertise,
    required this.yearsOfExperience,
    this.reputationScore = 0.0,
    this.totalReviews = 0,
    this.discussionsHosted = 0,
    this.discussionsAttended = 0,
    String? level,
    DateTime? createdAt,
  })  : level = level ?? _calculateLevel(reputationScore),
        createdAt = createdAt ?? DateTime.now();

  // Auto-calculate level based on reputation score
  static String _calculateLevel(double score) {
    if (score >= 4.4) return 'Authority';
    if (score >= 3.6) return 'Specialist';
    if (score >= 2.6) return 'Contributor';
    return 'Learner';
  }

  // Calculate level for current instance
  String get calculatedLevel => _calculateLevel(reputationScore);

  // Check if reputation should be displayed
  bool get shouldShowReputation => totalReviews >= 3;

  // Get reputation display text
  String get reputationDisplay =>
      shouldShowReputation ? reputationScore.toStringAsFixed(1) : 'New Member';

  // Convert to Firestore document
  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'name': name,
      'email': email,
      'profilePhoto': profilePhoto,
      'professionalRole': professionalRole,
      'expertise': expertise,
      'yearsOfExperience': yearsOfExperience,
      'reputationScore': reputationScore,
      'totalReviews': totalReviews,
      'discussionsHosted': discussionsHosted,
      'discussionsAttended': discussionsAttended,
      'level': calculatedLevel,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  // Create from Firestore document
  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      uid: map['uid'] ?? '',
      name: map['name'] ?? '',
      email: map['email'] ?? '',
      profilePhoto: map['profilePhoto'],
      professionalRole: map['professionalRole'] ?? '',
      expertise: List<String>.from(map['expertise'] ?? []),
      yearsOfExperience: map['yearsOfExperience'] ?? 0,
      reputationScore: (map['reputationScore'] ?? 0.0).toDouble(),
      totalReviews: map['totalReviews'] ?? 0,
      discussionsHosted: map['discussionsHosted'] ?? 0,
      discussionsAttended: map['discussionsAttended'] ?? 0,
      level: map['level'],
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  // Create copy with updated fields
  UserModel copyWith({
    String? name,
    String? profilePhoto,
    String? professionalRole,
    List<String>? expertise,
    int? yearsOfExperience,
    double? reputationScore,
    int? totalReviews,
    int? discussionsHosted,
    int? discussionsAttended,
  }) {
    return UserModel(
      uid: uid,
      name: name ?? this.name,
      email: email,
      profilePhoto: profilePhoto ?? this.profilePhoto,
      professionalRole: professionalRole ?? this.professionalRole,
      expertise: expertise ?? this.expertise,
      yearsOfExperience: yearsOfExperience ?? this.yearsOfExperience,
      reputationScore: reputationScore ?? this.reputationScore,
      totalReviews: totalReviews ?? this.totalReviews,
      discussionsHosted: discussionsHosted ?? this.discussionsHosted,
      discussionsAttended: discussionsAttended ?? this.discussionsAttended,
      createdAt: createdAt,
    );
  }
}
