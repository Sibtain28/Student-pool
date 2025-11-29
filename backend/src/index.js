require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

const JWT_SECRET = process.env.JWT_SECRET;

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://student-pool.vercel.app",
  "https://student-pool-8o7p.vercel.app",
];

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error("CORS not allowed"), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// =============================
// 🔒 AUTH MIDDLEWARE
// =============================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded.id && !decoded.userId && !decoded.sub) {
      return res.status(403).json({ message: 'Invalid token: No user ID found' });
    }
    
    req.user = {
      id: decoded.id || decoded.userId || decoded.sub,
      ...decoded
    };
    
    next();
  } catch (err) {
    return res.status(403).json({ 
      message: 'Invalid or expired token',
      error: err.message 
    });
  }
};

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is running" });
});

// =============================
// ⭐ AUTH ROUTES
// =============================

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return res.json({ message: "Signup successful. Please login." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// =============================
// 👤 USER ROUTES
// =============================

app.get("/api/users/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        college: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.name || "",
        name: user.name || "",
        email: user.email,
        phone: user.phone || "",
        college: user.college || "",
        verified: false,
        bio: user.profile?.bio || "",
        avatarUrl: user.profile?.avatarUrl || null
      }
    });
  } catch (error) {
    console.error("Error in /api/users/me:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, college } = req.body;

    if (parseInt(id) !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, id: { not: parseInt(id) } }
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || null,
        college: college || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        college: true,
        createdAt: true
      }
    });

    return res.json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({ message: "Error updating profile" });
  }
});

// =============================
// 🚗 RIDES ROUTES
// =============================

app.post('/api/rides/create', authenticateToken, async (req, res) => {
  try {
    const {
      destination,
      pickup_point,
      date_time,
      seats_available,
      cost_per_person,
      total_cost
    } = req.body;

    const userExists = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!userExists) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!destination || !pickup_point || !date_time || !seats_available) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const seatsInt = parseInt(seats_available);
    const costPerPerson = parseFloat(cost_per_person || 225);
    const totalCostCalc = parseFloat(total_cost || (costPerPerson * seatsInt));

    const ride = await prisma.ride.create({
      data: {
        creatorId: req.user.id,
        destination: destination,
        source: pickup_point,
        dateTime: new Date(date_time),
        seats: seatsInt,
        seatsAvailable: seatsInt,
        costPerPerson: costPerPerson,
        totalCost: totalCostCalc,
        status: 'active'
      }
    });

    // Notify all other users
    const allUsers = await prisma.user.findMany({
      where: { id: { not: req.user.id } }
    });

    const notifications = allUsers.map(user => ({
      userId: user.id,
      rideId: ride.id,
      type: 'new_ride',
      message: `New ride from ${pickup_point} to ${destination} by ${userExists.name}`,
      isRead: false
    }));

    await prisma.notification.createMany({ data: notifications });

    res.status(201).json({ message: 'Ride created successfully', ride });
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ message: 'Failed to create ride' });
  }
});

app.get('/api/rides/my-rides', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const createdRides = await prisma.ride.findMany({
      where: { creatorId: userId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        participants: true
      },
      orderBy: { dateTime: 'desc' }
    });

    const joinedRides = await prisma.ride.findMany({
      where: {
        participants: { some: { userId: userId } }
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        participants: true
      },
      orderBy: { dateTime: 'desc' }
    });

    const formatRide = (ride) => ({
      id: ride.id,
      destination: ride.destination,
      pickup_point: ride.source,
      date_time: ride.dateTime,
      seats_available: ride.seatsAvailable,
      total_seats: ride.seats,
      cost_per_person: ride.costPerPerson,
      total_cost: ride.totalCost,
      status: ride.status,
      creator: ride.creator
    });

    res.json({
      created: createdRides.map(formatRide),
      joined: joinedRides.map(formatRide)
    });
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ message: 'Failed to fetch rides' });
  }
});

app.get('/api/rides/available', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { destination, date, minSeats } = req.query;

    const where = {
      creatorId: { not: userId },
      status: 'active'
    };

    if (destination) {
      where.destination = { contains: destination, mode: 'insensitive' };
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.dateTime = { gte: startOfDay, lte: endOfDay };
    }

    if (minSeats) {
      where.seatsAvailable = { gte: parseInt(minSeats) };
    }

    const availableRides = await prisma.ride.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        participants: true
      },
      orderBy: { dateTime: 'asc' }
    });

    const formatRide = (ride) => ({
      id: ride.id,
      destination: ride.destination,
      pickup_point: ride.source,
      date_time: ride.dateTime,
      seats_available: ride.seatsAvailable,
      total_seats: ride.seats,
      cost_per_person: ride.costPerPerson,
      total_cost: ride.totalCost,
      status: ride.status,
      creator: ride.creator
    });

    res.json({ rides: availableRides.map(formatRide) });
  } catch (error) {
    console.error('Error fetching available rides:', error);
    res.status(500).json({ message: 'Failed to fetch rides' });
  }
});

app.get('/api/rides/:rideId', authenticateToken, async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id;
    const rideIdInt = parseInt(rideId, 10);

    if (isNaN(rideIdInt)) {
      return res.status(400).json({ message: 'Invalid ride ID' });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: rideIdInt },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const isCreator = ride.creatorId === userId;
    const hasJoined = ride.participants.some(p => p.userId === userId);

    const formattedRide = {
      id: ride.id,
      destination: ride.destination,
      pickup_point: ride.source,
      date_time: ride.dateTime,
      seats_available: ride.seatsAvailable,
      total_seats: ride.seats,
      cost_per_person: ride.costPerPerson,
      total_cost: ride.totalCost,
      status: ride.status,
      creator: ride.creator,
      participants: ride.participants.map(p => ({
        id: p.userId,
        participant_record_id: p.id,
        name: p.user.name,
        email: p.user.email,
        is_verified: false,
        joinedAt: p.joinedAt
      })),
      isCreator,
      hasJoined
    };

    res.json(formattedRide);
  } catch (error) {
    console.error('Error fetching ride details:', error);
    res.status(500).json({ message: 'Failed to fetch ride details' });
  }
});

// =============================
// 🔔 JOIN REQUEST & NOTIFICATIONS
// =============================

// GET JOIN STATUS - FIXED
app.get('/api/rides/:rideId/join-status', authenticateToken, async (req, res) => {
  try {
    const rideIdInt = parseInt(req.params.rideId);
    const userId = req.user.id;

    console.log('=== Check Join Status ===');
    console.log('Ride ID:', rideIdInt);
    console.log('User ID:', userId);

    // Check if user is a participant
    const isParticipant = await prisma.rideParticipant.findFirst({
      where: { rideId: rideIdInt, userId: userId }
    });

    if (isParticipant) {
      console.log('User is a participant');
      return res.json({ status: 'accepted' });
    }

    // Check for join request
    const joinRequest = await prisma.rideJoinRequest.findFirst({
      where: { rideId: rideIdInt, requesterId: userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!joinRequest) {
      console.log('No join request found');
      return res.json({ status: null });
    }

    console.log('Join request status:', joinRequest.status);
    res.json({ status: joinRequest.status });
  } catch (error) {
    console.error('Error checking join status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST JOIN RIDE - FIXED
app.post('/api/rides/:rideId/join', authenticateToken, async (req, res) => {
  try {
    const rideIdInt = parseInt(req.params.rideId);
    const userId = req.user.id;

    console.log('=== Join Ride Request ===');
    console.log('Ride ID:', rideIdInt);
    console.log('User ID:', userId);

    const ride = await prisma.ride.findUnique({
      where: { id: rideIdInt },
      include: { creator: true }
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.creatorId === userId) {
      return res.status(400).json({ message: "You can't join your own ride" });
    }

    if (ride.seatsAvailable <= 0) {
      return res.status(400).json({ message: 'No seats available' });
    }

    // Check existing requests
    const existingRequest = await prisma.rideJoinRequest.findFirst({
      where: {
        rideId: rideIdInt,
        requesterId: userId,
        status: { in: ['pending', 'accepted'] }
      }
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: existingRequest.status === 'pending' 
          ? 'You already have a pending request' 
          : 'You have already joined this ride'
      });
    }

    // Create join request
    await prisma.rideJoinRequest.create({
      data: {
        rideId: rideIdInt,
        requesterId: userId,
        status: 'pending'
      }
    });

    const requester = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: ride.creatorId,
        rideId: rideIdInt,
        requesterId: userId,
        type: 'join_request',
        message: `${requester.name} wants to join your ride to ${ride.destination}`,
        isRead: false
      }
    });

    console.log('Join request created successfully');
    res.json({ 
      success: true, 
      message: 'Join request sent successfully!',
      status: 'pending'
    });
  } catch (error) {
    console.error('Error creating join request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET NOTIFICATIONS - FIXED
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching notifications for user:', userId);

    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      include: {
        ride: {
          select: {
            id: true,
            destination: true,
            source: true,
            dateTime: true
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter logic
    const acceptedJoinRequests = new Map();
    
    notifications.forEach(notif => {
      if ((notif.type === 'participant_joined' || notif.type === 'request_accepted') 
          && notif.rideId && notif.requesterId) {
        const key = `${notif.rideId}-${notif.requesterId}`;
        acceptedJoinRequests.set(key, true);
      }
    });

    const filteredNotifications = notifications.filter(notif => {
      if (notif.type !== 'join_request') return true;
      if (!notif.rideId || !notif.requesterId) return false;
      
      const key = `${notif.rideId}-${notif.requesterId}`;
      return !acceptedJoinRequests.has(key);
    });

    const formattedNotifications = filteredNotifications.map(notif => ({
      id: notif.id,
      message: notif.message,
      type: notif.type,
      is_read: notif.isRead,
      created_at: notif.createdAt,
      ride_id: notif.rideId,
      ride: notif.ride,
      requester: notif.requester,
      requesterId: notif.requesterId
    }));

    return res.json({
      success: true,
      notifications: formattedNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ACCEPT JOIN REQUEST - FIXED
app.post('/api/notifications/:id/accept', authenticateToken, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    console.log('=== Accept Join Request ===');
    console.log('Notification ID:', notificationId);
    console.log('User ID:', userId);

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: userId,
        type: 'join_request'
      },
      include: { ride: true, requester: true }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.ride.seatsAvailable <= 0) {
      return res.status(400).json({ message: 'No seats available' });
    }

    const joinRequest = await prisma.rideJoinRequest.findFirst({
      where: {
        rideId: notification.rideId,
        requesterId: notification.requesterId
      }
    });

    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    // Check if already a participant
    const existingParticipant = await prisma.rideParticipant.findFirst({
      where: {
        rideId: notification.rideId,
        userId: notification.requesterId
      }
    });

    if (existingParticipant) {
      return res.status(400).json({ message: 'User is already a participant' });
    }

    // Update join request
    await prisma.rideJoinRequest.update({
      where: { id: joinRequest.id },
      data: { status: 'accepted' }
    });

    // Add participant
    await prisma.rideParticipant.create({
      data: {
        rideId: notification.rideId,
        userId: notification.requesterId
      }
    });

    // Update seats
    await prisma.ride.update({
      where: { id: notification.rideId },
      data: { seatsAvailable: notification.ride.seatsAvailable - 1 }
    });

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: notification.requesterId,
        rideId: notification.rideId,
        type: 'request_accepted',
        message: `Your request to join the ride to ${notification.ride.destination} has been accepted!`,
        isRead: false
      }
    });

    // Delete original notification
    await prisma.notification.delete({
      where: { id: notificationId }
    });

    // Create success notification for creator
    await prisma.notification.create({
      data: {
        userId: userId,
        rideId: notification.rideId,
        requesterId: notification.requesterId,
        type: 'participant_joined',
        message: `${notification.requester.name} has joined your ride to ${notification.ride.destination}`,
        isRead: false
      }
    });

    console.log('Join request accepted successfully');
    res.json({ success: true, message: 'Join request accepted' });
  } catch (error) {
    console.error('Error accepting join request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DECLINE JOIN REQUEST
app.post('/api/notifications/:id/decline', authenticateToken, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: userId,
        type: 'join_request'
      },
      include: { ride: true }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const joinRequest = await prisma.rideJoinRequest.findFirst({
      where: {
        rideId: notification.rideId,
        requesterId: notification.requesterId
      }
    });

    if (joinRequest) {
      await prisma.rideJoinRequest.update({
        where: { id: joinRequest.id },
        data: { status: 'declined' }
      });
    }

    await prisma.notification.create({
      data: {
        userId: notification.requesterId,
        rideId: notification.rideId,
        type: 'request_declined',
        message: `Your request to join the ride to ${notification.ride.destination} has been declined.`,
        isRead: false
      }
    });

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    res.json({ success: true, message: 'Join request declined' });
  } catch (error) {
    console.error('Error declining join request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// MARK AS READ
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// MARK ALL AS READ
app.put('/api/notifications/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE ONE
app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE ALL
app.delete('/api/notifications', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE/END RIDE
app.delete('/api/rides/:rideId', authenticateToken, async (req, res) => {
  try {
    const rideIdInt = parseInt(req.params.rideId);
    const ride = await prisma.ride.findUnique({ where: { id: rideIdInt } });
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    if (ride.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await prisma.ride.delete({ where: { id: rideIdInt } });
    res.json({ message: 'Ride deleted' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/rides/:rideId/end', authenticateToken, async (req, res) => {
  try {
    const rideIdInt = parseInt(req.params.rideId);
    const ride = await prisma.ride.findUnique({ where: { id: rideIdInt } });
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    if (ride.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedRide = await prisma.ride.update({
      where: { id: rideIdInt },
      data: { status: 'completed' }
    });
    
    res.json({ message: 'Ride ended', ride: updatedRide });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on PORT ${PORT}`));