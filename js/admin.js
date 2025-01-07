document.addEventListener('DOMContentLoaded', function() {
    const isLoginPage = document.querySelector('.login-container') !== null;
    
    if (isLoginPage) {
        handleLogin();
    } else {
        initializeDashboard();
    }
});

// Login Handler
function handleLogin() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === 'admin' && password === 'admin') {
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminUser', username);
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid credentials! Use admin/admin');
            }
        });
    }
}

// Dashboard Functionality
function initializeDashboard() {
    if (!localStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    if (!localStorage.getItem('projects')) {
        localStorage.setItem('projects', JSON.stringify([]));
    }
    if (!localStorage.getItem('messages')) {
        localStorage.setItem('messages', JSON.stringify([]));
    }

    setupLogout();
    setupProjectsManagement();
    updateStats();
    setupNavigation();
}

// Logout Functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'login.html';
        });
    }
}

// Projects Management
function setupProjectsManagement() {
    loadProjects();
}

function loadProjects() {
    const tableBody = document.querySelector('#projects-table tbody');
    if (!tableBody) return;

    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    tableBody.innerHTML = '';

    projects.forEach(project => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${project.title}</td>
            <td>${project.description.substring(0, 50)}...</td>
            <td>${project.technologies}</td>
            <td>
                <button onclick="editProject(${project.id})" class="edit-btn">Edit</button>
                <button onclick="deleteProject(${project.id})" class="delete-btn">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateProjectStatus(projectId, newStatus) {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = projects.find(p => p.id === projectId);
    if (project) {
        project.status = newStatus;
        localStorage.setItem('projects', JSON.stringify(projects));
        updateStats();
    }
}

let isEditing = false;
let editingProjectId = null;

function editProject(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
        const form = document.getElementById('projectForm');
        form.title.value = project.title;
        form.description.value = project.description;
        form.image.value = project.image || '';
        form.technologies.value = project.technologies || '';
        
        isEditing = true;
        editingProjectId = projectId;
        form.querySelector('button[type="submit"]').textContent = 'Update Project';
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

function setupProjectForm() {
    const form = document.getElementById('projectForm');
    if (!form) return;
    
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', handleProjectSubmit);
}

function handleProjectSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');

    const projectData = {
        title: form.title.value.trim(),
        description: form.description.value.trim(),
        image: form.image.value.trim(),
        technologies: form.technologies.value.trim(),
        date: new Date().toISOString()
    };

    if (isEditing && editingProjectId) {
        const index = projects.findIndex(p => p.id === editingProjectId);
        if (index !== -1) {
            projects[index] = {
                ...projects[index],
                ...projectData
            };
        }
        isEditing = false;
        editingProjectId = null;
    } else {
        projectData.id = Date.now();
        projects.push(projectData);
    }

    localStorage.setItem('projects', JSON.stringify(projects));
    form.reset();
    form.querySelector('button[type="submit"]').textContent = 'Add Project';
    loadProjects();
    updateStats();
}

function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const updatedProjects = projects.filter(p => p.id !== projectId);
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        loadProjects();
        updateStats();
    }
}

// Stats Update
function updateStats() {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');

    const totalProjectsEl = document.getElementById('total-projects');
    const newMessagesEl = document.getElementById('new-messages');

    if (totalProjectsEl) {
        totalProjectsEl.textContent = projects.length;
    }
    if (newMessagesEl) {
        const unreadMessages = messages.filter(m => !m.read).length;
        newMessagesEl.textContent = unreadMessages;
    }
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.dashboard-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').includes('messages.html')) {
                window.location.href = 'messages.html';
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupProjectForm();
    loadProjects();
    updateStats();
});



//Messages
function loadMessages() {
    const tableBody = document.querySelector('#messages-table tbody');
    if (!tableBody) return;

    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    tableBody.innerHTML = '';
    
    if (messages.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="no-messages">No messages yet</td>';
        tableBody.appendChild(row);
        return;
    }

    messages.forEach(msg => {
        const row = document.createElement('tr');
        row.className = msg.read ? 'read-message' : 'unread-message';
        row.innerHTML = `
            <td>${msg.name}</td>
            <td>${msg.email}</td>
            <td>${msg.message}</td>
            <td>${new Date(msg.date).toLocaleString()}</td>
            <td>
                <button class="read-btn" onclick="markAsRead('${msg.date}')" ${msg.read ? 'disabled' : ''}>
                    ${msg.read ? 'Read' : 'Mark as Read'}
                </button>
                <button class="delete-btn" onclick="deleteMessage('${msg.date}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateMessageStats() {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const totalMessages = document.getElementById('total-messages');
    const unreadMessages = document.getElementById('unread-messages');
    
    if (totalMessages) totalMessages.textContent = messages.length;
    if (unreadMessages) unreadMessages.textContent = messages.filter(m => !m.read).length;
}



function updateMessageStats() {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    document.getElementById('total-messages').textContent = messages.length;
    document.getElementById('unread-messages').textContent = messages.filter(m => !m.read).length;
}

function markAsRead(messageDate) {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const messageIndex = messages.findIndex(m => m.date === messageDate);
    
    if (messageIndex !== -1) {
        messages[messageIndex].read = true;
        localStorage.setItem('messages', JSON.stringify(messages));
        loadMessages();
    }
}

function deleteMessage(messageDate) {
    if (confirm('Are you sure you want to delete this message?')) {
        let messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages = messages.filter(message => message.date !== messageDate);
        localStorage.setItem('messages', JSON.stringify(messages));
        loadMessages();
    }
}



//Settings
function setupSettingsForm() {
    const form = document.getElementById('settingsForm');
    if (!form) return;

    const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    if (adminSettings.name) form.adminName.value = adminSettings.name;
    if (adminSettings.email) form.adminEmail.value = adminSettings.email;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newPassword = form.newPassword.value;
        const confirmPassword = form.confirmPassword.value;
        
        if (newPassword && newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        const settings = {
            name: form.adminName.value.trim(),
            email: form.adminEmail.value.trim()
        };

        if (newPassword) {
            settings.password = newPassword;
        }

        localStorage.setItem('adminSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
        
        form.newPassword.value = '';
        form.confirmPassword.value = '';
        form.currentPassword.value = '';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupSettingsForm();
});