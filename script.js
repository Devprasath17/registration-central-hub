
// Global variables
let currentUser = null;
let events = [];
let registrations = [];
let editingEventId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load data from localStorage
    loadData();
    
    // Set up event listeners based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === '') {
        setupLoginPage();
    } else if (currentPage === 'user-dashboard.html') {
        setupUserDashboard();
    } else if (currentPage === 'admin-dashboard.html') {
        setupAdminDashboard();
    }
}

// Data management
function loadData() {
    // Load or initialize sample data
    events = JSON.parse(localStorage.getItem('events')) || [
        {
            id: 1,
            title: "Web Development Conference 2024",
            date: "2024-07-15T09:00",
            venue: "Tech Convention Center, San Francisco",
            description: "Join industry experts for a full day of web development insights, latest trends, and networking opportunities.",
            capacity: 200,
            registrations: 0
        },
        {
            id: 2,
            title: "Digital Marketing Summit",
            date: "2024-07-22T10:00",
            venue: "Business Hub, New York",
            description: "Discover cutting-edge digital marketing strategies and tools to grow your business in the digital age.",
            capacity: 150,
            registrations: 0
        },
        {
            id: 3,
            title: "AI & Machine Learning Workshop",
            date: "2024-08-05T14:00",
            venue: "Innovation Lab, Austin",
            description: "Hands-on workshop covering the fundamentals of AI and machine learning with practical applications.",
            capacity: 100,
            registrations: 0
        }
    ];
    
    registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    
    // Update registration counts
    updateRegistrationCounts();
}

function saveData() {
    localStorage.setItem('events', JSON.stringify(events));
    localStorage.setItem('registrations', JSON.stringify(registrations));
}

function updateRegistrationCounts() {
    events.forEach(event => {
        event.registrations = registrations.filter(reg => reg.eventId === event.id).length;
    });
}

// Authentication
function setupLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isAdmin = document.getElementById('isAdmin').checked;
    
    // Simple authentication (in real app, this would be server-side)
    if (isAdmin) {
        if (email === 'admin@demo.com' && password === 'admin123') {
            currentUser = { email, role: 'admin' };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            window.location.href = 'admin-dashboard.html';
        } else {
            alert('Invalid admin credentials');
        }
    } else {
        if (email === 'user@demo.com' && password === 'password123') {
            currentUser = { email, role: 'user' };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            window.location.href = 'user-dashboard.html';
        } else {
            alert('Invalid user credentials');
        }
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'index.html';
}

// User Dashboard
function setupUserDashboard() {
    // Check authentication
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'user') {
        window.location.href = 'index.html';
        return;
    }
    
    // Display user email
    document.getElementById('userEmail').textContent = currentUser.email;
    
    // Set up event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Load and display events
    displayEvents();
    
    // Set up modals
    setupRegistrationModal();
}

function displayEvents() {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = '';
    
    events.forEach(event => {
        const eventCard = createEventCard(event);
        container.appendChild(eventCard);
    });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Check if user is already registered
    const isRegistered = registrations.some(reg => 
        reg.eventId === event.id && reg.email === currentUser.email
    );
    
    const spotsLeft = event.capacity - event.registrations;
    const isFull = spotsLeft <= 0;
    
    card.innerHTML = `
        <h3 class="event-title">${event.title}</h3>
        <div class="event-meta">
            <div><strong>📅 Date:</strong> ${formattedDate}</div>
            <div><strong>⏰ Time:</strong> ${formattedTime}</div>
            <div><strong>📍 Venue:</strong> ${event.venue}</div>
            <div><strong>👥 Available Spots:</strong> ${spotsLeft} / ${event.capacity}</div>
        </div>
        <p class="event-description">${event.description}</p>
        <div class="event-actions">
            ${isRegistered 
                ? '<button class="btn btn-secondary disabled">Already Registered</button>'
                : isFull 
                    ? '<button class="btn btn-secondary disabled">Event Full</button>'
                    : `<button class="btn btn-primary" onclick="openRegistrationModal(${event.id})">Register Now</button>`
            }
        </div>
    `;
    
    return card;
}

function setupRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    const closeBtn = modal.querySelector('.close');
    const form = document.getElementById('registrationForm');
    
    closeBtn.addEventListener('click', () => closeModal('registrationModal'));
    form.addEventListener('submit', handleRegistration);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal('registrationModal');
        }
    });
}

function openRegistrationModal(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    const eventDetails = document.getElementById('eventDetails');
    const eventDate = new Date(event.date);
    
    eventDetails.innerHTML = `
        <h4>${event.title}</h4>
        <p><strong>Date:</strong> ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}</p>
        <p><strong>Venue:</strong> ${event.venue}</p>
    `;
    
    // Pre-fill email with current user's email
    document.getElementById('regEmail').value = currentUser.email;
    
    // Store event ID for registration
    document.getElementById('registrationForm').dataset.eventId = eventId;
    
    document.getElementById('registrationModal').style.display = 'block';
}

function handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const eventId = parseInt(e.target.dataset.eventId);
    const email = formData.get('email');
    
    // Check for duplicate registration
    const existingRegistration = registrations.find(reg => 
        reg.eventId === eventId && reg.email === email
    );
    
    if (existingRegistration) {
        alert('You have already registered for this event!');
        return;
    }
    
    // Create registration
    const registration = {
        id: Date.now(),
        eventId: eventId,
        name: formData.get('name'),
        email: email,
        phone: formData.get('phone'),
        company: formData.get('company') || '',
        registrationDate: new Date().toISOString()
    };
    
    registrations.push(registration);
    updateRegistrationCounts();
    saveData();
    
    // Close registration modal and show confirmation
    closeModal('registrationModal');
    document.getElementById('confirmationModal').style.display = 'block';
    
    // Refresh events display
    displayEvents();
    
    // Reset form
    e.target.reset();
}

// Admin Dashboard
function setupAdminDashboard() {
    // Check authentication
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    
    // Display admin email
    document.getElementById('adminEmail').textContent = currentUser.email;
    
    // Set up event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('addEventBtn').addEventListener('click', () => openEventModal());
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    document.getElementById('eventSelect').addEventListener('change', loadRegistrations);
    
    // Load admin content
    displayAdminEvents();
    populateEventSelect();
    setupEventModal();
}

function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function displayAdminEvents() {
    const container = document.getElementById('adminEventsContainer');
    container.innerHTML = '';
    
    events.forEach(event => {
        const eventItem = createAdminEventItem(event);
        container.appendChild(eventItem);
    });
}

function createAdminEventItem(event) {
    const item = document.createElement('div');
    item.className = 'admin-event-item';
    
    const eventDate = new Date(event.date);
    
    item.innerHTML = `
        <div class="admin-event-header">
            <div>
                <h4>${event.title}</h4>
                <p><strong>Date:</strong> ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p><strong>Registrations:</strong> ${event.registrations} / ${event.capacity}</p>
            </div>
            <div class="admin-event-actions">
                <button class="btn btn-secondary" onclick="openEventModal(${event.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteEvent(${event.id})">Delete</button>
            </div>
        </div>
        <p>${event.description}</p>
    `;
    
    return item;
}

function setupEventModal() {
    const modal = document.getElementById('eventModal');
    const closeBtn = modal.querySelector('.close');
    const form = document.getElementById('eventForm');
    
    closeBtn.addEventListener('click', () => closeModal('eventModal'));
    form.addEventListener('submit', handleEventSubmission);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal('eventModal');
        }
    });
}

function openEventModal(eventId = null) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const title = document.getElementById('eventModalTitle');
    
    if (eventId) {
        // Edit mode
        const event = events.find(e => e.id === eventId);
        if (!event) return;
        
        title.textContent = 'Edit Event';
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventVenue').value = event.venue;
        document.getElementById('eventDescription').value = event.description;
        document.getElementById('eventCapacity').value = event.capacity;
        
        editingEventId = eventId;
    } else {
        // Add mode
        title.textContent = 'Add New Event';
        form.reset();
        editingEventId = null;
    }
    
    modal.style.display = 'block';
}

function handleEventSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const eventData = {
        title: formData.get('title'),
        date: formData.get('date'),
        venue: formData.get('venue'),
        description: formData.get('description'),
        capacity: parseInt(formData.get('capacity')),
        registrations: 0
    };
    
    if (editingEventId) {
        // Update existing event
        const eventIndex = events.findIndex(e => e.id === editingEventId);
        if (eventIndex !== -1) {
            events[eventIndex] = { ...events[eventIndex], ...eventData };
        }
    } else {
        // Add new event
        eventData.id = Date.now();
        events.push(eventData);
    }
    
    updateRegistrationCounts();
    saveData();
    displayAdminEvents();
    populateEventSelect();
    closeModal('eventModal');
    
    editingEventId = null;
    e.target.reset();
}

function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event? This will also remove all registrations for this event.')) {
        events = events.filter(e => e.id !== eventId);
        registrations = registrations.filter(r => r.eventId !== eventId);
        
        saveData();
        displayAdminEvents();
        populateEventSelect();
        
        // Clear registrations view if this event was selected
        const eventSelect = document.getElementById('eventSelect');
        if (parseInt(eventSelect.value) === eventId) {
            eventSelect.value = '';
            document.getElementById('registrationsContainer').innerHTML = '';
            document.getElementById('exportBtn').disabled = true;
        }
    }
}

function populateEventSelect() {
    const select = document.getElementById('eventSelect');
    select.innerHTML = '<option value="">Select an event to view registrations</option>';
    
    events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.title;
        select.appendChild(option);
    });
}

function loadRegistrations() {
    const eventId = parseInt(document.getElementById('eventSelect').value);
    const container = document.getElementById('registrationsContainer');
    const exportBtn = document.getElementById('exportBtn');
    
    if (!eventId) {
        container.innerHTML = '';
        exportBtn.disabled = true;
        return;
    }
    
    const eventRegistrations = registrations.filter(reg => reg.eventId === eventId);
    
    if (eventRegistrations.length === 0) {
        container.innerHTML = '<p>No registrations found for this event.</p>';
        exportBtn.disabled = true;
        return;
    }
    
    // Create table
    const table = document.createElement('table');
    table.className = 'registrations-table';
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Registration Date</th>
            </tr>
        </thead>
        <tbody>
            ${eventRegistrations.map(reg => `
                <tr>
                    <td>${reg.name}</td>
                    <td>${reg.email}</td>
                    <td>${reg.phone}</td>
                    <td>${reg.company || 'N/A'}</td>
                    <td>${new Date(reg.registrationDate).toLocaleDateString()}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    container.innerHTML = '';
    container.appendChild(table);
    exportBtn.disabled = false;
}

function exportToCSV() {
    const eventId = parseInt(document.getElementById('eventSelect').value);
    if (!eventId) return;
    
    const event = events.find(e => e.id === eventId);
    const eventRegistrations = registrations.filter(reg => reg.eventId === eventId);
    
    if (eventRegistrations.length === 0) {
        alert('No registrations to export');
        return;
    }
    
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Registration Date'];
    const csvContent = [
        headers.join(','),
        ...eventRegistrations.map(reg => [
            `"${reg.name}"`,
            `"${reg.email}"`,
            `"${reg.phone}"`,
            `"${reg.company || ''}"`,
            `"${new Date(reg.registrationDate).toLocaleDateString()}"`
        ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_registrations.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Utility functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Make functions globally available
window.showTab = showTab;
window.openRegistrationModal = openRegistrationModal;
window.openEventModal = openEventModal;
window.deleteEvent = deleteEvent;
window.closeModal = closeModal;
