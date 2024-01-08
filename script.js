function showQuotes() {
    let quotes = document.querySelectorAll('.card-text2');
    let index = 0;

    function displayNextQuote(){
        quotes.forEach(quote =>{
            quote.style.display ='none';
        });
        quotes[index].style.display = 'block';
        index++;
        if(index>=quotes.length){
            index=0;
        }
    }
    
    displayNextQuote();
    setInterval(displayNextQuote, 3000);
}
window.onload = showQuotes;
document.addEventListener("DOMContentLoaded", function () {
    // Function to update date and time
    function updateDateTime() {
      let now = new Date();
      let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let day = daysOfWeek[now.getDay()];
      let date = now.getDate();
      let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      let month = monthNames[now.getMonth()];
      let year = now.getFullYear();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      let seconds = now.getSeconds();
      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;

      var formattedDateTime = "" + day + ", " + date + " " + month + " " + year + "\n" + hours + ":" + minutes + ":" + seconds;
      document.getElementById("datetime").innerText = formattedDateTime;
    }
    // Call the updateDateTime function initially and then set an interval to update it every second
    updateDateTime();
    setInterval(updateDateTime, 1000);
  });

//signup form 

    document.addEventListener("DOMContentLoaded", function () {
        const signupForm = document.getElementById('signupForm');
        const toastSignup = document.getElementById('toastSignup');
        const myModal = new bootstrap.Modal(document.getElementById('myModal'));

        signupForm.addEventListener('submit', async function (event) {
            event.preventDefault();
    
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value,
            };
    
            try {
                const response = await fetch("/signup", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
    
                const data = await response.json();
    
                const toastMessage = data.message;
                const successParagraph = toastSignup.querySelector('p');
                successParagraph.innerText = toastMessage;
                toastSignup.style.display = 'block';
                myModal.hide();

                setTimeout(function () {
                    toastSignup.style.display = 'none';
                }, 2000);
            } catch (error) {
                console.error(error);
            }
        });
    });



// login form
document.addEventListener('DOMContentLoaded', async function () {
    const loginForm = document.getElementById('loginForm');
    const toastLogin = document.getElementById('toastLogin');
    const logoutButton = document.getElementById('logoutButton');
    const loginButton = document.getElementById('login');
    const myAccountButton = document.getElementById('myaccount');
    const signupButton = document.getElementById('signup');
    const marqueediv = document.getElementById('marquee-div')
    const myModal = new bootstrap.Modal(document.getElementById('loginFormModal'));

    async function checkSessionStatus() {
        const response = await fetch("/check-session");
        const { isLoggedIn } = await response.json();

        // Update the localStorage
        localStorage.setItem('isLoggedIn', isLoggedIn);

        if (isLoggedIn) {
            // Hide the login button and show the logout button and My Account button
            loginButton.style.display = 'none';
            logoutButton.style.display = 'block';
            myAccountButton.style.display = 'block';
            signupButton.style.display = 'none';
            marqueediv.style.display = 'none';
        } else {
            // Show the login button and hide the logout button and My Account button
            loginButton.style.display = 'block';
            logoutButton.style.display = 'none';
            myAccountButton.style.display = 'none';
            signupButton.style.display = 'block';
            marqueediv.style.display = 'block';
        }
    }

    // Initial check of session status on page load
    checkSessionStatus();

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = {
            email: document.getElementById('loginemail').value,
            password: document.getElementById('loginpwd').value,
        };

        try {
            const response = await fetch("/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.status === 200) {
                // Login success
                const welcomeMessage = `Welcome, ${data.email}!`;
                displayToastMessage(welcomeMessage);
                // Show the logout button and My Account button after a successful login
                logoutButton.style.display = 'block';
                myAccountButton.style.display = 'block';
                // Hide the login button after a successful login
                loginButton.style.display = 'none';
                signupButton.style.display = 'none';
                // Check and update the session status on the server
                checkSessionStatus();
            } else {
                // Login failed
                const errorMessage = data.message || 'Login failed. Please check your credentials.';
                displayToastMessage(errorMessage);
            }
            myModal.hide();
        } catch (error) {
            console.error(error);
            displayToastMessage("An error occurred during login.");
        }
    });

    logoutButton.addEventListener('click', async function () {
        // Example: Show a confirmation dialog
        const confirmLogout = confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            try {
                // Perform logout actions here (e.g., redirect, clear session data)
                alert("Logging out...");

                // Optionally, hide the logout button after logout
                logoutButton.style.display = 'none';
                // Show the login button after logout
                loginButton.style.display = 'block';
                // Hide the My Account button after logout
                myAccountButton.style.display = 'none';
                signupButton.style.display = 'block';
                // Remove login status from localStorage
                localStorage.removeItem('isLoggedIn');
                // Check and update the session status on the server
                await fetch("/logout", { method: 'POST' });
                // Check and update the session status on the client side
                checkSessionStatus();
            } catch (error) {
                console.error(error);
            }
        }
    });

    function displayToastMessage(message) {
        toastLogin.innerText = message;
        toastLogin.style.display = 'block';
        setTimeout(function () {
            toastLogin.style.display = 'none';
        }, 3000);
    }
});


document.addEventListener('DOMContentLoaded', function () {
    // Check if the user is logged in
    fetch('/check-session')
        .then(response => response.json())
        .then(data => {
            if (!data.isLoggedIn && window.location.pathname === '/myaccount.html') {
                // If not logged in and trying to access myaccount.html, redirect to the home page (index.html)
                window.location.href = '/index.html';
            }
        })
        .catch(error => console.error('Error checking session:', error));
});

//updateMyProfile
document.addEventListener('DOMContentLoaded', async function () {
    try {
        const sessionResponse = await fetch('/check-session');
        const sessionData = await sessionResponse.json();

        if (sessionData.isLoggedIn) {
            const { fname, lname, profileImagePath } = sessionData.user;

            sessionStorage.setItem('user', JSON.stringify({
                fname,
                lname,
                profileImagePath,
            }));
            updateProfileInfo(fname, lname, profileImagePath);
        }
    } catch (error) {
        console.error('Error checking session:', error);
    }

    const profileForm = document.getElementById('profileForm');
    const viewProfileButton = document.getElementById('viewProfile');
    const viewProfileContainer = document.querySelector('.viewProfile');

    profileForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(profileForm);

        if (validateInputs(formData)) {
            try {
                const response = await fetch('/update-profile', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data && data.message) {
                        showToast(data.message);
                        updateProfileInfo(data.fname, data.lname, data.profileImagePath);
                    }
                } else {
                    throw new Error(`Failed to update profile. Status: ${response.status}`);
                }
            } catch (error) {
                console.error('Error updating profile:', error);
            }
        }
    });

    function validateInputs(formData) {
        const fnameInput = formData.get('fname');
        const lnameInput = formData.get('lname');

        // Only word characters (A-Z), maximum 10 characters
        const regex = /^[A-Za-z]{1,10}$/;

        if (!regex.test(fnameInput) || !regex.test(lnameInput)) {
            showToast('No Special character no Space allow');
            return false;
        }

        return true;
    }

    function showToast(message) {
        // Your showToast implementation
    }
//viewprfoile button 
    viewProfileButton.addEventListener('click', async function () {
        try {
            const response = await fetch('/view-profile', {
                method: 'GET',
            });
    
            if (response.ok) {
                const data = await response.json();
    
                // Update the content of the viewProfileContainer with the user's profile information
                updateProfileInfoInContainer(viewProfileContainer, data.user);
            } else {
                throw new Error(`Failed to view profile. Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error viewing profile:', error);
        }
    });
    function showToast(message) {
        const toast = document.getElementById('toastAccount');
        toast.textContent = message;
        toast.style.display = 'block';
        setTimeout(() => {
            profileForm.reset();
            toast.style.display = 'none';
        }, 3000);
    }
    function updateProfileInfoInContainer(container, user) {
        const profileImageElement = container.querySelector('img');
        const { fname, lname, email, profileImagePath } = user;
    
        let relativePath = '';  // Define relativePath variable here
    
        if (profileImageElement && profileImagePath) {
            // Construct the relative path directly
            relativePath = profileImagePath.replace('C:\\myProjects\\sparrowtalk\\', '');
    
            // Create a new Image object to handle the onload event
            const img = new Image();
            img.onload = function() {
                // Update the src attribute after the image is fully loaded
                profileImageElement.src = `uploads/${relativePath}`;
            };
            img.src = `uploads/${relativePath}`;
        }
        container.innerHTML = `<p>Name: ${fname} ${lname}</p>
                               <p>Email: ${email}</p>
                               <img src="${relativePath}" width="100%" height="400" alt=""><br>
                               <!-- other profile information as needed -->`;
    }            
});

//change password logic code
document.addEventListener('DOMContentLoaded', function () {
    const accountDetailsForm = document.getElementById('accountDetailsForm'); // Change this ID to match your form ID
    const toastAccount = document.getElementById('toastAccount'); // Change this ID to match your toast div ID

    accountDetailsForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value; // Change this ID to match your email input ID
        const currentPassword = document.getElementById('currentPassword').value; // Change this ID to match your current password input ID
        const newPassword = document.getElementById('newPassword').value; // Change this ID to match your new password input ID
        const confirmPassword = document.getElementById('confirmPassword').value; // Change this ID to match your confirm password input ID

        // Basic client-side validation
        if (!email || !currentPassword || !newPassword || !confirmPassword) {
            return showToast('All fields are required');
        }

        if (newPassword !== confirmPassword) {
            return showToast('New password and confirm password do not match');
        }

        // Make an API request to your server to change the password
        try {
            const response = await fetch('/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, currentPassword, newPassword, confirmPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                // Show the toast message on success
                showToast('Password Has been Changed Successfully');
                // You can redirect or perform additional actions on success
            } else {
                showToast(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('An error occurred. Please try again.');
        }
    });

    // Function to show the toast message
    function showToast(message) {
        toastAccount.querySelector('p').innerText = message;
        toastAccount.style.display = 'block';
        accountDetailsForm.reset()
        setTimeout(function () {
            toastAccount.style.display = 'none';
        }, 3000); // Hide after 3 seconds
    }
});

// comment handaling code - blog1

document.addEventListener("DOMContentLoaded", function () {
    // Function to fetch and display comments
    async function fetchAndDisplayComments() {
        const pageId = "blog1.html"; // Replace with the actual page ID
        const response = await fetch(`/get-comments/${pageId}`);
        const data = await response.json();

        if (response.status === 200) {
            const commentsList = document.getElementById("comments-list1");
            commentsList.innerHTML = ""; // Clear existing comments

            data.comments.forEach(comment => {
                const li = document.createElement("li");

                // Sanitize and display the comment using DOMPurify
                li.innerHTML = `<span class="display-name">${DOMPurify.sanitize(comment.displayName)}:</span> <span class="comment-text">${DOMPurify.sanitize(comment.text)}</span>`;

                commentsList.appendChild(li);
            });
        }
    }

    fetchAndDisplayComments();

    const displayNameContainer = document.getElementById("display-name-container1");
    const commentInput = document.getElementById("comment-input1");
    const addCommentButton = document.getElementById("add-comment1");
    const notificationArea = document.getElementById("notification-area1");
    addCommentButton.addEventListener("click", async function () {
        const displayName = document.getElementById("display-name1").value;
        let commentText = commentInput.value;
    
        if (!displayName.trim()) {
            showNotification("Please enter your display name.");
            return;
        }
    
        if (!commentText.trim()) {
            showNotification("Please enter a valid comment.");
            return;
        }
    
        // Sanitize the comment text using DOMPurify
        commentText = DOMPurify.sanitize(commentText);
    
        // Use the correct page ID (replace 'blog1.html' with the actual page ID)
        const pageId = "blog1.html";
    
        const response = await fetch(`/comment/${pageId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ displayName, comment: commentText }),
        });
    
        if (response.status === 201) {

            showNotification("Comment added successfully");
            fetchAndDisplayComments();
            document.getElementById("display-name1").value = "";
            commentInput.value = "";
        } else {
            console.error("Failed to add comment");
        }
    });
    function showNotification(message) {
        notificationArea.innerText = message;
        notificationArea.style.display = "block";
        setTimeout(() => {
            notificationArea.style.display = "none";
        }, 2000);
    }
});
//Comment Handaling - Bojlu 2 / Blog - 2
document.addEventListener("DOMContentLoaded", function () {
    async function fetchAndDisplayComments() {
        const pageId = "bojlu2.html";
        const response = await fetch(`/get-comments/${pageId}`);
        const data = await response.json();

        if (response.status === 200) {
            const commentsList = document.getElementById("comments-list2");
            commentsList.innerHTML = ""; 

            data.comments.forEach(comment => {
                const li = document.createElement("li");
                li.innerHTML = `<span class="display-name">${DOMPurify.sanitize(comment.displayName)}:</span> <span class="comment-text">${DOMPurify.sanitize(comment.text)}</span>`;

                commentsList.appendChild(li);
            });
        }
    }
    fetchAndDisplayComments();
    const displayNameContainer = document.getElementById("display-name-container2");
    const commentInput = document.getElementById("comment-input2");
    const addCommentButton = document.getElementById("add-comment2");
    const notificationArea = document.getElementById("notification-area2");
    addCommentButton.addEventListener("click", async function () {
        const displayName = document.getElementById("display-name2").value;
        let commentText = commentInput.value;
    
        if (!displayName.trim()) {
            showNotification("Please enter your display name.");
            return;
        }
    
        if (!commentText.trim()) {
            showNotification("Please enter a valid comment.");
            return;
        }
        commentText = DOMPurify.sanitize(commentText);

        const pageId = "bojlu2.html";
    
        const response = await fetch(`/comment/${pageId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ displayName, comment: commentText }),
        });
    
        if (response.status === 201) {
            showNotification("Comment added successfully");
            fetchAndDisplayComments();
    
            document.getElementById("display-name2").value = "";
            commentInput.value = "";
        } else {
            console.error("Failed to add comment");
        }
    });
    function showNotification(message) {
        notificationArea.innerText = message;
        notificationArea.style.display = "block";

        setTimeout(() => {
            notificationArea.style.display = "none";
        }, 2000);
    }
});

//Comment Handaling - Blog 3 

document.addEventListener("DOMContentLoaded", function () {
    async function fetchAndDisplayComments() {
        const pageId = "blog3.html";
        const response = await fetch(`/get-comments/${pageId}`);
        const data = await response.json();

        if (response.status === 200) {
            const commentsList = document.getElementById("comments-list3");
            commentsList.innerHTML = ""; 

            data.comments.forEach(comment => {
                const li = document.createElement("li");
                li.innerHTML = `<span class="display-name">${DOMPurify.sanitize(comment.displayName)}:</span> <span class="comment-text">${DOMPurify.sanitize(comment.text)}</span>`;

                commentsList.appendChild(li);
            });
        }
    }
    fetchAndDisplayComments();
    const displayNameContainer = document.getElementById("display-name-container3");
    const commentInput = document.getElementById("comment-input3");
    const addCommentButton = document.getElementById("add-comment3");
    const notificationArea = document.getElementById("notification-area3");
    addCommentButton.addEventListener("click", async function () {
        const displayName = document.getElementById("display-name3").value;
        let commentText = commentInput.value;
    
        if (!displayName.trim()) {
            showNotification("Please enter your display name.");
            return;
        }
    
        if (!commentText.trim()) {
            showNotification("Please enter a valid comment.");
            return;
        }
        commentText = DOMPurify.sanitize(commentText);

        const pageId = "blog3.html";
    
        const response = await fetch(`/comment/${pageId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ displayName, comment: commentText }),
        });
    
        if (response.status === 201) {
            showNotification("Comment added successfully");
            fetchAndDisplayComments();
    
            document.getElementById("display-name3").value = "";
            commentInput.value = "";
        } else {
            console.error("Failed to add comment");
        }
    });
    function showNotification(message) {
        notificationArea.innerText = message;
        notificationArea.style.display = "block";

        setTimeout(() => {
            notificationArea.style.display = "none";
        }, 2000);
    }
});


//article form Handaling
document.addEventListener('DOMContentLoaded', function () {
    const articleForm = document.getElementById('article-form');

    articleForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const category = document.getElementById('category-input-filed').value;
        const title = document.getElementById('title-input-filed').value;
        const articleBody = document.getElementById('article-body-top-text').value;
        const reflink = document.getElementById('reflink-input-filed').value;
        const authorName = document.getElementById('authorname-input-filed').value;

        try {
            const response = await fetch('/submit-article', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category, title, articleBody, reflink, authorName }),
            });

            const result = await response.json();

            if (response.ok) {
                showNotification(result.message, 'success');
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Failed to submit article. Please try again.', 'error');
        }
    });
    //animation fucntion typwwrite
    function showNotification(message, type) {
        const toastMessage = document.getElementById('toastMessage');
        toastMessage.innerText = '';
        toastMessage.classList.add('show', type);

        let i = 0;
        const speed = 40;
    
        function typeWriter() {
            if (i < message.length) {
                const char = message.charAt(i) === ' ' ? '\xa0' : message.charAt(i);
                toastMessage.innerText += char;
                i++;
                setTimeout(typeWriter, speed);
            }
        }
        typeWriter();

        articleForm.reset();
        setTimeout(() => {
            toastMessage.classList.remove('show', type);
        }, 10000);
    }
});

//feedback form submission form handling

document.addEventListener('DOMContentLoaded', function () {
    const feedbackForm = document.getElementById('feedback-form');
    const toastSignup = document.getElementById('feedbackform-notif');
    const feedbackform = document.getElementById('feedbackform-body');
  
    feedbackForm.addEventListener('submit', async function (event) {
      event.preventDefault();
  
      const feedbackBody = document.getElementById('feedback-body').value;
  
      try {
        const response = await fetch('/submit-feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feedbackBody }),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          showNotification('Feedback submitted successfully', 'success');
        } else {
          showNotification('Failed to submit feedback. Please try again.', 'error');
        }
      } catch (error) {
        console.error(error);
        showNotification('Failed to submit feedback. Please try again.', 'error');
      }
    });

    function showNotification(message, type) {
      toastSignup.innerText = message;
      toastSignup.style.display = 'block';
      toastSignup.className = type === 'success' ? 'notification success' : 'notification error';
      feedbackForm.reset();
      setTimeout(() => {
        toastSignup.style.display = 'none';
      }, 3000);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const quotes = document.querySelectorAll('.home-quote');
    let currentIndex = 0;

    function showNextQuote() {
        quotes[currentIndex].style.display = 'none';
        currentIndex = (currentIndex + 1) % quotes.length;
        quotes[currentIndex].style.display = 'block';
    }
    quotes[currentIndex].style.display = 'block';
    setInterval(showNextQuote, 5000);
});

//pop-up controller js
function closePopUp(popUpId) {
    const popUp = document.getElementById(popUpId);
    popUp.style.display = 'none';
}
document.addEventListener('DOMContentLoaded', function () {
    const popUps = document.querySelectorAll('.col-5');

    const randomIndex = Math.floor(Math.random() * popUps.length);

    popUps[randomIndex].style.display = 'block';

    let countdown = 8;

    const countdownInterval = setInterval(function () {
        countdown--;
        const countdownDisplay = popUps[randomIndex].querySelector('.countdown');
        if (countdownDisplay) {
            countdownDisplay.textContent = countdown;
        }

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            popUps[randomIndex].style.display = 'none';
        }
    }, 1000);
    popUps.forEach((popUp, index) => {
        const closeBtn = popUp.querySelector('.close-btn');
        closeBtn.addEventListener('click', function () {
            clearInterval(countdownInterval);
            closePopUp(`pop-up-${index + 1}`);
        });
    });
});



