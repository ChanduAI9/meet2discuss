class Discussion {
  final String id;
  final String hostId;
  final String title;
  final String description;
  final String location;
  final DateTime dateTime;
  final int maxParticipants;
  final List<String> participants;
  final String status; // 'upcoming' or 'completed'
  final DateTime createdAt;

  Discussion({
    required this.id,
    required this.hostId,
    required this.title,
    required this.description,
    required this.location,
    required this.dateTime,
    required this.maxParticipants,
    List<String>? participants,
    this.status = 'upcoming',
    DateTime? createdAt,
  })  : participants = participants ?? [hostId],
        createdAt = createdAt ?? DateTime.now();

  // Check if discussion is full
  bool get isFull => participants.length >= maxParticipants;

  // Check if discussion is completed
  bool get isCompleted => status == 'completed' || DateTime.now().isAfter(dateTime);

  // Get current status based on dateTime
  String get currentStatus {
    if (DateTime.now().isAfter(dateTime)) {
      return 'completed';
    }
    return 'upcoming';
  }

  // Convert to Realtime Database document
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'hostId': hostId,
      'title': title,
      'description': description,
      'location': location,
      'dateTime': dateTime.toIso8601String(),
      'maxParticipants': maxParticipants,
      'participants': participants,
      'status': currentStatus,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  // Create from Realtime Database document
  factory Discussion.fromMap(Map<dynamic, dynamic> map, String documentId) {
    return Discussion(
      id: documentId,
      hostId: map['hostId'] ?? '',
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      location: map['location'] ?? '',
      dateTime: map['dateTime'] != null
          ? DateTime.parse(map['dateTime'])
          : DateTime.now(),
      maxParticipants: map['maxParticipants'] ?? 10,
      participants: List<String>.from(map['participants'] ?? []),
      status: map['status'] ?? 'upcoming',
      createdAt: map['createdAt'] != null
          ? DateTime.parse(map['createdAt'])
          : DateTime.now(),
    );
  }

  // Create copy with updated fields
  Discussion copyWith({
    String? title,
    String? description,
    String? location,
    DateTime? dateTime,
    int? maxParticipants,
    List<String>? participants,
    String? status,
  }) {
    return Discussion(
      id: id,
      hostId: hostId,
      title: title ?? this.title,
      description: description ?? this.description,
      location: location ?? this.location,
      dateTime: dateTime ?? this.dateTime,
      maxParticipants: maxParticipants ?? this.maxParticipants,
      participants: participants ?? this.participants,
      status: status ?? this.status,
      createdAt: createdAt,
    );
  }
}
