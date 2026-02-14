import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/discussion_model.dart';
import '../services/discussion_service.dart';
import '../services/auth_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _discussionService = DiscussionService();
  final _authService = AuthService();
  String _selectedCity = '';
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            const Icon(Icons.location_on, color: Color(0xFF2563EB)),
            const SizedBox(width: 8),
            DropdownButton<String>(
              value: _selectedCity.isEmpty ? null : _selectedCity,
              hint: const Text('All Cities'),
              underline: const SizedBox(),
              items: ['All Cities', 'Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Pune']
                  .map((city) => DropdownMenuItem(
                        value: city == 'All Cities' ? '' : city,
                        child: Text(
                          city,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ),
                        ),
                      ))
                  .toList(),
              onChanged: (value) {
                setState(() {
                  _selectedCity = value ?? '';
                });
              },
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline, color: Colors.black87),
            onPressed: () {
              if (_authService.currentUser != null) {
                Navigator.pushNamed(context, '/profile');
              } else {
                Navigator.pushNamed(context, '/login');
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout_outlined, color: Colors.black87),
            onPressed: () async {
              await _authService.signOut();
              if (mounted) {
                Navigator.pushReplacementNamed(context, '/');
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search discussions...',
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              onChanged: (value) => setState(() {}),
            ),
          ),
          // Discussion List
          Expanded(
            child: StreamBuilder<List<Discussion>>(
              stream: _discussionService.getUpcomingDiscussions(
                city: _selectedCity.isEmpty ? null : _selectedCity,
              ),
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  return Center(
                    child: Text('Error: ${snapshot.error}'),
                  );
                }

                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                List<Discussion> discussions = snapshot.data ?? [];

                // Filter by search
                if (_searchController.text.isNotEmpty) {
                  discussions = discussions.where((d) {
                    return d.title.toLowerCase().contains(_searchController.text.toLowerCase()) ||
                           d.description.toLowerCase().contains(_searchController.text.toLowerCase());
                  }).toList();
                }

                if (discussions.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.forum_outlined,
                          size: 80,
                          color: Colors.grey.shade300,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No discussions found',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey.shade600,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Be the first to create one!',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey.shade500,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: discussions.length,
                  itemBuilder: (context, index) {
                    Discussion discussion = discussions[index];
                    return _DiscussionCard(
                      discussion: discussion,
                      onTap: () {
                        Navigator.pushNamed(
                          context,
                          '/discussion-details',
                          arguments: discussion.id,
                        );
                      },
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          if (_authService.currentUser != null) {
            Navigator.pushNamed(context, '/create-discussion');
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Please login to create a discussion'),
                backgroundColor: Colors.orange,
              ),
            );
            Navigator.pushNamed(context, '/login');
          }
        },
        backgroundColor: const Color(0xFF22C55E),
        icon: const Icon(Icons.add),
        label: const Text(
          'Create',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}

class _DiscussionCard extends StatelessWidget {
  final Discussion discussion;
  final VoidCallback onTap;

  const _DiscussionCard({
    required this.discussion,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('MMM dd, yyyy');
    final timeFormat = DateFormat('h:mm a');

    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title
              Text(
                discussion.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              // Description
              Text(
                discussion.description,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              // Date and Time
              Row(
                children: [
                  Icon(Icons.calendar_today, size: 16, color: Colors.grey.shade600),
                  const SizedBox(width: 4),
                  Text(
                    dateFormat.format(discussion.dateTime),
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade600,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(Icons.access_time, size: 16, color: Colors.grey.shade600),
                  const SizedBox(width: 4),
                  Text(
                    timeFormat.format(discussion.dateTime),
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Location
              Row(
                children: [
                  Icon(Icons.location_on, size: 16, color: Colors.grey.shade600),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      discussion.location,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey.shade600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Participants and Join Button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.people, size: 18, color: Colors.grey.shade700),
                      const SizedBox(width: 4),
                      Text(
                        '${discussion.participants.length}/${discussion.maxParticipants} participants',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey.shade700,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: discussion.isFull
                          ? Colors.grey.shade300
                          : const Color(0xFF2563EB),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      discussion.isFull ? 'Full' : 'View',
                      style: TextStyle(
                        color: discussion.isFull ? Colors.grey.shade700 : Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
