 // Create a new file called auto-popup.js with this code

// Function to check if user is logged in (using Firebase)
function isUserLoggedIn() {
    // Check if Firebase auth is initialized and if a user is logged in
    if (typeof firebase !== 'undefined' && firebase.auth) {
      return firebase.auth().currentUser !== null;
    }
    // If Firebase isn't initialized yet, we'll assume not logged in
    return false;
  }
  
  // Function to show the login modal
  function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const loggedInView = document.getElementById('loggedInView');
    
    // Only show if user is not already logged in
    if (loginModal && (!loggedInView || loggedInView.style.display === 'none' || loggedInView.style.display === '')) {
      console.log('Displaying login modal');
      loginModal.style.display = 'block';
      
      // Reset the form and hide any previous errors
      if (loginForm) loginForm.reset();
      if (loginError) loginError.style.display = 'none';
    }
  }
  
  // Main function to set up the auto-popup
  function setupAutoPopup() {
    // Check if we're on the home page
    const isHomePage = window.location.pathname === '/' || 
                       window.location.pathname.endsWith('/index.html') ||
                       window.location.pathname === '';
    
    if (isHomePage) {
      console.log('Home page detected, setting up login popup timer');
      
      // Wait 5 seconds, then show the login modal if not logged in
      setTimeout(function() {
        if (!isUserLoggedIn()) {
          showLoginModal();
        } else {
          console.log('User already logged in, not showing login modal');
        }
      }, 5000); // 5000 milliseconds = 5 seconds
    }
  }
  
  // Listen for the header-loaded event to ensure our modal exists in the DOM
  document.addEventListener('header-loaded', function() {
    console.log('Header loaded, setting up auto-popup');
    setupAutoPopup();
  });
  
  // Also set up on DOMContentLoaded as a fallback
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, checking if header is already loaded');
    
    // If header container already has content, we can proceed
    const headerContainer = document.getElementById('header-container');
    if (headerContainer && headerContainer.innerHTML.trim() !== '') {
      setupAutoPopup();
    } else {
      console.log('Header not loaded yet, waiting for header-loaded event');
    }
  });