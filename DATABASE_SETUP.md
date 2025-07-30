# Database Setup Guide

This chatbot application now uses Firebase Firestore for persistent data storage. Follow these steps to set up the database:

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "ai-chatbot")
4. Follow the setup wizard (you can disable Google Analytics for now)

### 2. Enable Authentication
1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

### 3. Enable Firestore Database
1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

### 4. Get Firebase Configuration
1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "chatbot-web")
6. Copy the configuration object

### 5. Update Environment Variables
1. Copy `firebase-config.template` to `.env.local`
2. Replace the placeholder values with your Firebase configuration:

```env
REACT_APP_GEMINI_API_KEY=AIzaSyCQXR-sP9fwJBo52X3jhkggAUJuK1NZOLY

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 🗄️ Database Structure

The application uses the following Firestore collections:

### Users Collection
```javascript
users/{userId}
{
  uid: string,
  email: string,
  name: string,
  avatar: string,
  createdAt: timestamp,
  lastSeen: timestamp,
  updatedAt: timestamp
}
```

### Chats Collection
```javascript
chats/{chatId}
{
  userId: string,
  title: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  messageCount: number
}
```

### Messages Collection
```javascript
messages/{messageId}
{
  chatId: string,
  userId: string,
  text: string,
  sender: 'user' | 'bot',
  timestamp: timestamp
}
```

## 🔐 Security Rules

Add these Firestore security rules in your Firebase console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Users can only access messages from their chats
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🚀 Features Enabled

With the database integration, you now have:

### ✅ **Persistent Data Storage**
- User accounts and authentication
- Chat history saved to cloud
- Messages stored permanently
- Real-time synchronization

### ✅ **Real-time Features**
- Live chat updates
- Instant message delivery
- Real-time chat list updates
- User presence tracking

### ✅ **User Management**
- Secure authentication
- User profiles
- Chat statistics
- Account management

### ✅ **Advanced Features**
- Chat analytics
- Message search (can be added)
- User preferences
- Multi-device sync

## 🛠️ Development

### Local Development
1. Install dependencies: `npm install`
2. Set up environment variables
3. Start development server: `npm start`

### Testing Database
1. Create a test account
2. Send some messages
3. Check Firebase console to see data
4. Try logging out and back in

### Production Deployment
1. Set up proper Firebase security rules
2. Configure authentication providers
3. Set up hosting (optional)
4. Deploy to your preferred platform

## 🔧 Troubleshooting

### Common Issues

**"Firebase: Error (auth/invalid-api-key)"**
- Check your Firebase configuration in `.env.local`
- Ensure all environment variables are set correctly

**"Permission denied" errors**
- Check Firestore security rules
- Ensure authentication is properly set up

**Real-time updates not working**
- Check network connectivity
- Verify Firebase project settings
- Check browser console for errors

### Debug Mode
Add this to your `.env.local` for debugging:
```env
REACT_APP_DEBUG=true
```

## 📊 Analytics

The database also tracks:
- Total chats per user
- Total messages per user
- Average messages per chat
- User activity patterns

## 🔄 Migration from localStorage

If you were using the previous localStorage version:
1. Your old data will not be automatically migrated
2. You'll need to create a new account
3. Start fresh with the database-backed version

## 📝 Next Steps

Consider adding these features:
- [ ] Message search functionality
- [ ] File upload support
- [ ] User avatars and profiles
- [ ] Chat sharing
- [ ] Message reactions
- [ ] Read receipts
- [ ] Push notifications 