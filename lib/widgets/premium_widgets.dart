import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class PremiumCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final bool elevated;

  const PremiumCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.elevated = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: padding ?? const EdgeInsets.all(AppTheme.spacingLarge),
        decoration: elevated
            ? AppTheme.elevatedCardDecoration
            : AppTheme.cardDecoration,
        child: child,
      ),
    );
  }
}

class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;

  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: padding ?? const EdgeInsets.all(AppTheme.spacingLarge),
        decoration: AppTheme.glassDecoration,
        child: child,
      ),
    );
  }
}

class CategoryChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback? onTap;

  const CategoryChip({
    super.key,
    required this.label,
    this.selected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 10,
        ),
        decoration: BoxDecoration(
          gradient: selected ? AppTheme.primaryGradient : null,
          color: selected ? null : Colors.white,
          borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
          border: Border.all(
            color: selected ? Colors.transparent : AppTheme.textTertiary.withOpacity(0.2),
            width: 1.5,
          ),
          boxShadow: selected ? AppTheme.cardShadow : null,
        ),
        child: Text(
          label,
          style: AppTheme.bodyMedium.copyWith(
            color: selected ? Colors.white : AppTheme.textSecondary,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
      ),
    );
  }
}

class LevelBadge extends StatelessWidget {
  final String level;
  final double? size;

  const LevelBadge({
    super.key,
    required this.level,
    this.size,
  });

  Color get _badgeColor {
    switch (level) {
      case 'Authority':
        return const Color(0xFF8B5CF6);
      case 'Specialist':
        return const Color(0xFF3B82F6);
      case 'Contributor':
        return AppTheme.accentGreen;
      default:
        return AppTheme.textSecondary;
    }
  }

  IconData get _badgeIcon {
    switch (level) {
      case 'Authority':
        return Icons.workspace_premium;
      case 'Specialist':
        return Icons.verified;
      case 'Contributor':
        return Icons.stars;
      default:
        return Icons.person;
    }
  }

  @override
  Widget build(BuildContext context) {
    final double badgeSize = size ?? 14.0;
    
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: badgeSize * 0.8,
        vertical: badgeSize * 0.4,
      ),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [_badgeColor, _badgeColor.withOpacity(0.8)],
        ),
        borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
        boxShadow: [
          BoxShadow(
            color: _badgeColor.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _badgeIcon,
            size: badgeSize,
            color: Colors.white,
          ),
          SizedBox(width: badgeSize * 0.4),
          Text(
            level,
            style: TextStyle(
              fontSize: badgeSize * 0.9,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class ReputationScore extends StatelessWidget {
  final double score;
  final int totalReviews;
  final double size;

  const ReputationScore({
    super.key,
    required this.score,
    required this.totalReviews,
    this.size = 24,
  });

  @override
  Widget build(BuildContext context) {
    if (totalReviews < 3) {
      return Container(
        padding: EdgeInsets.symmetric(
          horizontal: size * 0.6,
          vertical: size * 0.3,
        ),
        decoration: BoxDecoration(
          color: AppTheme.textTertiary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
        ),
        child: Text(
          'New Member',
          style: TextStyle(
            fontSize: size * 0.5,
            fontWeight: FontWeight.w600,
            color: AppTheme.textSecondary,
          ),
        ),
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          Icons.star_rounded,
          color: AppTheme.gold,
          size: size,
        ),
        SizedBox(width: size * 0.2),
        Text(
          score.toStringAsFixed(1),
          style: TextStyle(
            fontSize: size * 0.7,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        SizedBox(width: size * 0.1),
        Text(
          '($totalReviews)',
          style: TextStyle(
            fontSize: size * 0.5,
            color: AppTheme.textSecondary,
          ),
        ),
      ],
    );
  }
}

class PremiumButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool loading;
  final bool secondary;
  final IconData? icon;

  const PremiumButton({
    super.key,
    required this.text,
    this.onPressed,
    this.loading = false,
    this.secondary = false,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: secondary ? null : AppTheme.primaryGradient,
        color: secondary ? Colors.white : null,
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        border: secondary
            ? Border.all(color: AppTheme.primaryBlue, width: 2)
            : null,
        boxShadow: secondary ? null : AppTheme.elevatedShadow,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
          onTap: loading ? null : onPressed,
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 24,
              vertical: 16,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (loading)
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        secondary ? AppTheme.primaryBlue : Colors.white,
                      ),
                    ),
                  )
                else ...[
                  if (icon != null) ...[
                    Icon(
                      icon,
                      color: secondary ? AppTheme.primaryBlue : Colors.white,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    text,
                    style: AppTheme.bodyLarge.copyWith(
                      color: secondary ? AppTheme.primaryBlue : Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class ParticipantAvatarStack extends StatelessWidget {
  final List<String> participantIds;
  final int maxParticipants;
  final double size;

  const ParticipantAvatarStack({
    super.key,
    required this.participantIds,
    required this.maxParticipants,
    this.size = 32,
  });

  @override
  Widget build(BuildContext context) {
    final displayCount = participantIds.length > 3 ? 3 : participantIds.length;
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: size * (displayCount * 0.7 + 0.3),
          height: size,
          child: Stack(
            children: List.generate(displayCount, (index) {
              return Positioned(
                left: index * size * 0.7,
                child: Container(
                  width: size,
                  height: size,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryBlue,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: Center(
                    child: Text(
                      String.fromCharCode(65 + index),
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: size * 0.4,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          '${participantIds.length}/$maxParticipants',
          style: AppTheme.bodySmall.copyWith(
            fontWeight: FontWeight.w600,
            color: AppTheme.textSecondary,
          ),
        ),
      ],
    );
  }
}

class SpotsIndicator extends StatelessWidget {
  final int spotsLeft;
  final int totalSpots;

  const SpotsIndicator({
    super.key,
    required this.spotsLeft,
    required this.totalSpots,
  });

  @override
  Widget build(BuildContext context) {
    final Color color = spotsLeft <= 2
        ? AppTheme.error
        : spotsLeft <= 5
            ? AppTheme.warning
            : AppTheme.success;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            spotsLeft == 0 ? Icons.block : Icons.group,
            size: 14,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            spotsLeft == 0 ? 'Full' : '$spotsLeft spots left',
            style: AppTheme.bodySmall.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
