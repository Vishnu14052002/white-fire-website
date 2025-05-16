document.addEventListener('DOMContentLoaded', function() {
    // First, load the header HTML
    fetch('header.html')
      .then(response => response.text())
      .then(html => {
        // Insert the header HTML into the page
        document.getElementById('header').innerHTML = html;
        
        // After inserting the header, set the active link based on current page
        setActiveLink();
        
        // Initialize header functionality
        initializeHeader();
        
        // Initialize login/register functionality
        initializeAuthFunctionality();
      })
      .catch(error => {
        console.error('Error loading header:', error);
      });
      
    // Function to set the active link based on current URL
    function setActiveLink() {
      // Get the current page URL
      const currentPath = window.location.pathname;
      
      // Remove any existing active-link classes
      const navLinks = document.querySelectorAll('.nav-links a');
      navLinks.forEach(link => {
        link.classList.remove('active-link');
      });
      
      // Map of paths to their corresponding link IDs
      const pathToLinkMap = {
        '/index.html': 'home-link',
        '/': 'home-link',
        '/about.html': 'about-link',
        '/courses.html': 'courses-link',
        '/syllabus.html': 'syllabus-link'
      };
      
      // Course-related pages should highlight the courses link
      if (currentPath.includes('computing') || 
          currentPath.includes('science') || 
          currentPath.includes('database') || 
          currentPath.includes('basics') || 
          currentPath.includes('network') || 
          currentPath.includes('programming')) {
        document.getElementById('courses-link')?.classList.add('active-link');
      } 
      // Other special pages for the More dropdown
      else if (currentPath.includes('placement') || 
               currentPath.includes('gallery') || 
               currentPath.includes('careers') || 
               currentPath.includes('blog') || 
               currentPath.includes('testimonials') || 
               currentPath.includes('booksession')) {
        document.getElementById('more-link')?.classList.add('active-link');
      } 
      // Direct matches from our map
      else {
        const linkId = pathToLinkMap[currentPath];
        if (linkId) {
          document.getElementById(linkId)?.classList.add('active-link');
        }
      }
    }
    
    // Function to initialize header functionality
    function initializeHeader() {
      // Mobile menu toggle
      const menuIcon = document.getElementById('menu-icon');
      const navLinks = document.getElementById('nav-links');
      
      if (menuIcon && navLinks) {
        menuIcon.addEventListener('click', () => {
          navLinks.classList.toggle('active');
        });
      }
      
      // Mobile dropdown functionality
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
    
    // Function to initialize login/register functionality
    function initializeAuthFunctionality() {
      // DOM Elements
      const loginBtn = document.getElementById('loginBtn');
      const logoutBtn = document.getElementById('logoutBtn');
      const loginModal = document.getElementById('loginModal');
      const registerModal = document.getElementById('registerModal');
      const closeButtons = document.querySelectorAll('.close');
      const switchToRegister = document.getElementById('switchToRegister');
      const switchToLogin = document.getElementById('switchToLogin');
      const googleSignInBtn = document.getElementById('googleSignInBtn');
      const googleSignInBtnLogin = document.getElementById('googleSignInBtnLogin');
      
      // Event Listeners for opening modals
      if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('Login button clicked');
          if (loginModal) {
            loginModal.style.display = 'block';
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
          if (registerModal) registerModal.style.display = 'block';
        });
      }
      
      if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
          e.preventDefault();
          if (registerModal) registerModal.style.display = 'none';
          if (loginModal) loginModal.style.display = 'block';
        });
      }
      
      // Connect the remaining Firebase-specific functionality by calling the 
      // functions from your main script.js if they're exposed globally
      if (typeof initializeFirebaseAuth === 'function') {
        initializeFirebaseAuth();
      }
    }
  });