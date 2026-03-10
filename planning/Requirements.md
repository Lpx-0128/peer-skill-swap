# SkillSwap — Requirements

## Functional Requirements

### User Registration
- The system shall allow new users to create an account by providing a username, email, and password.
- The system shall require users to select at least one skill they can teach and one skill they want to learn during registration.
- The system shall store the user's profile information (username, email, skills to teach, skills to learn) upon successful registration.
- The system shall prevent duplicate accounts by ensuring each email address is unique.
- The system shall display appropriate error messages when registration fails (e.g., email already in use, missing required fields).

### User Login
- The system shall allow registered users to log in using their email and password.
- The system shall authenticate users via Supabase email/password authentication.
- The system shall maintain a persistent login session so that users remain logged in until they manually log out.
- The system shall redirect authenticated users to the main app layout upon successful login.
- The system shall display appropriate error messages for invalid login attempts (e.g., incorrect password, unregistered email).

### Main Dashboard (App Layout)
- The system shall present the main app layout with a bottom navigation bar containing three sections: Explore, Peers, and Profile. There should be a button on the top right corner of the screen to access the notifications screen. After that, a swap screen should be accessible from the peers screen.
- The Explore screen shall display available users and their skills, allowing the current user to discover potential skill swap partners.
- The Peers screen shall display the user's connected peers and pending connection requests.
- The Swap screen shall display shared media content between connected peers.
- The Profile screen shall display the user's own profile information, including username, email, bio, skills, achievements, average rating, and number of ratings received.
- The Notifications screen shall display the user's in-app notifications.

### Submit Requests & Upload Data
- The system shall allow users to send connection requests to other users for skill swapping.
- The system shall allow the receiving user to accept or decline a connection request.
- The system shall allow connected peers to upload media content (images and videos) to share skill-related resources.
- The system shall require a title and description when uploading media content.
- The system shall store uploaded media and associate it with the relevant connection between two users.

### Reviews & Ratings
- The system shall allow users to rate their connected peers using a multi-criteria rating system consisting of three categories: Teaching Quality, Responsiveness, and Reliability.
- The system shall limit each user to one rating per connection (i.e., a user can only rate a specific peer once per connection).
- The system shall calculate and display the average rating and the total number of ratings received on each user's profile.
- The system shall use a numerical scale (e.g., 1 to 5 stars) for each rating criterion.

### Notifications
- The system shall generate an in-app notification when a user receives a new connection request.
- The system shall generate an in-app notification when a connected peer uploads new swap media content.
- The system shall allow users to view all their notifications in the Notifications screen.
- The system shall visually distinguish between read and unread notifications.
- The system shall allow users to mark notifications as read.

## Non-Functional Requirements

### Platform & Usability
- The application shall be a mobile-first web application accessible via modern web browsers.
- The application shall be designed specifically for the Taylor's University student community as the target user base.
- The user interface shall follow a mobile-first design philosophy, ensuring usability on small screens as the primary experience.
- The application shall provide smooth page transitions and micro-animations to deliver a premium user experience.

### Technology Stack
- The frontend shall be built using React with Vite and TypeScript.
- The backend shall use Supabase for database management, authentication, and file storage.
- The application shall use Tailwind CSS for styling.
- The application shall use Framer Motion for UI animations.

### Security
- User passwords shall be securely managed through Supabase Authentication and shall never be stored in plain text.
- The system shall ensure that users can only access their own profile data and connections.
- The system shall ensure that only connected peers can exchange swap media with each other.

### Performance & Reliability
- The application shall load the main app layout within a reasonable time on standard mobile network connections.
- Uploaded media files shall be limited to images and videos to manage storage and bandwidth.
- The system shall handle concurrent users without significant degradation in response time.

### Maintainability
- The codebase shall follow a modular component-based architecture to ensure maintainability and scalability.
- The project shall use a structured directory layout separating components, utilities, and library configurations.
