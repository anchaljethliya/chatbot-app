import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Database Collections
const COLLECTIONS = {
  USERS: 'users',
  CHATS: 'chats',
  MESSAGES: 'messages'
};

// User Management
export const createUser = async (userData) => {
  try {
    const { email, password, name } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      uid: user.uid,
      email: email,
      name: name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp()
    });
    
    return {
      uid: user.uid,
      email: email,
      name: name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: user.uid,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar
      };
    }
    throw new Error('User data not found');
  } catch (error) {
    console.error('Error signing in user:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Chat Management
export const createChat = async (userId, title, firstMessage) => {
  try {
    const chatRef = await addDoc(collection(db, COLLECTIONS.CHATS), {
      userId: userId,
      title: title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      messageCount: 1
    });
    
    // Add first message
    await addDoc(collection(db, COLLECTIONS.MESSAGES), {
      chatId: chatRef.id,
      userId: userId,
      text: firstMessage,
      sender: 'user',
      timestamp: serverTimestamp()
    });
    
    return chatRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const getUserChats = async (userId) => {
  try {
    const chatsQuery = query(
      collection(db, COLLECTIONS.CHATS),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(chatsQuery);
    const chats = [];
    
    for (const doc of querySnapshot.docs) {
      const chatData = doc.data();
      chats.push({
        id: doc.id,
        ...chatData,
        createdAt: chatData.createdAt?.toDate(),
        updatedAt: chatData.updatedAt?.toDate()
      });
    }
    
    return chats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId) => {
  try {
    const messagesQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(messagesQuery);
    const messages = [];
    
    for (const doc of querySnapshot.docs) {
      const messageData = doc.data();
      messages.push({
        id: doc.id,
        ...messageData,
        timestamp: messageData.timestamp?.toDate()
      });
    }
    
    return messages;
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

export const addMessage = async (chatId, userId, text, sender = 'user') => {
  try {
    const messageRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), {
      chatId: chatId,
      userId: userId,
      text: text,
      sender: sender,
      timestamp: serverTimestamp()
    });
    
    // Update chat's updatedAt and messageCount
    const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
    await updateDoc(chatRef, {
      updatedAt: serverTimestamp(),
      messageCount: (await getDoc(chatRef)).data().messageCount + 1
    });
    
    return messageRef.id;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

export const updateChatTitle = async (chatId, title) => {
  try {
    const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
    await updateDoc(chatRef, {
      title: title,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating chat title:', error);
    throw error;
  }
};

export const deleteChat = async (chatId) => {
  try {
    // Delete all messages in the chat
    const messagesQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('chatId', '==', chatId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Delete the chat document
    await deleteDoc(doc(db, COLLECTIONS.CHATS, chatId));
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToUserChats = (userId, callback) => {
  const chatsQuery = query(
    collection(db, COLLECTIONS.CHATS),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(chatsQuery, (snapshot) => {
    const chats = [];
    snapshot.forEach((doc) => {
      const chatData = doc.data();
      chats.push({
        id: doc.id,
        ...chatData,
        createdAt: chatData.createdAt?.toDate(),
        updatedAt: chatData.updatedAt?.toDate()
      });
    });
    callback(chats);
  });
};

export const subscribeToChatMessages = (chatId, callback) => {
  const messagesQuery = query(
    collection(db, COLLECTIONS.MESSAGES),
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      const messageData = doc.data();
      messages.push({
        id: doc.id,
        ...messageData,
        timestamp: messageData.timestamp?.toDate()
      });
    });
    callback(messages);
  });
};

// User profile management
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Analytics and statistics
export const getChatStats = async (userId) => {
  try {
    const chatsQuery = query(
      collection(db, COLLECTIONS.CHATS),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(chatsQuery);
    const totalChats = querySnapshot.size;
    let totalMessages = 0;
    
    querySnapshot.forEach((doc) => {
      totalMessages += doc.data().messageCount || 0;
    });
    
    return {
      totalChats,
      totalMessages,
      averageMessagesPerChat: totalChats > 0 ? (totalMessages / totalChats).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Error getting chat stats:', error);
    throw error;
  }
};

export default {
  createUser,
  signInUser,
  signOutUser,
  getCurrentUser,
  onAuthStateChange,
  createChat,
  getUserChats,
  getChatMessages,
  addMessage,
  updateChatTitle,
  deleteChat,
  subscribeToUserChats,
  subscribeToChatMessages,
  updateUserProfile,
  getUserProfile,
  getChatStats
}; 