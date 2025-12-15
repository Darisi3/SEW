/* ---------- Helpers & DOM ---------- */
const body = document.body;
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarOpen = document.getElementById('sidebarOpen');
const sidebarClose = document.getElementById('sidebarClose');
const darkModeBtn = document.getElementById('darkModeBtn');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');
const contactLink = document.getElementById('contactLink');
const contactLink2 = document.getElementById('contactLink2');

const loader = document.getElementById('loader');
const resultImg = document.getElementById('resultImage');
const noText = document.getElementById('noImageText');
const historyList = document.getElementById('historyList');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn'); // i shtuar

const urlInput = document.getElementById('urlInput');
const keywordInput = document.getElementById('keywordInput');
const navItems = document.querySelectorAll('.nav-item');

/* ---------- State ---------- */
let dark = false;

/* Initialize from localStorage */
try {
    const savedTheme = localStorage.getItem('gg_theme');
    if (savedTheme === 'dark') {
        dark = true;
        body.classList.add('dark-mode');
    }
} catch (e) {}

/* Set theme text & icon */
function updateThemeUI() {
    if (dark) {
        themeText.textContent = "Dark Mode";
        themeIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="currentColor" stroke-width="2"/>
        </svg>`;
    } else {
        themeText.textContent = "Light Mode";
        themeIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 4V2M12 22v-2M4.93 4.93l-1.41-1.41M20.49 20.49l-1.41-1.41M2 12H4M20 12h2M4.93 19.07l-1.41 1.41M20.49 3.51l-1.41 1.41M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z" stroke="currentColor" stroke-width="2"/>
        </svg>`;
    }
}

/* ---------- Load & Save History ---------- */
function loadHistory() {
    try {
        const items = JSON.parse(localStorage.getItem('gg_history') || '[]');
        historyList.innerHTML = '';

        if (items.length === 0) {
            historyList.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:var(--muted); opacity:0.7; font-size:14px;">
                    Nuk ka gjenerime akoma.
                </div>`;
            return;
        }

        items.reverse().forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Gjenerim i mëparshëm';
            img.loading = 'lazy';
            img.style.cssText = 'width:100px;height:80px;object-fit:cover;border-radius:10px;border:1px solid rgba(10,37,64,0.06);cursor:pointer;transition:transform .2s;';
            img.onclick = () => showImage(src);
            img.onmouseover = () => img.style.transform = 'scale(1.08)';
            img.onmouseout = () => img.style.transform = 'scale(1)';
            historyList.appendChild(img);
        });
    } catch (e) {
        console.error('Gabim në historik:', e);
        localStorage.removeItem('gg_history');
        historyList.innerHTML = '<p style="color:var(--muted);">Gabim – historiku u pastrua.</p>';
    }
}

function pushHistory(src) {
    try {
        let arr = JSON.parse(localStorage.getItem('gg_history') || '[]');
        // Hiq duplikatën nëse ekziston
        arr = arr.filter(item => item !== src);
        arr.push(src);
        // Mbaj vetëm 12 të fundit
        const last = arr.slice(-12);
        localStorage.setItem('gg_history', JSON.stringify(last));
        loadHistory();
    } catch (e) {
        console.error('Dështoi ruajtja e historikut', e);
    }
}

/* ---------- Pastro Historikun – FUNKSIONON PËRGJITHMONË ---------- */
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', function () {
        if (confirm('Je i sigurt që do të fshish të gjithë historikun e gjenerimeve?\nKjo nuk mund të zhbëhet.')) {
            localStorage.removeItem('gg_history');
            historyList.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:var(--muted); opacity:0.7; font-size:14px;">
                    Historiku u fshi me sukses.
                </div>`;
        }
    });
}

/* ---------- Sidebar & Mobile ---------- */
function openSidebar() { sidebar.classList.remove('hidden'); }
function closeSidebar() { sidebar.classList.add('hidden'); }

sidebarToggle?.addEventListener('click', () => sidebar.classList.toggle('hidden'));
sidebarOpen?.addEventListener('click', openSidebar);
sidebarClose?.addEventListener('click', closeSidebar);

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 980 && !sidebar.contains(e.target) && !e.target.closest('.hamburger')) {
        closeSidebar();
    }
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

/* ---------- Dark mode toggle ---------- */
darkModeBtn.addEventListener('click', () => {
    dark = !dark;
    body.classList.toggle('dark-mode', dark);
    darkModeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    updateThemeUI();
    try {
        localStorage.setItem('gg_theme', dark ? 'dark' : 'light');
    } catch(e) {}
});
updateThemeUI();

/* ---------- Scroll to contact ---------- */
contactLink.onclick = contactLink2.onclick = (e) => {
    e.preventDefault();
    document.getElementById('contactSection').scrollIntoView({ behavior: 'smooth' });
};

/* ---------- Scroll animations ---------- */
const fadeSections = document.querySelectorAll('.fade-section');
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
        if (ent.isIntersecting) {
            ent.target.classList.add('visible');
            fadeObserver.unobserve(ent.target);
        }
    });
}, { threshold: 0.12 });
fadeSections.forEach(s => fadeObserver.observe(s));

/* ---------- Image handling ---------- */
function showLoader(show = true) {
    loader.style.display = show ? 'block' : 'none';
}

function showImage(src) {
    showLoader(false);
    resultImg.src = src;
    resultImg.classList.add('show');
    resultImg.style.display = 'block';
    noText.style.display = 'none';
    downloadBtn.style.display = 'block';
}

/* ---------- GENERATE logic ---------- */
generateBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    const keyword = keywordInput.value.trim();

    if (!url || !keyword) {
        alert('Ju lutem vendosni URL dhe fjalën.');
        return;
    }

    showLoader(true);
    setTimeout(() => {
        const newSrc = url; // Demo: përdor URL-në direkt si imazh
        showImage(newSrc);
        pushHistory(newSrc);
    }, 800);
});

/* ---------- DOWNLOAD ---------- */
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = resultImg.src;
    link.download = `gazeta-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

/* ---------- Ngarko historikun në fillim ---------- */
document.addEventListener('DOMContentLoaded', loadHistory);

