// =============================================
// 1. ELEMENTOS
// =============================================
const enterScreen = document.getElementById('enterScreen');
const music = document.getElementById('music');
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const card = document.getElementById('profileCard');
const profileImg = document.getElementById('profileImg');
const nameText = document.getElementById('nameText');
const usernameText = document.getElementById('usernameText');
const bioText = document.getElementById('bioText');

// ===== CONTADOR E CONTROLES =====
const viewCount = document.getElementById('viewCount');
const playPauseBtn = document.getElementById('playPauseBtn');
const volumeSlider = document.getElementById('volumeSlider');

// =============================================
// 2. CONFIGURAÇÃO
// =============================================
let particles = [];
let raindrops = [];
let mouseX = -9999;
let mouseY = -9999;
let isMusicPlaying = false;
let targetRotateX = 0;
let targetRotateY = 0;
let currentRotateX = 0;
let currentRotateY = 0;
let targetScale = 1;
let currentScale = 1;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// =============================================
// 3. CORES - BRANCO
// =============================================
const colorPalette = [
    'rgba(255, 255, 255, ',
    'rgba(240, 245, 255, ',
    'rgba(220, 230, 255, ',
    'rgba(255, 255, 255, ',
];

function getRandomColor(opacity = 0.1) {
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    return color + opacity + ')';
}

// =============================================
// 4. CHUVA - BRANCA E SUTIL
// =============================================
class Raindrop {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height - canvas.height;
        this.waveOffset = Math.random() * Math.PI * 2;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.length = Math.random() * 15 + 8;
        this.speed = Math.random() * 12 + 8;
        this.opacity = Math.random() * 0.25 + 0.1;
        this.color = `rgba(255, 255, 255, ${this.opacity})`;
        this.width = Math.random() * 0.6 + 0.2;
    }

    update() {
        this.waveOffset += 0.015;
        this.x += Math.sin(this.waveOffset) * 0.2;
        this.y += this.speed;

        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
            const force = (150 - dist) / 150 * 0.05;
            this.x += dx * force;
        }

        if (this.y > canvas.height + 20) {
            this.reset();
            this.y = -10;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 1, this.y + this.length);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.1)';
        ctx.shadowBlur = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (Math.random() < 0.02) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 0.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.shadowColor = 'rgba(255,255,255,0.3)';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

// =============================================
// 5. PARTÍCULAS - MINÚSCULAS
// =============================================
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 0.8 + 0.15;
        this.speedX = (Math.random() - 0.5) * 0.12;
        this.speedY = (Math.random() - 0.5) * 0.12;
        this.opacity = Math.random() * 0.08 + 0.02;
        this.color = `rgba(255, 255, 255, ${this.opacity})`;
        this.angle = Math.random() * Math.PI * 2;
        this.orbitSpeed = Math.random() * 0.005 + 0.002;
        this.orbitRadius = Math.random() * 20 + 10;
        this.pulse = Math.random() * Math.PI * 2;
    }

    update() {
        this.pulse += 0.005;
        this.angle += this.orbitSpeed;
        this.x += Math.cos(this.angle) * 0.08 + this.speedX;
        this.y += Math.sin(this.angle) * 0.08 + this.speedY;
        
        this.size += Math.sin(this.pulse) * 0.003;
        this.size = Math.max(0.08, Math.min(1, this.size));

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100 && dist > 0) {
            const force = (100 - dist) / 100 * 0.02;
            this.x += dx * force;
            this.y += dy * force;
        }

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = 'rgba(255,255,255,0.05)';
        ctx.shadowBlur = 2;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// =============================================
// 6. INICIALIZAR
// =============================================
function initRaindrops(count = 180) {
    raindrops = [];
    for (let i = 0; i < count; i++) {
        const drop = new Raindrop();
        drop.y = Math.random() * canvas.height;
        raindrops.push(drop);
    }
}

function initParticles(count = 45) {
    particles = [];
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

initRaindrops(220);
initParticles(50);

// =============================================
// 7. ANIMAÇÃO
// =============================================
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let drop of raindrops) {
        drop.update();
        drop.draw();
    }

    for (let particle of particles) {
        particle.update();
        particle.draw();
    }

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 70) {
                const opacity = (1 - dist / 70) * 0.02;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.lineWidth = 0.15;
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animate);
}
animate();

// =============================================
// 8. MOVIMENTO DA BOX
// =============================================
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    const rect = card.getBoundingClientRect();
    const cardX = ((e.clientX - rect.left) / rect.width) * 100;
    const cardY = ((e.clientY - rect.top) / rect.height) * 100;
    
    card.style.setProperty('--mouse-x', cardX + '%');
    card.style.setProperty('--mouse-y', cardY + '%');
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    targetRotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;
    targetRotateX = ((e.clientY - centerY) / (rect.height / 2)) * -8;
    targetScale = 1.02;
});

card.addEventListener('mouseleave', () => {
    targetRotateX = 0;
    targetRotateY = 0;
    targetScale = 1;
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '50%');
    mouseX = -9999;
    mouseY = -9999;
});

function animateBox() {
    currentRotateX += (targetRotateX - currentRotateX) * 0.08;
    currentRotateY += (targetRotateY - currentRotateY) * 0.08;
    currentScale += (targetScale - currentScale) * 0.08;
    
    card.style.transform = `
        perspective(1200px) 
        rotateX(${currentRotateX}deg) 
        rotateY(${currentRotateY}deg) 
        scale(${currentScale})
    `;
    
    requestAnimationFrame(animateBox);
}
animateBox();

// =============================================
// 9. INTERAÇÕES COM NOMES
// =============================================

nameText.addEventListener('mouseenter', () => {
    for (let i = 0; i < 6; i++) {
        const p = new Particle();
        const rect = nameText.getBoundingClientRect();
        p.x = rect.left + rect.width/2 + (Math.random() - 0.5) * 50;
        p.y = rect.top + rect.height/2 + (Math.random() - 0.5) * 20;
        p.size = Math.random() * 1.5 + 0.3;
        p.color = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.05})`;
        p.speedX = (Math.random() - 0.5) * 2;
        p.speedY = (Math.random() - 0.5) * 2 - 1;
        particles.push(p);
        setTimeout(() => {
            particles = particles.filter(part => part !== p);
        }, 700);
    }
});

usernameText.addEventListener('mouseenter', () => {
    for (let i = 0; i < 4; i++) {
        const p = new Particle();
        const rect = usernameText.getBoundingClientRect();
        p.x = rect.left + rect.width/2 + (Math.random() - 0.5) * 40;
        p.y = rect.top + rect.height/2 + (Math.random() - 0.5) * 15;
        p.size = Math.random() * 1.2 + 0.2;
        p.color = `rgba(255, 255, 255, ${Math.random() * 0.15 + 0.03})`;
        p.speedX = (Math.random() - 0.5) * 1.5;
        p.speedY = (Math.random() - 0.5) * 1.5 - 0.5;
        particles.push(p);
        setTimeout(() => {
            particles = particles.filter(part => part !== p);
        }, 600);
    }
});

bioText.addEventListener('mouseenter', () => {
    for (let i = 0; i < 5; i++) {
        const p = new Particle();
        const rect = bioText.getBoundingClientRect();
        p.x = rect.left + rect.width/2 + (Math.random() - 0.5) * 70;
        p.y = rect.top + rect.height/2 + (Math.random() - 0.5) * 25;
        p.size = Math.random() * 1.3 + 0.2;
        p.color = `rgba(255, 255, 255, ${Math.random() * 0.18 + 0.03})`;
        p.speedX = (Math.random() - 0.5) * 2;
        p.speedY = (Math.random() - 0.5) * 2 - 0.5;
        particles.push(p);
        setTimeout(() => {
            particles = particles.filter(part => part !== p);
        }, 700);
    }
});

// =============================================
// 10. ENTRAR
// =============================================
let hasEntered = false;

enterScreen.addEventListener('click', function(e) {
    // Toca música
    music.volume = parseFloat(volumeSlider.value);
    music.play().catch(() => {});
    this.classList.add('hide');
    
    // ===== SÓ ATUALIZA O CONTADOR UMA VEZ =====
    if (!hasEntered) {
        hasEntered = true;
        updateViewCount();
    }
});

// =============================================
// 11. TEXTO DIGITADO
// =============================================
const typingElement = document.querySelector('.typing-text');
const phrases = ['stay a little longer', 'lost in music', 'find your peace', 'welcome to my world'];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const currentPhrase = phrases[phraseIndex];
    
    if (!isDeleting) {
        typingElement.textContent = currentPhrase.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentPhrase.length) {
            isDeleting = true;
            setTimeout(typeEffect, 2500);
            return;
        }
    } else {
        typingElement.textContent = currentPhrase.slice(0, charIndex);
        charIndex--;
        if (charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(typeEffect, 500);
            return;
        }
    }
    setTimeout(typeEffect, isDeleting ? 50 : 100);
}
setTimeout(typeEffect, 2000);

// =============================================
// 12. STATUS ONLINE
// =============================================
const onlineIndicator = document.querySelector('.online');
let isOnline = true;
setInterval(() => {
    isOnline = !isOnline;
    onlineIndicator.style.background = isOnline ? '#00ff88' : '#333';
    onlineIndicator.style.boxShadow = isOnline 
        ? '0 0 15px #00ff88, 0 0 30px rgba(0, 255, 136, 0.2)' 
        : 'none';
}, 8000);

console.log('🔥 CHUVA BRANCA ATIVADA!');
console.log('❄️ PARTÍCULAS MINÚSCULAS');
console.log('💀 TUDO SUTIL E FODA');

// =============================================
// ===== CONTADOR DE VISUALIZAÇÕES =====
// =============================================
function getViewCount() {
    try {
        let count = localStorage.getItem('rhyvexViews');
        if (count === null) {
            count = 0;
        } else {
            count = parseInt(count);
        }
        return count;
    } catch (e) {
        // Se der erro (navegador sem suporte), retorna 0
        return 0;
    }
}

function updateViewCount() {
    try {
        let count = getViewCount();
        count++;
        localStorage.setItem('rhyvexViews', count.toString());
        viewCount.textContent = count;
    } catch (e) {
        // Se der erro, só mostra 0
        viewCount.textContent = '0';
    }
}

// Mostra o contador atual ao carregar
try {
    viewCount.textContent = getViewCount();
} catch (e) {
    viewCount.textContent = '0';
}

// =============================================
// ===== CONTROLE DE MÚSICA =====
// =============================================

// Play/Pause
playPauseBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (music.paused) {
        music.play().catch(() => {});
        this.innerHTML = '<i class="fa-solid fa-pause"></i>';
        isMusicPlaying = true;
    } else {
        music.pause();
        this.innerHTML = '<i class="fa-solid fa-play"></i>';
        isMusicPlaying = false;
    }
});

// Volume
volumeSlider.addEventListener('input', function(e) {
    e.stopPropagation();
    const vol = parseFloat(this.value);
    music.volume = vol;
    // Salva o volume no localStorage pra sincronizar
    try {
        localStorage.setItem('rhyvexVolume', vol.toString());
    } catch (e) {}
});

// Carrega o volume salvo
try {
    const savedVolume = localStorage.getItem('rhyvexVolume');
    if (savedVolume !== null) {
        const vol = parseFloat(savedVolume);
        music.volume = vol;
        volumeSlider.value = vol;
    }
} catch (e) {}

// Atualiza ícone do play/pause
music.addEventListener('play', () => {
    playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    isMusicPlaying = true;
});

music.addEventListener('pause', () => {
    playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    isMusicPlaying = false;
});

// =============================================
// ===== FIX: GARANTE QUE O VOLUME FUNCIONA =====
// =============================================
// Força o volume quando a música carrega
music.addEventListener('loadedmetadata', () => {
    try {
        const savedVolume = localStorage.getItem('rhyvexVolume');
        if (savedVolume !== null) {
            const vol = parseFloat(savedVolume);
            music.volume = vol;
            volumeSlider.value = vol;
        }
    } catch (e) {}
});
