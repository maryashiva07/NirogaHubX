NirogaHub
NirogaHub is a healthcare platform designed to help patients
discover doctors and clinics, book consultation tokens, and track their
place in the queue. Doctors can manage their profiles, patient queue,
consultation status, history, and prescriptions.
Update the deployment URLs and environment-variable names below to
match your current configuration before publishing this README.

Features
Patient
- Patient registration and login with JWT-based authentication
- Browse and search doctors
- View doctor and clinic information
- Book consultation tokens
- Track token status and queue updates
- View appointment history and prescriptions
- Manage patient profile details and photo
  
Doctor
- Doctor registration and login
- Manage doctor profile and clinic information
- View patients and appointments
- Manage the token queue with Call Next and Complete & Next
- Track consultation status
- Access patient history and prescription information
Backend and infrastructure
- REST APIs built with Node.js and Express.js
- MySQL database with Sequelize ORM
- Redis-backed API rate limiting
- Socket.IO for real-time queue updates
- JWT authentication and role-based access for patients and doctors
- Cashfree payment gateway integration (configure sandbox or
  production credentials as appropriate)
Tech Stack
  Area                      Technologies
  Frontend                  React, Vite, JavaScript, CSS
  Backend                   Node.js, Express.js
  Database                  MySQL, Sequelize
  Authentication            JWT
  Real-time updates         Socket.IO
  Caching / rate limiting   Redis
  Payments                  Cashfree
