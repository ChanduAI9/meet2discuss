import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/discussion_model.dart';
import '../models/user_model.dart';
import '../services/discussion_service.dart';
import '../services/user_service.dart';
import '../services/review_service.dart';
import '../services/auth_service.dart';

class DiscussionDetailsScreen extends StatefulWidget {
  final String discussionId;

  const DiscussionDetailsScreen({
    super.key,
    required this.discussionId,
  });

  @override
  State<DiscussionDetailsScreen> createState() => _DiscussionDetailsScreenState();
}

class _DiscussionDetailsScreenState extends State<DiscussionDetailsScreen> {
  final _discussionService = DiscussionService();
  final _userService = UserService();
  final _reviewService = ReviewService();
  final _authService = AuthService();
  
  bool _isJoining = false;

  Future<void> _joinDiscussion(Discussion discussion) async {
    if (_authService.currentUser == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please login to join a discussion'),
          backgroundColor: Colors.orange,
        ),
      );
      Navigator.pushNamed(context, '/login');
      return;
    }

    setState(() => _isJoining = true);

    try {
      await _discussionService.joinDiscussion(
        widget.discussionId,
        _authService.currentUser!.uid,
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Successfully joined the discussion!'),
            backgroundColor: Color(0xFF22C55E),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isJoining = false);
    }
  }

  Future<void> _showReviewDialog(List<UserModel> participants) async {
    if (_authService.currentUser == null) return;

    // Get participants to review (exclude self)
    List<UserModel> participantsToReview = participants
        .where((user) => user.uid != _authService.currentUser!.uid)
        .toList();

    if (participantsToReview.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No other participants to review')),
      );
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _ReviewSheet(
        discussionId: widget.discussionId,
        participants: participantsToReview,
        reviewService: _reviewService,
        currentUserId: _authService.currentUser!.uid,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Discussion Details',
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: StreamBuilder<Discussion?>(
        stream: _discussionService.getDiscussionStream(widget.discussionId),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          Discussion? discussion = snapshot.data;
          if (discussion == null) {
            return const Center(child: Text('Discussion not found'));
          }

          bool isParticipant = _authService.currentUser != null &&
              discussion.participants.contains(_authService.currentUser!.uid);
          bool isCompleted = discussion.isCompleted;

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title and Description
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        discussion.title,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        discussion.description,
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey.shade700,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
                
                const Divider(),
                
                // Details
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      _DetailRow(
                        icon: Icons.calendar_today,
                        label: 'Date',
                        value: DateFormat('EEEE, MMM dd, yyyy').format(discussion.dateTime),
                      ),
                      const SizedBox(height: 12),
                      _DetailRow(
                        icon: Icons.access_time,
                        label: 'Time',
                        value: DateFormat('h:mm a').format(discussion.dateTime),
                      ),
                      const SizedBox(height: 12),
                      _DetailRow(
                        icon: Icons.location_on,
                        label: 'Location',
                        value: discussion.location,
                      ),
                      const SizedBox(height: 12),
                      _DetailRow(
                        icon: Icons.people,
                        label: 'Participants',
                        value: '${discussion.participants.length}/${discussion.maxParticipants}',
                      ),
                      if (isCompleted) ...[
                        const SizedBox(height: 12),
                        _DetailRow(
                          icon: Icons.check_circle,
                          label: 'Status',
                          value: 'Completed',
                          valueColor: const Color(0xFF22C55E),
                        ),
                      ],
                    ],
                  ),
                ),
                
                const Divider(),
                
                // Participants List
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Participants',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 16),
                      FutureBuilder<List<UserModel>>(
                        future: _userService.getUsersByIds(discussion.participants),
                        builder: (context, userSnapshot) {
                          if (userSnapshot.connectionState == ConnectionState.waiting) {
                            return const Center(child: CircularProgressIndicator());
                          }

                          List<UserModel> participants = userSnapshot.data ?? [];
                          
                          return Column(
                            children: participants.map((user) {
                              bool isHost = user.uid == discussion.hostId;
                              return _ParticipantTile(
                                user: user,
                                isHost: isHost,
                              );
                            }).toList(),
                          );
                        },
                      ),
                    ],
                  ),
                ),
                
                // Action Buttons
                if (!isCompleted && !isParticipant && !discussion.isFull)
                  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _isJoining ? null : () => _joinDiscussion(discussion),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF22C55E),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        child: _isJoining
                            ? const CircularProgressIndicator(color: Colors.white)
                            : const Text(
                                'Join Discussion',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                  ),
                
                // Review Button (shown after completion if user was a participant)
                if (isCompleted && isParticipant)
                  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: FutureBuilder<List<UserModel>>(
                        future: _userService.getUsersByIds(discussion.participants),
                        builder: (context, userSnapshot) {
                          return ElevatedButton.icon(
                            onPressed: () {
                              if (userSnapshot.hasData) {
                                _showReviewDialog(userSnapshot.data!);
                              }
                            },
                            icon: const Icon(Icons.star_outline),
                            label: const Text(
                              'Rate Participants',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF2563EB),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 0,
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                
                const SizedBox(height: 24),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.grey.shade600),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: valueColor ?? Colors.black87,
          ),
        ),
      ],
    );
  }
}

class _ParticipantTile extends StatelessWidget {
  final UserModel user;
  final bool isHost;

  const _ParticipantTile({
    required this.user,
    required this.isHost,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: const Color(0xFF2563EB),
            child: Text(
              user.name[0].toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      user.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                    if (isHost) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF22C55E),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'Host',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  user.professionalRole,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
          if (user.shouldShowReputation)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB).withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.star,
                    size: 16,
                    color: Color(0xFFFFB700),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    user.reputationDisplay,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

// Review Sheet
class _ReviewSheet extends StatefulWidget {
  final String discussionId;
  final List<UserModel> participants;
  final ReviewService reviewService;
  final String currentUserId;

  const _ReviewSheet({
    required this.discussionId,
    required this.participants,
    required this.reviewService,
    required this.currentUserId,
  });

  @override
  State<_ReviewSheet> createState() => _ReviewSheetState();
}

class _ReviewSheetState extends State<_ReviewSheet> {
  final Map<String, int> _ratings = {};
  bool _isSubmitting = false;

  Future<void> _submitReviews() async {
    if (_ratings.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please rate at least one participant')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      for (var entry in _ratings.entries) {
        await widget.reviewService.submitReview(
          discussionId: widget.discussionId,
          fromUserId: widget.currentUserId,
          toUserId: entry.key,
          rating: entry.value,
        );
      }

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Reviews submitted successfully!'),
            backgroundColor: Color(0xFF22C55E),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              'Rate Participants',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              'Help build our community by rating contributions',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Flexible(
            child: ListView.builder(
              shrinkWrap: true,
              padding: const EdgeInsets.symmetric(horizontal: 24),
              itemCount: widget.participants.length,
              itemBuilder: (context, index) {
                UserModel user = widget.participants[index];
                return _RatingTile(
                  user: user,
                  rating: _ratings[user.uid] ?? 0,
                  onRatingChanged: (rating) {
                    setState(() {
                      _ratings[user.uid] = rating;
                    });
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitReviews,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF22C55E),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubmitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Submit Reviews',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _RatingTile extends StatelessWidget {
  final UserModel user;
  final int rating;
  final Function(int) onRatingChanged;

  const _RatingTile({
    required this.user,
    required this.rating,
    required this.onRatingChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            user.name,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            user.professionalRole,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: List.generate(5, (index) {
              return GestureDetector(
                onTap: () => onRatingChanged(index + 1),
                child: Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: Icon(
                    index < rating ? Icons.star : Icons.star_border,
                    color: const Color(0xFFFFB700),
                    size: 32,
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
