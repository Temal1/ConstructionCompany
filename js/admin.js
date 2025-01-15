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


// Modal Functionality
const modal = document.getElementById('projectModal');
const openModalBtn = document.getElementById('openProjectModal');
const closeModalBtn = document.getElementById('closeProjectModal');

const openModal = () => {
    const modal = document.getElementById('projectModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modal.classList.add('active');
    
    setTimeout(() => {
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'perspective(1000px) rotateX(0) scale(1) translateY(0)';
    }, 100);
};

const closeModal = () => {
    const modal = document.getElementById('projectModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'perspective(1000px) scale(0.9) translateY(30px)';
    
    setTimeout(() => {
        modal.classList.remove('active');
        modalContent.removeAttribute('style');
    }, 300);
};

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

document.getElementById('projectImage').addEventListener('change', function(e) {
    const preview = document.getElementById('imagePreview');
    const file = e.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        }
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
});

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
        form.technologies.value = project.technologies || '';
        
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.innerHTML = project.image ? 
                `<img src="${project.image}" alt="Current project image">` : '';
        }
        
        isEditing = true;
        editingProjectId = projectId;
        form.querySelector('button[type="submit"]').textContent = 'Update Project';
        
        openModal();
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
    const imageFile = form.image.files[0];
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');

    const saveProject = (imageData) => {
        const projectData = {
            title: form.title.value.trim(),
            description: form.description.value.trim(),
            image: imageData,
            technologies: form.technologies.value.trim(),
            date: new Date().toISOString()
        };

        if (isEditing && editingProjectId) {
            const index = projects.findIndex(p => p.id === editingProjectId);
            if (index !== -1) {
                projectData.id = editingProjectId;
                projects[index] = { ...projects[index], ...projectData };
            }
        } else {
            projectData.id = Date.now();
            projects.push(projectData);
        }

        localStorage.setItem('projects', JSON.stringify(projects));
        form.reset();
        if (document.getElementById('imagePreview')) {
            document.getElementById('imagePreview').innerHTML = '';
        }
        closeModal();
        loadProjects();
        updateStats();
        
        isEditing = false;
        editingProjectId = null;
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => saveProject(e.target.result);
        reader.readAsDataURL(imageFile);
    } else if (isEditing) {
        const existingProject = projects.find(p => p.id === editingProjectId);
        saveProject(existingProject.image);
    } else {
        alert('Please select an image');
    }
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
        row.innerHTML = '<td colspan="6" class="no-messages">No messages yet</td>';
        tableBody.appendChild(row);
        return;
    }

    messages.forEach(msg => {
        const row = document.createElement('tr');
        row.className = msg.read ? 'read-message' : 'unread-message';
        row.innerHTML = `
            <td>${msg.name}</td>
            <td>${msg.email}</td>
            <td>${msg.subject}</td>
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



// jQuery Enhancements
$(document).ready(function() {
    $('.stat-card').each(function(index) {
        $(this).delay(200 * index).fadeIn(500);
    });

    $('#projects-table tbody tr').hover(
        function() { $(this).addClass('hover').effect('highlight', {}, 1000); },
        function() { $(this).removeClass('hover'); }
    );

    $('#projectForm').on('submit', function(e) {
        e.preventDefault();
        const form = $(this);
        
        $('.submit-btn', form).addClass('loading').prop('disabled', true);
        
        setTimeout(() => {
            handleProjectSubmit(e);
            
            $('.modal-content').effect('bounce', { times: 3 }, 300);
            
            setTimeout(() => {
                closeModal();
                
                $('<div>')
                    .addClass('notification')
                    .text('Project saved successfully!')
                    .appendTo('body')
                    .fadeIn(400)
                    .delay(2000)
                    .fadeOut(400, function() { $(this).remove(); });
            }, 500);
        }, 800);
    });

    const modalContent = $('.modal-content');
    
    $('#openProjectModal').click(function() {
        modalContent.css('transform', 'scale(0.7)');
        $('.modal').fadeIn(300, function() {
            modalContent.transition({
                scale: 1,
                opacity: 1
            }, 500, 'easeOutBack');
        });
    });

    function smoothScrollToForm() {
        $('html, body').animate({
            scrollTop: $('#projectForm').offset().top - 100
        }, 800, 'easeInOutQuad');
    }
});