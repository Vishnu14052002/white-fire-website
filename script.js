// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqtR-mopnadnBWzSE6HJzdZeNVqIQRnfs",
  authDomain: "white-fire-technologies.firebaseapp.com",
  projectId: "white-fire-technologies",
  storageBucket: "white-fire-technologies.firebasestorage.app",
  messagingSenderId: "997726192451",
  appId: "1:997726192451:web:c4ebf82504875f7174e5f6",
  measurementId: "G-SLSNLSDR79"
};

// Main initialization function when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing site functionality');
  
  // Initialize mobile menu functionality first
  initMobileMenu();
  
  // Initialize Firebase
  initFirebase();
  
  // WhatsApp functionality
  initWhatsApp();
  
  // Other initialization functions for different parts of the site
  initSliders();
  initBlogFilter();
});

// Mobile menu functionality
function initMobileMenu() {
  const menuIcon = document.getElementById('menu-icon');
  const navLinks = document.getElementById('nav-links');
  
  if (menuIcon && navLinks) {
    console.log('Mobile menu elements found, initializing event listener');
    menuIcon.addEventListener('click', function() {
      console.log('Menu icon clicked');
      navLinks.classList.toggle('active');
    });
  } else {
    console.error('Mobile menu elements not found', { menuIcon, navLinks });
  }
  
  // Initialize mobile dropdowns
  const mobileDropdownHeaders = document.querySelectorAll('.mobile-dropdown-header');
  
  mobileDropdownHeaders.forEach(header => {
    header.addEventListener('click', function() {
      // Toggle active class on header
      this.classList.toggle('active');
      
      // Find the target dropdown content
      const targetId = this.getAttribute('data-target');
      const dropdownContent = document.getElementById(targetId);
      
      // Toggle show class on content
      if (dropdownContent) {
        dropdownContent.classList.toggle('show');
      }
    });
  });
}

// Firebase initialization and auth functionality
function initFirebase() {
  try {
    // Check if firebase is already initialized
    if (firebase.apps.length === 0) {
      console.log('Initializing Firebase');
      firebase.initializeApp(firebaseConfig);
    } else {
      console.log('Firebase already initialized');
    }
    
    const auth = firebase.auth();
    const db = firebase.firestore();
    
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

// WhatsApp chat functionality
function initWhatsApp() {
  const whatsappButton = document.getElementById('whatsapp-button');
  const whatsappChat = document.getElementById('whatsapp-chat');
  const closeChat = document.getElementById('close-chat');
  const sendMessage = document.getElementById('send-message');
  const messageInput = document.getElementById('whatsapp-message');
  const chatBody = document.getElementById('chat-body');
  const whatsappNumber = '+447587675040'; // Your WhatsApp number

  if (whatsappButton && whatsappChat) {
    whatsappButton.addEventListener('click', () => {
      whatsappChat.style.display = 'flex';
    });
  }

  if (closeChat) {
    closeChat.addEventListener('click', () => {
      whatsappChat.style.display = 'none';
    });
  }

  // Function to redirect to WhatsApp with the message
  function redirectToWhatsApp(message) {
    // Format the number without spaces or special characters
    const formattedNumber = whatsappNumber.replace(/\s+/g, '');
    
    // Create the WhatsApp URL with the message
    const whatsappURL = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappURL, '_blank');
  }

  if (sendMessage && messageInput && chatBody) {
    sendMessage.addEventListener('click', () => {
      handleMessageSend();
    });

    // Also handle pressing Enter key in the input field
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleMessageSend();
      }
    });

    function handleMessageSend() {
      const message = messageInput.value.trim();
      if (message !== '') {
        // Display the message in the chat interface
        const userMsg = document.createElement('div');
        userMsg.className = 'user-message';
        userMsg.innerText = message;
        chatBody.appendChild(userMsg);
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // Add a small delay so user can see their message before redirect
        setTimeout(() => {
          // Redirect to WhatsApp with the message
          redirectToWhatsApp(message);
          
          // Clear the input field
          messageInput.value = '';
        }, 500);
      }
    }
  }
}

// Testimonial and instructor sliders functionality
function initSliders() {
  // === TESTIMONIAL SLIDER ===
  const testimonialSlider = document.querySelector('.testimonial-slider');
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const testimonialDots = document.querySelectorAll('.testimonials-section .slider-dot');
  const testimonialPrev = document.querySelector('.testimonials-section .prev-arrow');
  const testimonialNext = document.querySelector('.testimonials-section .next-arrow');
  
  if (testimonialSlider && testimonialCards.length > 0) {
    let testimonialIndex = 0;
    const cardWidth = testimonialCards[0].offsetWidth + 20;

    function updateSlider(index) {
      if (index < 0) index = testimonialCards.length - 1;
      if (index >= testimonialCards.length) index = 0;
      testimonialIndex = index;
      testimonialSlider.scrollLeft = cardWidth * testimonialIndex;

      testimonialDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === testimonialIndex);
      });
    }

    testimonialDots.forEach((dot, i) => {
      dot.addEventListener('click', () => updateSlider(i));
    });

    if (testimonialPrev) testimonialPrev.addEventListener('click', () => updateSlider(testimonialIndex - 1));
    if (testimonialNext) testimonialNext.addEventListener('click', () => updateSlider(testimonialIndex + 1));

    testimonialSlider.addEventListener('scroll', () => {
      const activeIndex = Math.round(testimonialSlider.scrollLeft / cardWidth);
      testimonialDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
      });
      testimonialIndex = activeIndex;
    });

    let autoScroll = setInterval(() => updateSlider(testimonialIndex + 1), 5000);

    testimonialSlider.addEventListener('mouseenter', () => clearInterval(autoScroll));
    testimonialSlider.addEventListener('mouseleave', () => {
      autoScroll = setInterval(() => updateSlider(testimonialIndex + 1), 5000);
    });
  }

  // === INSTRUCTOR SLIDER ===
  const instructorSlider = document.querySelector('.instructor-slider');
  const instructorCards = document.querySelectorAll('.instructor-card');
  const instructorDots = document.querySelectorAll('.instructors-section .slider-dot');
  const instructorPrev = document.querySelector('.instructors-section .prev-arrow');
  const instructorNext = document.querySelector('.instructors-section .next-arrow');

  if (instructorSlider && instructorCards.length > 0) {
    let instructorIndex = 0;
    const cardWidth = instructorCards[0].offsetWidth + 20;

    function updateInstructorSlider(index) {
      if (index < 0) index = instructorCards.length - 1;
      if (index >= instructorCards.length) index = 0;
      instructorIndex = index;
      instructorSlider.scrollLeft = cardWidth * instructorIndex;
      
      instructorDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === instructorIndex);
      });
    }

    instructorDots.forEach((dot, i) => {
      dot.addEventListener('click', () => updateInstructorSlider(i));
    });

    if (instructorPrev) instructorPrev.addEventListener('click', () => updateInstructorSlider(instructorIndex - 1));
    if (instructorNext) instructorNext.addEventListener('click', () => updateInstructorSlider(instructorIndex + 1));

    instructorSlider.addEventListener('scroll', () => {
      const activeIndex = Math.round(instructorSlider.scrollLeft / cardWidth);
      instructorDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
      });
      instructorIndex = activeIndex;
    });

    let autoInstructor = setInterval(() => updateInstructorSlider(instructorIndex + 1), 6000);
    
    instructorSlider.addEventListener('mouseenter', () => clearInterval(autoInstructor));
    instructorSlider.addEventListener('mouseleave', () => {
      autoInstructor = setInterval(() => updateInstructorSlider(instructorIndex + 1), 6000);
    });
  }
}

// Blog filter functionality
function initBlogFilter() {
  // Filter functionality for blog cards
  const filterBtns = document.querySelectorAll('.filter-btn');
  const blogCards = document.querySelectorAll('.blog-card');
  
  if (filterBtns.length && blogCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        const filter = this.getAttribute('data-filter');
        
        blogCards.forEach(card => {
          if (filter === 'all') {
            card.style.display = 'flex';
          } else {
            const categories = card.getAttribute('data-category').split(' ');
            if (categories.includes(filter)) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          }
        });
      });
    });
  }
  
  // View All button animation
  const viewAllBtn = document.querySelector('.view-all-btn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('mouseenter', function() {
      const icon = this.querySelector('i');
      if (icon) icon.classList.add('fa-beat');
    });
    
    viewAllBtn.addEventListener('mouseleave', function() {
      const icon = this.querySelector('i');
      if (icon) icon.classList.remove('fa-beat');
    });
  }
  
  // Hover effects for blog cards
  blogCards.forEach(card => {
    const readMoreLink = card.querySelector('.read-more');
    if (readMoreLink) {
      const icon = readMoreLink.querySelector('i');
      
      card.addEventListener('mouseenter', function() {
        if (icon) icon.classList.add('fa-beat');
      });
      
      card.addEventListener('mouseleave', function() {
        if (icon) icon.classList.remove('fa-beat');
      });
    }
  });
}

// Function to filter courses
function filterCourses() {
  let input = document.getElementById("search-box").value.toLowerCase();
  let courseBoxes = document.querySelectorAll(".course-box");

  courseBoxes.forEach((box) => {
    let courseName = box.getAttribute("data-name").toLowerCase();

    if (courseName.includes(input)) {
      box.style.display = "block";
    } else {
      box.style.display = "none";
    }
  });
}

// Function to update user profile in Firestore - kept outside document ready for global access
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