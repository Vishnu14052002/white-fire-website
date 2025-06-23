document.addEventListener('DOMContentLoaded', function() {
    const headerContainer = document.getElementById('header-container');
    
    if (headerContainer) {
      // Load the header content using fetch
      fetch('header.html')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(html => {
          headerContainer.innerHTML = html;
          
          // After loading the header, initialize the event handlers
          initializeHeader();
          
          // Dispatch an event to notify that the header is loaded
          const headerLoadedEvent = new CustomEvent('header-loaded');
          document.dispatchEvent(headerLoadedEvent);
        })
        .catch(error => {
          console.error('Error loading header:', error);
          headerContainer.innerHTML = '<p>Error loading header. Please refresh the page.</p>';
        });
    }
    
    function initializeHeader() {
      // Set active link based on current page
      setActiveLink();
      
      // Initialize menu icon
      const menuIcon = document.getElementById('menu-icon');
      const navLinks = document.getElementById('nav-links');
      
      if (menuIcon && navLinks) {
        menuIcon.addEventListener('click', () => {
          navLinks.classList.toggle('active');
        });
      }
      
      // Initialize mobile dropdowns
      const mobileDropdownHeaders = document.querySelectorAll('.mobile-dropdown-header');
      
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
    
    function setActiveLink() {
      // Get current page path
      const currentPath = window.location.pathname;
      
      // Remove active-link class from all navigation links
      const allNavLinks = document.querySelectorAll('.nav-links > a, .dropdown > a');
      allNavLinks.forEach(link => {
        link.classList.remove('active-link');
      });
      
      // Handle the home page case
      if (currentPath === '/' || currentPath.endsWith('/index.html')) {
        const homeLink = document.querySelector('.nav-links > a[href="#"], .nav-links > a[href="index.html"], .nav-links > a[href="/index.html"]');
        if (homeLink) {
          homeLink.classList.add('active-link');
        }
        return;
      }
      
      // For other pages, find matching links
      allNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Check if the current path ends with the href value
        if (currentPath.endsWith(href) || 
            // Handle links that might not have the leading slash
            currentPath.endsWith('/' + href)) {
          link.classList.add('active-link');
        }
        
        // Special case for about.html
        if (currentPath.endsWith('/about.html') && href === '/about.html') {
          link.classList.add('active-link');
        }
      });
      
      // Handle dropdown menu active states
      const dropdownLinks = document.querySelectorAll('.dropdown-content a');
      dropdownLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        if (currentPath.endsWith(href) || currentPath.endsWith('/' + href)) {
          // When a dropdown item is active, also highlight the parent dropdown button
          const parentDropdown = link.closest('.dropdown');
          if (parentDropdown) {
            const dropdownBtn = parentDropdown.querySelector('.dropbtn');
            if (dropdownBtn) {
              dropdownBtn.classList.add('active-link');
            }
          }
        }
      });
    }
  });