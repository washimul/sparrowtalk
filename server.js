const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(mongoSanitize());

// Mongoose User model for the 'user' collection
const User = mongoose.model('User', {
    email: String,
    password: String,
    fname: String,
    lname: String,
    profileImagePath: String,
});

// Use middleware
app.use(fileUpload());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Adjust this based on your environment
}));
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
// Add this line to serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/check-session', async (req, res) => {
    try {
        const isLoggedIn = !!req.session.user;
        if (isLoggedIn) {
            const existingUser = await User.findById(req.session.user.id);
            if (existingUser) {
                return res.status(200).json({
                    isLoggedIn: true,
                    user: {
                        id: existingUser._id,
                        email: existingUser.email,
                        fname: existingUser.fname,
                        lname: existingUser.lname,
                        profileImagePath: existingUser.profileImagePath,
                    },
                });
            }
        }
        return res.status(200).json({ isLoggedIn: false });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/update-profile', async (req, res) => {
    const { fname, lname } = req.body;

    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    try {
        const existingUser = await User.findById(req.session.user.id);

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        existingUser.fname = fname;
        existingUser.lname = lname;

        if (req.files && req.files.myimage) {
            const myimage = req.files.myimage;
            const imagePath = path.join(__dirname, 'uploads', myimage.name);

            await myimage.mv(imagePath);
            existingUser.profileImagePath = imagePath;
        }

        await existingUser.save();
        return res.status(200).json({
            message: 'Profile updated successfully',
            fname: existingUser.fname,
            lname: existingUser.lname,
            profileImagePath: existingUser.profileImagePath,
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/view-profile', async (req, res) => {
    try {
        if (req.session.user) {
            const existingUser = await User.findById(req.session.user.id);

            if (existingUser) {
                return res.status(200).json({
                    user: {
                        id: existingUser._id,
                        email: existingUser.email,
                        fname: existingUser.fname,
                        lname: existingUser.lname,
                        profileImagePath: existingUser.profileImagePath,
                    },
                });
            }
        }

        return res.status(404).json({ message: 'User not found' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }

});


// Route for handling signup form submission
app.post('/signup', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    // Basic validation
    if (!email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }    

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create a new user
        const newUser = new User({ email, password });
        await newUser.save();

        // Send JSON response with success message
        return res.status(201).json({ message: 'Thank you for Joining' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

//login code
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Check if the user exists
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the password is correct
        if (existingUser.password !== password) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Store user information in the session
        req.session.user = { id: existingUser._id, email: existingUser.email, fname: existingUser.fname, lname: existingUser.lname };

        // Send JSON response with success message
        return res.status(200).json({ message: 'Login successful', email: existingUser.email });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: 'Logout successful' });
});

// Change Password
app.post('/change-password', async (req, res) => {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    // Basic validation
    if (!email || !currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if the user exists
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the current password is correct
        if (existingUser.password !== currentPassword) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // Check if the new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match' });
        }

        // Update the user's password
        existingUser.password = newPassword;
        await existingUser.save();

        // Send JSON response with success message
        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

//Comment handaling
const Comment = mongoose.model('Comment', {
    pageId: String, // Add a field to store the page ID
    comments: [
        {
            displayName: String,
            text: String,
            createdAt: { type: Date, default: Date.now },
        },
    ],
});

app.get('/get-comments/:pageId', async (req, res) => {
    const pageId = req.params.pageId;

    try {
        const comments = await Comment.findOne({ pageId });
        if (!comments) {
            return res.status(404).json({ message: 'No comments found for this page' });
        }

        return res.status(200).json({ comments: comments.comments });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to add a comment for a specific page
app.post('/comment/:pageId', async (req, res) => {
    const pageId = req.params.pageId;
    const { displayName, comment } = req.body;

    try {
        // Find the comments for the specific page or create a new one if not exists
        let comments = await Comment.findOne({ pageId });
        if (!comments) {
            comments = new Comment({ pageId, comments: [] });
        }

        // Add the comment to the comments array
        comments.comments.push({ displayName, text: comment });

        // Save the changes
        await comments.save();

        return res.status(201).json({ message: 'Comment added successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

    app.use((req, res, next) => {
        if (!req.session.user && req.path === '/myaccount.html') {
            return res.redirect('/index.html');
        }
        next();
    });

    app.get('/myaccount.html', (req, res) => {
        if (!req.session.user) {
            return res.redirect('/index.html');
        }
        res.sendFile(path.join(__dirname, 'myaccount.html'));
    });

    // Serve other pages
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

//article-submission database handaling
const Article = mongoose.model('Article', {
    category: String,
    title: String,
    articleBody: String,
    reflink: String,
    authorName: String,
    userEmail: String,
    submissionDate: { type: Date, default: Date.now },
});


app.post('/submit-article', async (req, res) => {
    const { category, title, articleBody, reflink, authorName } = req.body;

    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Unauthorized. Please log in.' });
        }

        const userEmail = req.session.user.email;

        const newArticle = new Article({
            category,
            title,
            articleBody,
            reflink,
            authorName,
            userEmail,
        });

        await newArticle.save();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sparrowtalk369@gmail.com',
                pass: 'imrqojelpcafemes',
            },
        });

        const mailOptions = {
            from: 'sparrowtalk369@gmail.com',
            to: 'sparrowtalk369@gmail.com',
            subject: 'New Article Submission',
            text: `A new article has been submitted.\n\nCategory: ${category}\nSenderEmail: ${userEmail}\nTitle: ${title}\nAuthor: ${authorName}\n\nArticle Body: ${articleBody}\nReference Link: ${reflink}`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: 'Your article received successfully.\nWe will email you once published.',
            article: newArticle,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to submit article. Please try again.' });
    }
});


//fedbackform server logic
const Feedback = mongoose.model('Feedback', {
    feedbackBody: String,
    createdAt: { type: Date, default: Date.now }
  });
  
  app.post('/submit-feedback', async (req, res) => {
    const { feedbackBody } = req.body;
  
    try {
      const newFeedback = new Feedback({
        feedbackBody,
      });
  
      await newFeedback.save();

      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: 'sparrowtalk369@gmail.com',
              pass: 'imrqojelpcafemes',
          },
      });

      const mailOptions = {
          from: 'sparrowtalk369@gmail.com',
          to: 'sparrowtalk369@gmail.com',
          subject: 'A feedback Received',
          text: `A new article has been submitted.\n\n${feedbackBody}`,
      };

      await transporter.sendMail(mailOptions);
  
      return res.status(200).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to submit feedback. Please try again.' });
    }
  });
  

    mongoose
    .connect('mongodb+srv://@mydata.d0jjezh.mongodb.net/signup?retryWrites=true&w=majority')
    .then(() => {
        console.log(`Connected to MongoDB`);
        app.listen(3000, () => {
            console.log(`Node API app is running on port 3000`);
        });
    })
    .catch((error) => {
        console.log(error);
    });
