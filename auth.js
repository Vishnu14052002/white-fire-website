// Listen for the header-loaded event
document.addEventListener('header-loaded', function() {
  console.log('Header loaded, now initializing Firebase auth');
  initializeFirebaseAuth();
});

// Function to determine the API base URL
function getApiBaseUrl() {
  // Use production URL when on the actual website
  if (window.location.hostname === 'whitefiretechnologies.com' || 
      window.location.hostname === 'www.whitefiretechnologies.com') {
    return 'https://whitefiretechnologies.com';
  }
  // Fallback to localhost for development
  return 'http://localhost:3000';
}

// Use this in all your API calls
const API_BASE_URL = getApiBaseUrl();

function initializeFirebaseAuth() {
  // Move the Firebase initialization code from script.js to here
  try {
    if (typeof firebase === 'undefined') {
      console.error('Firebase is not defined. Make sure Firebase SDK is loaded correctly.');
      return;
    }
    
    // Initialize Firebase services
    const firebaseConfig = {
      apiKey: "AIzaSyBqtR-mopnadnBWzSE6HJzdZeNVqIQRnfs",
      authDomain: "white-fire-technologies.firebaseapp.com",
      projectId: "white-fire-technologies",
      storageBucket: "white-fire-technologies.firebasestorage.app",
      messagingSenderId: "997726192451",
      appId: "1:997726192451:web:c4ebf82504875f7174e5f6",
      measurementId: "G-SLSNLSDR79"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    console.log('Firebase initialized successfully');
    
    // Create Google Auth Provider
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    
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
    
    // Google Sign-in Buttons
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const googleSignInBtnLogin = document.getElementById('googleSignInBtnLogin');
    
    console.log('Login button:', loginBtn);
    console.log('Login form:', loginForm);
    console.log('Register form:', registerForm);
    
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
            
            // Add user to Zoho CRM
            return addUserToCRM({
              name: name,
              email: email,
              phone: phone,
              authProvider: 'email'
            });
          })
          .then(() => {
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
    
    // Function to handle Google Sign In
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
            })
            .then(() => {
              // Add the new user to Zoho CRM
              return addUserToCRM({
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                phone: user.phoneNumber || '',
                authProvider: 'google'
              });
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
    console.error('Error initializing Firebase:', error);
  }
}

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

// Function to get user's location
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          // Get location details using reverse geocoding API
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            .then(response => response.json())
            .then(data => {
              const locationData = {
                latitude,
                longitude,
                city: data.address?.city || data.address?.town || data.address?.village || '',
                state: data.address?.state || '',
                country: data.address?.country || '',
                postalCode: data.address?.postcode || '',
                fullAddress: data.display_name || ''
              };
              resolve(locationData);
            })
            .catch(error => {
              // If reverse geocoding fails, at least return coordinates
              console.error('Error getting address from coordinates:', error);
              resolve({ latitude, longitude });
            });
        },
        // Error callback
        (error) => {
          console.warn('Error getting location:', error.message);
          resolve({}); // Resolve with empty object to continue registration
        },
        // Options
        { 
          enableHighAccuracy: false, 
          timeout: 5000, 
          maximumAge: 0 
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser');
      resolve({}); // Resolve with empty object to continue registration
    }
  });
}

// Function to add user to Zoho CRM with location
function addUserToCRM(userData) {
  const { name, email, phone, authProvider } = userData;
  
  // First get location, then send data to CRM
  return getUserLocation()
    .then(locationData => {
      console.log('Location data:', locationData);
      
      return fetch(`${API_BASE_URL}/add-user-to-crm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          authProvider,
          location: locationData
        })
      });
    })
    .then(response => {
      if (!response.ok) {
        // If response is not OK, throw error with response data
        return response.json().then(data => {
          throw new Error(data.message || 'Error adding user to CRM');
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('User added to Zoho CRM successfully:', data);
      return data;
    })
    .catch(error => {
      console.error('Error adding user to Zoho CRM:', error);
      // Still continue the registration process even if CRM addition fails
      return { success: false, error: error.message };
    });
}