import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/discussion_model.dart';
import '../models/user_model.dart';
import '../services/discussion_service.dart';
import '../services/user_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../widgets/premium_widgets.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _discussionService = DiscussionService();
  final _userService = UserService();
  final _authService = AuthService();
  String _selectedCity = '';
  String _selectedCategory = 'All';
  final _searchController = TextEditingController();
  
  final List<String> _categories = [
    'All',
    'Business',
    'Technology',
    'AI',
    'Startups',
    'Career Growth',
    'Philosophy',
    'Finance',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Premium Header
              _buildHeader(),
              
              // Search Bar
              _buildSearchBar(),
              
              // Category Chips
              _buildCategoryChips(),
              
              // Discussion List
              Expanded(
                child: _buildDiscussionList(),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: _buildFloatingButton(),
    );
  }
  
  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacingLarge),
      child: Row(
        children: [
          // Location Selector
          Expanded(
            child: GestureDetector(
              onTap: _showCitySelector,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppTheme.spacingMedium,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.location_on_rounded,
                      color: AppTheme.primaryBlue,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _selectedCity.isEmpty ? 'All Cities' : _selectedCity,
                        style: AppTheme.bodyLarge.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const Icon(
                      Icons.keyboard_arrow_down_rounded,
                      color: AppTheme.textSecondary,
                      size: 20,
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          
          // Profile Button
          GestureDetector(
            onTap: () {
              if (_authService.currentUser != null) {
                Navigator.pushNamed(context, '/profile');
              } else {
                Navigator.pushNamed(context, '/login');
              }
            },
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                shape: BoxShape.circle,
                boxShadow: AppTheme.elevatedShadow,
              ),
              child: const Icon(
                Icons.person_rounded,
                color: Colors.white,
                size: 24,
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacingLarge),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
          boxShadow: AppTheme.cardShadow,
        ),
        child: TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: 'Search discussions, topics...',
            hintStyle: AppTheme.bodyMedium,
            prefixIcon: const Icon(
              Icons.search_rounded,
              color: AppTheme.textSecondary,
            ),
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppTheme.spacingMedium,
              vertical: 16,
            ),
          ),
          onChanged: (value) => setState(() {}),
        ),
      ),
    );
  }
  
  Widget _buildCategoryChips() {
    return Container(
      height: 50,
      margin: const EdgeInsets.only(
        top: AppTheme.spacingLarge,
        bottom: AppTheme.spacingMedium,
      ),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacingLarge),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: CategoryChip(
              label: _categories[index],
              selected: _selectedCategory == _categories[index],
              onTap: () {
                setState(() {
                  _selectedCategory = _categories[index];
                });
              },
            ),
          );
        },
      ),
    );
  }
  
  Widget _buildDiscussionList() {
    return StreamBuilder<List<Discussion>>(
      stream: _discussionService.getUpcomingDiscussions(
        city: _selectedCity.isEmpty ? null : _selectedCity,
      ),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return _buildErrorState(snapshot.error.toString());
        }

        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryBlue),
            ),
          );
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
          return _buildEmptyState();
        }

        return ListView.builder(
          padding: const EdgeInsets.symmetric(
            horizontal: AppTheme.spacingLarge,
            vertical: AppTheme.spacingMedium,
          ),
          itemCount: discussions.length + (discussions.isNotEmpty ? 1 : 0),
          itemBuilder: (context, index) {
            if (index == 0 && discussions.isNotEmpty) {
              return _FeaturedDiscussionCard(
                discussion: discussions[0],
                userService: _userService,
                onTap: () => _navigateToDetails(discussions[0].id),
              );
            }
            
            final actualIndex = discussions.length == 1 ? 0 : index - 1;
            return _DiscussionCard(
              discussion: discussions[actualIndex],
              userService: _userService,
              onTap: () => _navigateToDetails(discussions[actualIndex].id),
            );
          },
        );
      },
    );
  }
  
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: AppTheme.primaryBlue.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.forum_rounded,
              size: 64,
              color: AppTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'No Discussions Yet',
            style: AppTheme.heading3,
          ),
          const SizedBox(height: 8),
          Text(
            'Be the first to start an\nintellectual conversation!',
            style: AppTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
  
  Widget _buildErrorState(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline_rounded,
            size: 64,
            color: AppTheme.error,
          ),
          const SizedBox(height: 16),
          Text(
            'Something went wrong',
            style: AppTheme.heading3,
          ),
          const SizedBox(height: 8),
          Text(
            error,
            style: AppTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
  
  Widget _buildFloatingButton() {
    return PremiumButton(
      text: 'Create Discussion',
      icon: Icons.add_rounded,
      onPressed: () {
        if (_authService.currentUser != null) {
          Navigator.pushNamed(context, '/create-discussion');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Please login to create a discussion'),
              backgroundColor: AppTheme.warning,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
              ),
            ),
          );
          Navigator.pushNamed(context, '/login');
        }
      },
    );
  }
  
  void _showCitySelector() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppTheme.radiusXLarge),
          ),
        ),
        padding: const EdgeInsets.all(AppTheme.spacingLarge),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppTheme.textTertiary.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text('Select City', style: AppTheme.heading3),
            const SizedBox(height: 20),
            ...[
              'All Cities',
              'Hyderabad',
              'Bangalore',
              'Mumbai',
              'Delhi',
              'Pune',
              'Chennai',
              'Kolkata'
            ].map((city) => ListTile(
                  onTap: () {
                    setState(() {
                      _selectedCity = city == 'All Cities' ? '' : city;
                    });
                    Navigator.pop(context);
                  },
                  title: Text(
                    city,
                    style: AppTheme.bodyLarge.copyWith(
                      fontWeight: (_selectedCity.isEmpty && city == 'All Cities') ||
                              _selectedCity == city
                          ? FontWeight.bold
                          : FontWeight.normal,
                      color: (_selectedCity.isEmpty && city == 'All Cities') ||
                              _selectedCity == city
                          ? AppTheme.primaryBlue
                          : AppTheme.textPrimary,
                    ),
                  ),
                  trailing: (_selectedCity.isEmpty && city == 'All Cities') ||
                          _selectedCity == city
                      ? const Icon(Icons.check, color: AppTheme.primaryBlue)
                      : null,
                )),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
  
  void _navigateToDetails(String discussionId) {
    Navigator.pushNamed(
      context,
      '/discussion-details',
      arguments: discussionId,
    );
  }
}

// Featured Discussion Card - Large Premium Card
class _FeaturedDiscussionCard extends StatelessWidget {
  final Discussion discussion;
  final UserService userService;
  final VoidCallback onTap;

  const _FeaturedDiscussionCard({
    required this.discussion,
    required this.userService,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('MMM dd, yyyy • h:mm a');
    
    return FutureBuilder<UserModel?>(
      future: userService.getUserById(discussion.hostId),
      builder: (context, snapshot) {
        final host = snapshot.data;
        
        return Container(
          margin: const EdgeInsets.only(bottom: AppTheme.spacingLarge),
          child: PremiumCard(
            elevated: true,
            onTap: onTap,
            padding: EdgeInsets.zero,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Gradient Header
                Container(
                  padding: const EdgeInsets.all(AppTheme.spacingLarge),
                  decoration: const BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(AppTheme.radiusLarge),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.accentGreen,
                              borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                            ),
                            child: Row(
                              children: const [
                                Icon(
                                  Icons.stars_rounded,
                                  color: Colors.white,
                                  size: 14,
                                ),
                                SizedBox(width: 4),
                                Text(
                                  'FEATURED',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        discussion.title,
                        style: AppTheme.heading2.copyWith(
                          color: Colors.white,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                
                // Content
                Padding(
                  padding: const EdgeInsets.all(AppTheme.spacingLarge),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Host Info
                      if (host != null) ...[
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 24,
                              backgroundColor: AppTheme.primaryBlue,
                              child: Text(
                                host.name[0].toUpperCase(),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 20,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    host.name,
                                    style: AppTheme.bodyLarge.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      LevelBadge(level: host.level, size: 12),
                                      const SizedBox(width: 8),
                                      ReputationScore(
                                        score: host.reputationScore,
                                        totalReviews: host.totalReviews,
                                        size: 16,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                      ],
                      
                      // Description
                      Text(
                        discussion.description,
                        style: AppTheme.bodyMedium,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 20),
                      
                      // Date & Time
                      Row(
                        children: [
                          Icon(
                            Icons.calendar_today_rounded,
                            size: 18,
                            color: AppTheme.primaryBlue,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            dateFormat.format(discussion.dateTime),
                            style: AppTheme.bodyMedium.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      
                      // Location
                      Row(
                        children: [
                          Icon(
                            Icons.location_on_rounded,
                            size: 18,
                            color: AppTheme.error,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              discussion.location,
                              style: AppTheme.bodyMedium.copyWith(
                                color: AppTheme.textPrimary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      
                      // Bottom Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          ParticipantAvatarStack(
                            participantIds: discussion.participants,
                            maxParticipants: discussion.maxParticipants,
                            size: 36,
                          ),
                          SpotsIndicator(
                            spotsLeft: discussion.maxParticipants - discussion.participants.length,
                            totalSpots: discussion.maxParticipants,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// Regular Discussion Card
class _DiscussionCard extends StatelessWidget {
  final Discussion discussion;
  final UserService userService;
  final VoidCallback onTap;

  const _DiscussionCard({
    required this.discussion,
    required this.userService,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('MMM dd • h:mm a');

    return FutureBuilder<UserModel?>(
      future: userService.getUserById(discussion.hostId),
      builder: (context, snapshot) {
        final host = snapshot.data;
        
        return Container(
          margin: const EdgeInsets.only(bottom: AppTheme.spacingMedium),
          child: PremiumCard(
            onTap: onTap,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(
                  discussion.title,
                  style: AppTheme.heading3,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                
                // Host Info
                if (host != null) ...[
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: AppTheme.primaryBlue,
                        child: Text(
                          host.name[0].toUpperCase(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              host.name,
                              style: AppTheme.bodyMedium.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Row(
                              children: [
                                LevelBadge(level: host.level, size: 10),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
                
                // Date & Location
                Row(
                  children: [
                    Icon(
                      Icons.schedule_rounded,
                      size: 14,
                      color: AppTheme.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      dateFormat.format(discussion.dateTime),
                      style: AppTheme.bodySmall.copyWith(
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Icon(
                      Icons.location_on_rounded,
                      size: 14,
                      color: AppTheme.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        discussion.location,
                        style: AppTheme.bodySmall.copyWith(
                          color: AppTheme.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Bottom Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    ParticipantAvatarStack(
                      participantIds: discussion.participants,
                      maxParticipants: discussion.maxParticipants,
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        gradient: discussion.isFull ? null : AppTheme.primaryGradient,
                        color: discussion.isFull ? AppTheme.textTertiary.withOpacity(0.2) : null,
                        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                      ),
                      child: Text(
                        discussion.isFull ? 'Full' : 'View Details',
                        style: AppTheme.bodySmall.copyWith(
                          color: discussion.isFull ? AppTheme.textSecondary : Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

