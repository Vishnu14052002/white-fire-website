document.addEventListener('DOMContentLoaded', function() {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      headerContainer.innerHTML = `
        <header class="main-header">
          <div class="logo">
            <a href="/index.html"><img src="resources/Whitefirelogo.png" alt="Logo"></a>
          </div>
          <nav class="nav-links" id="nav-links">
            <a href="#" class="active-link">Home</a>
            <div class="dropdown courses-dropdown">
              <a href="/courses.html" class="dropbtn">Courses <i class="fas fa-chevron-down"></i></a>
              <div class="dropdown-content">
                <a href="/cloud-computing-training-courses-chelmsford.html">Cloud Computing</a>
                <a href="/data-science-training-course-chelmsford.html">Data Science</a>
                <a href="/data-base-administration-training-course-chelmsford.html">Database Administration</a>
                <a href="/it-basics-skill-training-course-chelmsford.html">IT Basic Skills</a>
                <a href="/network-administration-training-course-chelmsford.html">Network Administration</a>
                <a href="programming-training-course-chelmsford.html">Programming Languages</a>
              </div>
            </div>
            <a href="/about.html">About Us</a>
            
            <a href="/syllabus.html" class="nav-syllabus-link">
              <div class="magic-syllabus-container">
                <i class="fas fa-crown syllabus-crown"></i>
                <span class="magic-text">Magic Syllabus</span>
              </div>
            </a>
            
            <div class="dropdown">
              <a href="#" class="dropbtn">More <i class="fas fa-chevron-down"></i></a>
              <div class="dropdown-content">
                <a href="/placement.html">Placements</a>
                <a href="/gallery.html">Gallery</a>
                <a href="/careers.html">Careers</a>
                <a href="/blog.html">Tech Blog</a>
                <a href="/testimonials.html">Testimonials</a>
                <a href="/booksession.html">Free Session</a>
              </div>
            </div>
        
            <div class="mobile-only-links">
              <div class="mobile-dropdown">
                <div class="mobile-dropdown-header" data-target="mobile-courses-dropdown">
                  Courses <i class="fas fa-chevron-down"></i>
                </div>
                <div class="mobile-dropdown-content" id="mobile-courses-dropdown">
                  <a href="/cloud-computing-training-courses-chelmsford.html">Cloud Computing</a>
                  <a href="/data-science-training-course-chelmsford.html">Data Science</a>
                  <a href="/data-base-administration-training-course-chelmsford.html">Database Administration</a>
                  <a href="/it-basics-skill-training-course-chelmsford.html">IT Basic Skills</a>
                  <a href="/network-administration-training-course-chelmsford.html">Network Administration</a>
                  <a href="/programming-training-course-chelmsford.html">Programming Languages</a>
                </div>
              </div>
              
              <div class="mobile-dropdown">
                <div class="mobile-dropdown-header" data-target="mobile-more-dropdown">
                  More <i class="fas fa-chevron-down"></i>
                </div>
                <div class="mobile-dropdown-content" id="mobile-more-dropdown">
                  <a href="/placements.html">Placements</a>
                  <a href="/gallery.html">Gallery</a>
                  <a href="/careers.html">Other Careers</a>
                  <a href="/blog.html">Tech Blog</a>
                  <a href="/testimonials.html">Testimonials</a>
                  <a href="/booksession.html">Free Session</a>
                </div>
              </div>
            </div>
        
            <div class="auth-section">
              <div id="loggedOutView">
                <a href="#" id="loginBtn">Login/Register</a>
              </div>
              <div id="loggedInView" style="display: none;">
                <span id="welcomeUser"></span>
                <button id="logoutBtn">Logout</button>
              </div>
            </div>
          </nav>
          <div class="menu-icon" id="menu-icon">☰</div>
        </header>
  
        <!-- Login Modal -->
        <div class="modal" id="loginModal">
          <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Login</h2>
            <div id="loginError" class="error-message"></div>
            <form id="loginForm">
              <div class="form-group">
                <label for="loginEmail">Email</label>
                <input type="email" id="loginEmail" required>
              </div>
              <div class="form-group">
                <label for="loginPassword">Password</label>
                <input type="password" id="loginPassword" required>
              </div>
              <button type="submit">Login</button>
            </form>
            
            <div class="separator">
              <span>OR</span>
            </div>
            
            <button id="googleSignInBtnLogin" class="google-signin-btn">
              <i class="fab fa-google"></i> Sign in with Google
            </button>
            
            <p>Don't have an account? <a href="#" style="text-decoration: none;color: black;" id="switchToRegister">Register here</a></p>
          </div>
        </div>
        
        <!-- Register Modal --> 
        <div class="modal" id="registerModal">
          <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Register</h2>
            <div id="registerError" class="error-message"></div>
            <div id="registerSuccess" class="success-message"></div>
            <form id="registerForm">
              <div class="form-group">
                <label for="registerName">Full Name</label>
                <input type="text" id="registerName" required>
              </div>
              <div class="form-group">
                <label for="registerPhone">Phone Number</label>
                <input type="tel" id="registerPhone" required>
              </div>
              <div class="form-group">
                <label for="registerEmail">Email</label>
                <input type="email" id="registerEmail" required>
              </div>
              <div class="form-group">
                <label for="registerPassword">Password</label>
                <input type="password" id="registerPassword" required>
              </div>
              <button type="submit">Register</button>
            </form>
            
            <div class="separator">
              <span>OR</span>
            </div>
            
            <button id="googleSignInBtn" class="google-signin-btn">
              <i class="fab fa-google"></i> Register with Google
            </button>
            
            <p>Already have an account? <a href="#" style="text-decoration: none;color: black;" id="switchToLogin">Login here</a></p>
          </div>
        </div>
      `;
  
      // Handle active link for current page
      const currentPage = window.location.pathname.split('/').pop();
      const links = headerContainer.querySelectorAll('.nav-links > a');
      
      links.forEach(link => {
        link.classList.remove('active-link');
        const linkPage = link.getAttribute('href').split('/').pop();
        
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
          link.classList.add('active-link');
        }
      });
  
      // Initialize mobile menu functionality
      const menuIcon = headerContainer.querySelector('#menu-icon');
      const navLinks = headerContainer.querySelector('#nav-links');
  
      if (menuIcon && navLinks) {
        menuIcon.addEventListener('click', () => {
          navLinks.classList.toggle('active');
        });
      }
  
      // Mobile dropdown functionality
      const mobileDropdownHeaders = headerContainer.querySelectorAll('.mobile-dropdown-header');
      
      mobileDropdownHeaders.forEach(header => {
        header.addEventListener('click', function() {
          this.classList.toggle('active');
          
          const targetId = this.getAttribute('data-target');
          const dropdownContent = document.getElementById(targetId);
          
          if (dropdownContent) {
            dropdownContent.classList.toggle('show');
          }
        });
      });
    }
  });