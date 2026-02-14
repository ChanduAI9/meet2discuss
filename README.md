# Meet2Discuss

A Flutter mobile app MVP for local discussion meetups. Connect with like-minded individuals, host intellectual discussions, and build your reputation in the community.

## Features

### Authentication
- Email & Password login
- Google Sign-In
- User profile creation with professional information

### Discussion Management
- Create discussion topics with location, date, and time
- Browse nearby discussions with city-based filtering
- Join discussions (with participant limits)
- View discussion details and participant lists

### Reputation System
- Rate other participants after discussions (1-5 stars)
- Anonymous rating system
- Automatic reputation score calculation
- Auto-leveling system:
  - **Learner** (0-2.5)
  - **Contributor** (2.6-3.5)
  - **Specialist** (3.6-4.3)
  - **Authority** (4.4-5.0)

### User Profiles
- View professional role and expertise
- Track discussions hosted and attended
- Display reputation score and level
- Community metrics dashboard

## Tech Stack

- **Flutter** - Cross-platform mobile framework
- **Firebase Authentication** - Email and Google Sign-In
- **Cloud Firestore** - Real-time database
- **Provider** - State management (optional)

## Getting Started

### Prerequisites

- Flutter SDK (3.0.0 or higher)
- Firebase account
- Android Studio / VS Code with Flutter extensions

### Firebase Setup

#### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Name your project (e.g., "Meet2Discuss")

#### 2. Enable Authentication

1. In Firebase Console, navigate to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Enable **Google** sign-in method
5. Add your app's SHA-1 and SHA-256 certificates for Google Sign-In (Android)

#### 3. Create Firestore Database

1. Navigate to **Firestore Database**
2. Click "Create database"
3. Start in **production mode** (we'll add rules later)
4. Choose a location close to your users

#### 4. Configure Firestore Security Rules

In Firestore Database > Rules, add these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Discussions collection
    match /discussions/{discussionId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.hostId == request.auth.uid || 
         request.auth.uid in resource.data.participants);
      allow delete: if request.auth != null && resource.data.hostId == request.auth.uid;
    }
    
    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if false; // Reviews are anonymous
      allow create: if request.auth != null && request.auth.uid == request.resource.data.fromUserId;
      allow update, delete: if false;
    }
  }
}
```

#### 5. Add Firebase to Your Flutter App

##### For Android:

1. In Firebase Console, click "Add app" and select Android
2. Enter your package name: `com.example.meet2discuss`
3. Download `google-services.json`
4. Place it in `android/app/` directory
5. Update `android/build.gradle`:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

6. Update `android/app/build.gradle`:

```gradle
plugins {
    id 'com.android.application'
    id 'com.google.gms.google-services'
}

android {
    defaultConfig {
        minSdkVersion 21
    }
}
```

##### For iOS:

1. In Firebase Console, click "Add app" and select iOS
2. Enter your bundle ID: `com.example.meet2discuss`
3. Download `GoogleService-Info.plist`
4. Place it in `ios/Runner/` directory
5. Open `ios/Runner.xcworkspace` in Xcode
6. Add `GoogleService-Info.plist` to the Runner target

##### For Web (Optional):

1. In Firebase Console, click "Add app" and select Web
2. Copy the Firebase configuration
3. Update `web/index.html` with the Firebase SDK scripts

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd meet2discuss
```

2. Install dependencies:
```bash
flutter pub get
```

3. Run the app:
```bash
flutter run
```

## Project Structure

```
lib/
├── main.dart                 # App entry point and routing
├── models/                   # Data models
│   ├── user_model.dart
│   ├── discussion_model.dart
│   └── review_model.dart
├── services/                 # Firebase service layer
│   ├── auth_service.dart
│   ├── user_service.dart
│   ├── discussion_service.dart
│   └── review_service.dart
└── screens/                  # UI screens
    ├── welcome_screen.dart
    ├── login_screen.dart
    ├── signup_screen.dart
    ├── home_screen.dart
    ├── create_discussion_screen.dart
    ├── discussion_details_screen.dart
    └── profile_screen.dart
```

## User Data Model

```dart
UserModel {
  uid: String
  name: String
  email: String
  profilePhoto: String? (optional)
  professionalRole: String
  expertise: List<String>
  yearsOfExperience: int
  reputationScore: double (default: 0.0)
  totalReviews: int (default: 0)
  discussionsHosted: int (default: 0)
  discussionsAttended: int (default: 0)
  level: String (auto-calculated)
  createdAt: DateTime
}
```

## Discussion Data Model

```dart
Discussion {
  id: String
  hostId: String
  title: String
  description: String
  location: String (text-based for MVP)
  dateTime: DateTime
  maxParticipants: int
  participants: List<String> (user IDs)
  status: String ('upcoming' or 'completed')
  createdAt: DateTime
}
```

## Review System

- Users can rate other participants after a discussion completes
- Ratings are 1-5 stars
- Each user can rate each participant once per discussion
- Reviews are stored anonymously
- Reputation score is the average of all reviews received
- Reputation is only shown after receiving 3+ reviews

## Design Guidelines

- **Color Scheme:**
  - Primary: Blue (#2563EB)
  - Action: Green (#22C55E)
  - Background: White
- Clean, minimal UI
- Card-based layout
- Clear typography
- No complex animations

## MVP Constraints

This is an MVP with simplified features:
- ❌ No chat functionality
- ❌ No comments on discussions
- ❌ No dark mode
- ❌ No push notifications
- ❌ No advanced GPS location
- ✅ City-based filtering only
- ✅ Text-based location

## Future Enhancements

Potential features for future versions:
- In-app chat
- Push notifications
- Advanced GPS-based location
- Discussion categories/tags
- Search and filtering
- Discussion history
- Calendar integration
- Social media sharing
- Dark mode

## Contributing

This is an MVP project. Contributions are welcome!

## License

MIT License

## Support

For issues or questions, please create an issue in the repository.
