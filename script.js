// Expose the Firebase initialization function globally so it can be called from header.js
function initializeFirebaseAuth() {
  console.log('Initializing Firebase auth...');
  
  // Check if Firebase is properly initialized
  try {
    if (typeof firebase === 'undefined') {
      console.error('Firebase is not defined. Make sure Firebase SDK is loaded correctly.');
      return;
    }
    
    // Firebase services should already be initialized in the main script
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Create Google Auth Provider
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const registerSuccess = document.getElementById('registerSuccess');
    const welcomeUser = document.getElementById('welcomeUser');
    const loggedInView = document.getElementById('loggedInView');
    const loggedOutView = document.getElementById('loggedOutView');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const googleSignInBtnLogin = document.getElementById('googleSignInBtnLogin');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
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
    }
    
    // Register Form Submission
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
              authProvider: 'email',
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
    }
    
    // Google Sign In functionality
    function signInWithGoogle() {
      auth.signInWithPopup(googleProvider)
        .then((result) => {
          // This gives you a Google Access Token
          const credential = result.credential;
          
          // The signed-in user info
          const user = result.user;
          console.log('Google sign-in successful', user);
          
          // Check if this is a new user (first time sign-in)
          const isNewUser = result.additionalUserInfo.isNewUser;
          
          if (isNewUser) {
            // This is a new user, save their profile data to Firestore
            return db.collection('users').doc(user.uid).set({
              name: user.displayName || '',
              email: user.email,
              phone: user.phoneNumber || '',
              photoURL: user.photoURL || '',
              authProvider: 'google',
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          } else {
            // This is a returning user, update their last login time
            return db.collection('users').doc(user.uid).update({
              lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
          }
        })
        .then(() => {
          // Close modals after successful sign-in
          if (loginModal) loginModal.style.display = 'none';
          if (registerModal) registerModal.style.display = 'none';
          console.log('User data saved to Firestore successfully!');
        })
        .catch((error) => {
          // Handle Errors here
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error('Google sign-in error:', errorMessage);
          
          // Display error message to user
          if (loginModal && loginModal.style.display === 'block') {
            if (loginError) {
              loginError.textContent = 'Google sign-in failed: ' + errorMessage;
              loginError.style.display = 'block';
            }
          } else if (registerModal && registerModal.style.display === 'block') {
            if (registerError) {
              registerError.textContent = 'Google sign-in failed: ' + errorMessage;
              registerError.style.display = 'block';
            }
          }
        });
    }
    
    // Google Sign In Button Event Listeners
    if (googleSignInBtn) {
      googleSignInBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Google sign-in button clicked');
        signInWithGoogle();
      });
    }
    
    if (googleSignInBtnLogin) {
      googleSignInBtnLogin.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Google sign-in button from login clicked');
        signInWithGoogle();
      });
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
              welcomeUser.textContent = `Welcome, ${userData.name || userData.email.split('@')[0]}`;
            } else if (welcomeUser) {
              // No user document found, fallback to email
              const emailName = user.email.split('@')[0];
              welcomeUser.textContent = `Welcome, ${user.displayName || emailName}`;
              console.log('Creating new user document for:', emailName);
              
              // Create a document for this user for future use
              db.collection('users').doc(user.uid).set({
                email: user.email,
                name: user.displayName || emailName,
                photoURL: user.photoURL || '',
                authProvider: user.providerData[0].providerId,
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
              welcomeUser.textContent = `Welcome, ${user.displayName || emailName}`;
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
    console.error('Error initializing Firebase auth:', error);
  }
}

// Make sure Firebase is initialized on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized in script.js');
  } catch (error) {
    console.error('Error initializing Firebase in script.js:', error);
  }
});