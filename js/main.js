window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

//Nav
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
});

// Set active nav link based on current page
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    const navLinks = document.querySelectorAll('.nav-link');
    const homeLink = document.querySelector('.nav-link[data-page="home"]');

    navLinks.forEach(link => link.classList.remove('active'));

    const isHomePage = currentPath === '/' || currentPath.includes('index.html');

    if (isHomePage) {
        homeLink.classList.add('active');
        
        if (currentHash) {
            const sectionLink = document.querySelector(`.nav-link[href$="${currentHash}"]`);
            if (sectionLink && sectionLink !== homeLink) {
                sectionLink.classList.add('active');
            }
        }
    } else if (currentPath.includes('about.html')) {
        document.querySelector('.nav-link[data-page="about"]').classList.add('active');
    } else if (currentPath.includes('contact.html')) {
        document.querySelector('.nav-link[data-page="contact"]').classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', setActiveNavLink);
window.addEventListener('hashchange', setActiveNavLink);

window.addEventListener('scroll', () => {
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        const homeLink = document.querySelector('.nav-link[data-page="home"]');
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.pageYOffset + 100;

        homeLink.classList.add('active');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                const sectionLink = document.querySelector(`.nav-link[href*="#${sectionId}"]`);
                if (sectionLink && sectionLink !== homeLink) {
                    sectionLink.classList.add('active');
                }
            } else {
                const sectionLink = document.querySelector(`.nav-link[href*="#${sectionId}"]`);
                if (sectionLink && sectionLink !== homeLink) {
                    sectionLink.classList.remove('active');
                }
            }
        });
    }
});

//Slider
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;
        
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        currentSlide = index;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function startAutoSlide() {
        slideInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    showSlide(0);
    startAutoSlide();
});



// Load projects
function loadProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <img src="images/${project.image}" alt="${project.name}">
            <h3>${project.name}</h3>
            <p>${project.description}</p>
        `;
        projectsGrid.appendChild(projectCard);
    });
}
function displayProjects() {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const projectsGrid = document.getElementById('projects-grid');
    
    projectsGrid.innerHTML = '';
    
    projects.forEach(project => {
        const technologies = project.technologies.split(',').map(tech => 
            `<span>${tech.trim()}</span>`
        ).join('');

        const projectCard = `
            <div class="project-card">
                <img src="${project.image || 'default-project-image.jpg'}" alt="${project.title}">
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-technologies">
                        ${technologies}
                    </div>
                </div>
            </div>
        `;
        projectsGrid.innerHTML += projectCard;
    });
}
document.addEventListener('DOMContentLoaded', displayProjects);



// Contact Form
function handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject ? form.subject.value.trim() : '';
    const messageText = form.message.value.trim();

    if (!name || !email || !subject || !messageText) {
        alert('Please fill in all required fields');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return false;
    }

    if (name.length < 4) {
        alert('Name must be at least 4 characters long');
        return false;
    }

    if (messageText.length < 10) {
        alert('Message must be at least 10 characters long');
        return false;
    }

    const message = {
        id: Date.now(),
        name: name,
        email: email,
        subject: subject || 'Contact Form Submission',
        message: messageText,
        date: new Date().toISOString(),
        read: false
    };

    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    messages.push(message);
    localStorage.setItem('messages', JSON.stringify(messages));

    form.reset();
    alert('Message sent successfully!');
    
    window.location.href = '../index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

//Reveal Function
function reveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(reveal, 100);
});

window.addEventListener('scroll', reveal, { passive: true });
reveal();


//Counter Function
const counters = document.querySelectorAll('.counter');
const speed = 9999;

function animateCounter() {
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(() => animateCounter(), 1);
        } else {
            counter.innerText = target;
        }
    });
}


const statisticsSection = document.querySelector('.statistics-section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter();
        }
    });
}, { threshold: 0.5 });

if (statisticsSection) {
    observer.observe(statisticsSection);
}

(() => {
    'use strict'
    const forms = document.querySelectorAll('.needs-validation')
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            form.classList.add('was-validated')
        }, false)
    })
})()