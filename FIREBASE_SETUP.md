# Firebase Setup Guide for Meet2Discuss

## Quick Start Checklist

- [ ] Create Firebase project
- [ ] Enable Email/Password authentication
- [ ] Enable Google Sign-In authentication
- [ ] Create Firestore database
- [ ] Set up Firestore security rules
- [ ] Download and add `google-services.json` (Android)
- [ ] Download and add `GoogleService-Info.plist` (iOS)
- [ ] Update Android build files
- [ ] Test authentication flow

## Detailed Setup Steps

### 1. Create Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `meet2discuss`
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### 2. Enable Authentication Methods

1. In Firebase Console, select your project
2. Go to **Build** → **Authentication**
3. Click **"Get started"**
4. Navigate to **"Sign-in method"** tab
5. Enable **"Email/Password"**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Save
6. Enable **"Google"**:
   - Click on "Google"
   - Toggle "Enable"
   - Enter project support email
   - Save

### 3. Create Firestore Database

1. Go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose a location (e.g., us-central, asia-south1)
5. Click **"Enable"**

### 4. Configure Firestore Security Rules

1. In Firestore Database, go to **"Rules"** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - public read, own write
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
      allow delete: if request.auth != null && 
        resource.data.hostId == request.auth.uid;
    }
    
    // Reviews collection - anonymous, write-once
    match /reviews/{reviewId} {
      allow read: if false; // Anonymous reviews
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.fromUserId;
      allow update, delete: if false;
    }
  }
}
```

3. Click **"Publish"**

### 5. Add Firebase to Android App

1. In Firebase Console, click **"Add app"** and select **Android**
2. Register app:
   - **Android package name:** `com.example.meet2discuss`
   - **App nickname:** Meet2Discuss
   - Leave SHA-1 empty for now (add later for Google Sign-In)
3. Download `google-services.json`
4. Place the file in: `android/app/google-services.json`

5. Update `android/build.gradle`:

```gradle
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:7.3.0'
        classpath 'com.google.gms:google-services:4.3.15'  // ADD THIS LINE
    }
}
```

6. Update `android/app/build.gradle`:

```gradle
plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
    id 'com.google.gms.google-services'  // ADD THIS LINE
}

android {
    defaultConfig {
        minSdkVersion 21  // UPDATE THIS (was probably 16)
        targetSdkVersion flutter.targetSdkVersion
    }
}
```

### 6. Get SHA-1 Certificate for Google Sign-In (Android)

#### Debug Certificate:

```bash
cd android
./gradlew signingReport
```

Look for the SHA-1 under "Variant: debug":
```
SHA-1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

#### Add SHA-1 to Firebase:

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"**
3. Click on your Android app
4. Click **"Add fingerprint"**
5. Paste the SHA-1 hash
6. Save

### 7. Add Firebase to iOS App (Optional)

1. In Firebase Console, click **"Add app"** and select **iOS**
2. Register app:
   - **iOS bundle ID:** `com.example.meet2discuss`
   - **App nickname:** Meet2Discuss
3. Download `GoogleService-Info.plist`
4. Open Xcode: `open ios/Runner.xcworkspace`
5. Drag `GoogleService-Info.plist` into `Runner` folder in Xcode
6. Ensure "Copy items if needed" is checked
7. Select "Runner" target

### 8. Initialize Firestore Indexes (Optional but Recommended)

Some queries may require composite indexes. If you see an error like:
```
"The query requires an index"
```

Click the provided link in the error message, or manually create indexes:

1. Go to **Firestore Database** → **Indexes** tab
2. Click **"Create Index"**
3. Add index for:
   - **Collection:** `discussions`
   - **Fields:** `status` (Ascending), `dateTime` (Ascending)
   - **Query scope:** Collection

### 9. Test Your Setup

1. Run the app:
```bash
flutter run
```

2. Try signing up with email/password
3. Check Firebase Console → Authentication to see the new user
4. Create a discussion
5. Check Firestore Database to see the data

## Common Issues & Solutions

### Issue: "No Firebase App '[DEFAULT]' has been created"
**Solution:** Make sure `await Firebase.initializeApp();` is called in `main()` before `runApp()`.

### Issue: Google Sign-In doesn't work
**Solution:** 
- Verify SHA-1 certificate is added to Firebase
- Download the updated `google-services.json` after adding SHA-1
- Rebuild the app

### Issue: "PERMISSION_DENIED" in Firestore
**Solution:** Check Firestore security rules are correctly configured and published.

### Issue: "Execution failed for task ':app:processDebugGoogleServices'"
**Solution:** 
- Ensure `google-services.json` is in `android/app/`
- Verify package name matches in both Firebase and `android/app/build.gradle`

## Firebase Console URLs

- **Project Overview:** https://console.firebase.google.com/
- **Authentication:** https://console.firebase.google.com/project/YOUR_PROJECT/authentication/users
- **Firestore:** https://console.firebase.google.com/project/YOUR_PROJECT/firestore/data
- **Project Settings:** https://console.firebase.google.com/project/YOUR_PROJECT/settings/general

## Next Steps

After Firebase is configured:

1. ✅ Test authentication (email + Google)
2. ✅ Create a test discussion
3. ✅ Join a discussion
4. ✅ Rate participants after discussion completes
5. ✅ Check reputation score updates

## Production Considerations

Before going to production:

- [ ] Enable App Check for security
- [ ] Set up proper billing alerts
- [ ] Configure backup for Firestore
- [ ] Add error tracking (e.g., Crashlytics)
- [ ] Review and tighten security rules
- [ ] Add rate limiting for expensive operations
- [ ] Enable multi-factor authentication (optional)
- [ ] Set up Firestore indexes based on query patterns

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Review Flutter debug logs: `flutter run -v`
3. Verify all configuration files are in place
4. Ensure package name consistency across all files

---

**Remember:** Never commit `google-services.json` or `GoogleService-Info.plist` to public repositories!
