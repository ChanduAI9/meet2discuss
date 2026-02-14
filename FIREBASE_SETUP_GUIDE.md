# Firebase Setup Guide - Meet2Discuss

## Step 1: Create Firebase Project (5 minutes)

1. Open https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Project name: `meet2discuss`
4. Click **Continue**
5. Disable Google Analytics (optional for now)
6. Click **Create project**
7. Wait for project to be created, then click **Continue**

---

## Step 2: Enable Authentication (3 minutes)

1. In the left sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" ON
   - Click **Save**
5. Enable **Google**:
   - Click on "Google"
   - Toggle "Enable" ON
   - Project support email: (select your email)
   - Click **Save**

---

## Step 3: Create Firestore Database (3 minutes)

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Start in **"test mode"** (we'll add security rules later)
4. Select location: Choose closest to you (e.g., `us-central1` or `asia-south1`)
5. Click **Enable**
6. Wait for database to be created

---

## Step 4: Get Web App Configuration (5 minutes)

1. Go to **Project Settings** (gear icon in sidebar)
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** `</>`
4. App nickname: `Meet2Discuss Web`
5. ✅ Check **"Also set up Firebase Hosting"** (optional)
6. Click **"Register app"**
7. You'll see Firebase SDK configuration like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza....",
  authDomain: "meet2discuss-xxxxx.firebaseapp.com",
  projectId: "meet2discuss-xxxxx",
  storageBucket: "meet2discuss-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

8. **COPY THIS ENTIRE CONFIG** - You'll need it in the next step!
9. Click **Continue to console**

---

## Step 5: Get Android App Configuration (5 minutes)

1. Still in **Project Settings**, scroll to **"Your apps"**
2. Click **Android icon** (robot)
3. Android package name: `com.example.meet2discuss`
4. App nickname: `Meet2Discuss Android`
5. Click **"Register app"**
6. **Download `google-services.json`** file
7. Click **Next** → **Next** → **Continue to console**

---

## Step 6: Add Firestore Security Rules (2 minutes)

1. Go to **Firestore Database** → **Rules** tab
2. Replace ALL content with this:

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
      allow read: if false;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.fromUserId;
      allow update, delete: if false;
    }
  }
}
```

3. Click **Publish**

---

## ✅ Checklist - Make sure you have:

- [ ] Firebase project created
- [ ] Email/Password authentication enabled
- [ ] Google authentication enabled  
- [ ] Firestore database created
- [ ] Web app registered (have the config)
- [ ] Android app registered (have google-services.json)
- [ ] Firestore security rules published

---

## Next Steps:

Once you complete all the above steps:

1. Share your **Web Firebase config** (the JavaScript object from Step 4)
2. Share your **google-services.json** file content (from Step 5)
3. I'll integrate them into the Flutter app
4. We'll test everything!

---

## Need Help?

If you get stuck at any step, let me know which step number and I'll help you through it!
