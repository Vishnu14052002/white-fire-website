// Updated zoho-forms.js - completely removes Firebase dependencies

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
            resolve({}); // Resolve with empty object to continue form submission
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
        resolve({}); // Resolve with empty object to continue form submission
      }
    });
  }
  
  // Function to send form data to Zoho CRM
  function sendToZohoCRM(endpointUrl, formData, successCallback, errorCallback) {
    // Show loading indicator
    const submitBtn = document.activeElement;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
  
    // Get location data first
    getUserLocation()
      .then(locationData => {
        console.log('Location data:', locationData);
        
        // Add location to form data
        const dataWithLocation = {
          ...formData,
          location: locationData
        };
  
        // Send data to server
        return fetch(endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataWithLocation),
        });
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server error: ' + response.status);
        }
        return response.json();
      })
      .then(result => {
        // Reset button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        
        // Call success callback
        if (typeof successCallback === 'function') {
          successCallback(result);
        }
      })
      .catch(error => {
        console.error("Error:", error);
        
        // Reset button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        
        // Call error callback
        if (typeof errorCallback === 'function') {
          errorCallback(error);
        } else {
          alert("Something went wrong! Please try again later.");
        }
      });
  }
  
  // Function to initialize the enroll form (Enrol Now)
  function initEnrollForm() {
    console.log('Initializing Enrollment Form');
    const enrollmentForm = document.getElementById("enrollmentForm");
    
    if (enrollmentForm) {
      console.log('Enrollment form found, adding event listener');
      
      // Remove any existing event listeners
      const newEnrollmentForm = enrollmentForm.cloneNode(true);
      enrollmentForm.parentNode.replaceChild(newEnrollmentForm, enrollmentForm);
      
      // Add new event listener
      newEnrollmentForm.addEventListener("submit", function(event) {
        event.preventDefault();
        console.log('Enrollment form submitted');
        
        // Get form values
        const fullName = document.getElementById("enrollFullName").value;
        const email = document.getElementById("enrollEmail").value;
        const phone = document.getElementById("enrollPhone").value;
        const courseInterested = document.getElementById("enrollCourse").value;
        
        console.log('Form data:', { fullName, email, phone, courseInterested });
        
        // Prepare form data
        const formData = {
          name: fullName,
          email: email,
          phone: phone,
          course: courseInterested,
          source: 'Course Page Enrollment Form'
        };
        
        // Send to Zoho CRM
        sendToZohoCRM(
          "http://localhost:3000/enroll-course", 
          formData,
          function(result) {
            console.log('Enrollment success:', result);
            // Success handler
            // Hide form and show success message
            document.getElementById("enrollmentForm").style.display = "none";
            const successElement = document.getElementById("enrollmentSuccess");
            if (successElement) {
              successElement.style.display = "block";
            }
            
            // Reset the form
            newEnrollmentForm.reset();
            
            // Close modal after 3 seconds
            setTimeout(() => {
              const modal = document.getElementById("enrolModal");
              if (modal) modal.style.display = "none";
              
              // Reset view for next time
              document.getElementById("enrollmentForm").style.display = "block";
              if (successElement) successElement.style.display = "none";
            }, 3000);
          },
          function(error) {
            // Error handler
            console.error('Enrollment error:', error);
            alert("Error submitting enrollment. Please try again.");
          }
        );
      });
    } else {
      console.log('Enrollment form not found');
    }
  }
  
  // Function to initialize the booking form (Book a Session)
  function initBookingForm() {
    console.log('Initializing Booking Form');
    const bookingForm = document.getElementById("bookSessionForm");
    
    if (bookingForm) {
      console.log('Booking form found, adding event listener');
      
      // Remove any existing event listeners by cloning and replacing the form
      const newBookingForm = bookingForm.cloneNode(true);
      bookingForm.parentNode.replaceChild(newBookingForm, bookingForm);
      
      // Add new event listener
      newBookingForm.addEventListener("submit", function(event) {
        event.preventDefault();
        console.log('Booking form submitted');
        
        // Get form values
        const fullName = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const courseInterested = document.getElementById("courseInterested").value;
        const preferredDate = document.getElementById("preferredDate").value;
        const preferredTime = document.getElementById("preferredTime").value;
        
        console.log('Form data:', { fullName, email, phone, courseInterested, preferredDate, preferredTime });
        
        // Prepare form data
        const formData = {
          name: fullName,
          email: email,
          phone: phone,
          course: courseInterested,
          preferredDate: preferredDate,
          preferredTime: preferredTime,
          source: 'Course Page Booking Form'
        };
        
        // Send to Zoho CRM
        sendToZohoCRM(
          "http://localhost:3000/book-session", 
          formData,
          function(result) {
            console.log('Booking success:', result);
            // Success handler
            // Show success message
            const successElement = document.getElementById("bookingSuccess");
            if (successElement) {
              successElement.style.display = "block";
            }
            
            // Reset the form
            newBookingForm.reset();
            
            // Reset course value
            const courseInterestedField = document.getElementById("courseInterested");
            if (courseInterestedField) {
              // Get the course name from the page title or another element
              const pageTitleElement = document.querySelector("title");
              let courseName = "Course";
              if (pageTitleElement) {
                const titleText = pageTitleElement.textContent;
                if (titleText.includes("Cloud Computing")) {
                  courseName = "Cloud Computing";
                } else if (titleText.includes("Data Science")) {
                  courseName = "Data Science";
                } else if (titleText.includes("Web Development")) {
                  courseName = "Web Development";
                } else if (titleText.includes("Android Development")) {
                  courseName = "Android Development";
                }
              }
              courseInterestedField.value = courseName;
            }
            
            // Hide success message after 5 seconds
            setTimeout(() => {
              if (successElement) successElement.style.display = "none";
            }, 5000);
          },
          function(error) {
            // Error handler
            console.error('Booking error:', error);
            alert("Error booking session. Please try again.");
          }
        );
      });
    } else {
      console.log('Booking form not found');
    }
  }
  
  // Initialize everything when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Zoho CRM forms');
    
    // Set minimum date to today for the session booking form
    const preferredDateInput = document.getElementById("preferredDate");
    if (preferredDateInput) {
      const today = new Date().toISOString().split('T')[0];
      preferredDateInput.min = today;
    }
    
    // Add a slight delay to ensure all elements are loaded
    setTimeout(() => {
      // Initialize enrollment form
      initEnrollForm();
      
      // Initialize booking form
      initBookingForm();
    }, 500);
  });
  
  // If the document is already loaded, initialize immediately
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Document already loaded, initializing Zoho CRM forms');
    setTimeout(() => {
      // Initialize enrollment form
      initEnrollForm();
      
      // Initialize booking form
      initBookingForm();
    }, 500);
  }