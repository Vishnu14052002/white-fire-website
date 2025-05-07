const firebaseConfig = {
  apiKey: "AIzaSyBqtR-mopnadnBWzSE6HJzdZeNVqIQRnfs",
  authDomain: "white-fire-technologies.firebaseapp.com",
  projectId: "white-fire-technologies",
  storageBucket: "white-fire-technologies.firebasestorage.app",
  messagingSenderId: "997726192451",
  appId: "1:997726192451:web:c4ebf82504875f7174e5f6",
  measurementId: "G-SLSNLSDR79"
};


// Fixed Firebase Registration Functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing Firebase auth UI');
  
  // Check if Firebase is properly initialized
  try {
    if (typeof firebase === 'undefined') {
      console.error('Firebase is not defined. Make sure Firebase SDK is loaded correctly.');
      return;
    }
    
    // Initialize Firebase services
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    console.log('Firebase initialized successfully');
    
    // DOM Elements
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeButtons = document.querySelectorAll('.close');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const registerSuccess = document.getElementById('registerSuccess');
    const welcomeUser = document.getElementById('welcomeUser');
    const loggedInView = document.getElementById('loggedInView');
    const loggedOutView = document.getElementById('loggedOutView');
    
    // Event Listeners for opening modals
    if (loginBtn) {
      loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Login button clicked');
        if (loginModal) {
          loginModal.style.display = 'block';
          if (loginError) loginError.style.display = 'none';
          if (loginForm) loginForm.reset();
        } else {
          console.error('Login modal not found');
        }
      });
    } else {
      console.error('Login button not found');
    }
    
    // Event Listeners for closing modals
    if (closeButtons) {
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          if (loginModal) loginModal.style.display = 'none';
          if (registerModal) registerModal.style.display = 'none';
        });
      });
    }
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
      if (loginModal && e.target === loginModal) loginModal.style.display = 'none';
      if (registerModal && e.target === registerModal) registerModal.style.display = 'none';
    });
    
    // Switch between login and register forms
    if (switchToRegister) {
      switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        if (loginModal) loginModal.style.display = 'none';
        if (registerModal) {
          registerModal.style.display = 'block';
          if (registerError) registerError.style.display = 'none';
          if (registerSuccess) registerSuccess.style.display = 'none';
          if (registerForm) registerForm.reset();
        }
      });
    }
    
    if (switchToLogin) {
      switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        if (registerModal) registerModal.style.display = 'none';
        if (loginModal) {
          loginModal.style.display = 'block';
          if (loginError) loginError.style.display = 'none';
          if (loginForm) loginForm.reset();
        }
      });
    }
    
    // Login Form Submission
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Login form submitted');
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Sign in with Firebase Authentication
        auth.signInWithEmailAndPassword(email, password)
          .then(() => {
            console.log('User signed in successfully');
            loginModal.style.display = 'none';
            loginForm.reset();
          })
          .catch((error) => {
            console.error('Login error:', error.message);
            if (loginError) {
              loginError.textContent = 'Incorrect email or password. Please try again.';
              loginError.style.display = 'block';
            }
          });
      });
    } else {
      console.error('Login form not found');
    }
    
    // Register Form Submission - FIXED
    if (registerForm) {
      registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Register form submitted');
        
        const name = document.getElementById('registerName').value;
        const phone = document.getElementById('registerPhone').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        console.log('Attempting to create user with:', { email });
        
        // Create user with Firebase Authentication
        auth.createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            console.log('User created successfully, now storing user data');
            const user = userCredential.user;
            
            // Store user data in Firestore
            return db.collection('users').doc(user.uid).set({
              name: name,
              phone: phone,
              email: email,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          })
          .then(() => {
            console.log("User data saved to Firestore successfully!");
            
            // Show success message
            if (registerSuccess) {
              registerSuccess.textContent = 'Registration successful! You can now login.';
              registerSuccess.style.display = 'block';
            }
            if (registerError) {
              registerError.style.display = 'none';
            }
            
            // Clear the form
            registerForm.reset();
            
            // Automatically switch to login after 2 seconds
            setTimeout(() => {
              if (registerModal) registerModal.style.display = 'none';
              if (loginModal) {
                loginModal.style.display = 'block';
                if (loginError) loginError.style.display = 'none';
              }
            }, 2000);
          })
          .catch((error) => {
            console.error('Registration error:', error.message);
            if (registerError) {
              registerError.textContent = error.message;
              registerError.style.display = 'block';
            }
            if (registerSuccess) {
              registerSuccess.style.display = 'none';
            }
          });
      });
    } else {
      console.error('Register form not found');
    }
    
    // Logout event
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
          console.log('User signed out');
        }).catch((error) => {
          console.error('Sign out error:', error);
        });
      });
    }
    
    // Auth state change listener
    auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      if (user) {
        // User is signed in
        // Fetch user data from Firestore
        db.collection('users').doc(user.uid).get()
          .then((doc) => {
            if (doc.exists && welcomeUser) {
              // Get user data
              const userData = doc.data();
              console.log('User data retrieved:', userData);
              
              // Display user name
              welcomeUser.textContent = `Welcome, ${userData.name}`;
            } else if (welcomeUser) {
              // No user document found, fallback to email
              const emailName = user.email.split('@')[0];
              welcomeUser.textContent = `Welcome, ${emailName}`;
              console.log('Creating new user document for:', emailName);
              
              // Create a document for this user for future use
              db.collection('users').doc(user.uid).set({
                email: user.email,
                name: emailName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
              });
            }
            
            // Update UI for logged in state
            if (loggedInView && loggedOutView) {
              loggedInView.style.display = 'flex';
              loggedOutView.style.display = 'none';
            }
          })
          .catch((error) => {
            console.error("Error getting user data:", error);
            
            // Fallback to email if there's an error
            if (welcomeUser) {
              const emailName = user.email.split('@')[0];
              welcomeUser.textContent = `Welcome, ${emailName}`;
            }
            
            // Update UI for logged in state
            if (loggedInView && loggedOutView) {
              loggedInView.style.display = 'flex';
              loggedOutView.style.display = 'none';
            }
          });
      } else {
        // User is signed out
        if (loggedInView && loggedOutView) {
          loggedInView.style.display = 'none';
          loggedOutView.style.display = 'flex';
        }
      }
    });
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
});

// Function to update user profile in Firestore
function updateUserProfile(name, phone, photoURL) {
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  const user = auth.currentUser;
  
  if (user) {
    // Update in Firestore
    return db.collection('users').doc(user.uid).update({
      name: name,
      phone: phone,
      photoURL: photoURL,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } else {
    return Promise.reject(new Error("No user is signed in"));
  }
}