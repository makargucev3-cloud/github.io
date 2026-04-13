// ========== МОДАЛЬНОЕ ОКНО ==========
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const openModalBtn = document.getElementById('openModal');
const openModalHeroBtn = document.getElementById('openModalHero');
const closeModalBtn = document.querySelector('.modal__close');

function openModal() {
    if (modal && modalOverlay) {
        modal.classList.add('active');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (modal && modalOverlay) {
        modal.classList.remove('active');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Кнопки открытия
if (openModalBtn) openModalBtn.addEventListener('click', openModal);
if (openModalHeroBtn) openModalHeroBtn.addEventListener('click', openModal);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

// Escape для модалки
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modal && modal.classList.contains('active')) closeModal();
        closeLightbox();
    }
});

// ========== ВАЛИДАЦИЯ ТЕЛЕФОНА (Беларусь) ==========
function validatePhone(phone) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phonePattern = /^(\+375|8)(29|33|44|25|17)\d{7}$/;
    return phonePattern.test(cleanPhone);
}

function formatPhoneInput(input) {
    let value = input.value.replace(/[^\d+]/g, '');
    if (value.startsWith('375')) value = '+' + value;
    input.value = value;
}

// ========== LIGHTBOX ==========
function openLightbox(imgSrc, imgAlt) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    if (lightbox && lightboxImg && lightboxCaption) {
        lightboxImg.src = imgSrc;
        lightboxImg.alt = imgAlt;
        lightboxCaption.textContent = imgAlt;
        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ========== АКЦИЯ: АВТООБНОВЛЕНИЕ ДАТЫ ==========
function updatePromoDate() {
    const dateElement = document.querySelector('.hero__promo-date-number');
    if (dateElement) {
        const today = new Date();
        const options = { day: 'numeric', month: 'long' };
        dateElement.textContent = today.toLocaleDateString('ru-RU', options);
    }
}

// ========== ОТПРАВКА ФОРМ ==========
document.addEventListener('DOMContentLoaded', function() {
    // Автообновление даты
    updatePromoDate();
    
    // Форматирование телефонов
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function() { formatPhoneInput(this); });
    });
    
    // Обработка всех форм с классом ajax-form
    const forms = document.querySelectorAll('.ajax-form');
    console.log('✅ Найдено форм:', forms.length);
    
    forms.forEach(form => {
        let isSubmitting = false;
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (isSubmitting) {
                alert('⏳ Заявка уже отправляется. Подождите...');
                return;
            }
            
            // Проверка телефона
            const phoneField = this.querySelector('input[type="tel"]');
            if (phoneField && !validatePhone(phoneField.value)) {
                alert('❌ Введите номер в формате +375XXXXXXXXX (9 цифр после кода)');
                phoneField.focus();
                return;
            }
            
            // Проверка имени
            const nameField = this.querySelector('input[name="name"]');
            if (nameField && !nameField.value.trim()) {
                alert('❌ Пожалуйста, укажите ваше имя');
                nameField.focus();
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;
            isSubmitting = true;
            
            const formData = new FormData(this);
            formData.append('page_url', window.location.href);
            
            try {
                const response = await fetch('https://balkony-bot-worker.balkonomania.workers.dev', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Заявка отправлена! Мы свяжемся с вами.');
                    this.reset();
                    closeModal();
                } else {
                    alert('❌ Ошибка: ' + result.message);
                }
            } catch (error) {
                console.error(error);
                alert('❌ Ошибка соединения. Проверьте интернет.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                isSubmitting = false;
            }
        });
    });
});

// ========== АВТОМАТИЧЕСКАЯ МАСКА ТЕЛЕФОНА +375 ==========
function setupPhoneMask() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        // Добавляем +375 при фокусе, если поле пустое
        input.addEventListener('focus', function() {
            if (this.value === '') {
                this.value = '+375';
            }
        });
        
        // Ограничиваем ввод и форматируем
        input.addEventListener('input', function(e) {
            let value = this.value;
            
            // Удаляем все не-цифры, но сохраняем +
            let cleaned = value.replace(/[^\d+]/g, '');
            
            // Если нет +375 в начале, добавляем
            if (!cleaned.startsWith('+375')) {
                if (cleaned.startsWith('375')) {
                    cleaned = '+' + cleaned;
                } else if (cleaned.startsWith('+')) {
                    // Оставляем как есть
                } else if (cleaned.length > 0) {
                    cleaned = '+375' + cleaned;
                } else {
                    cleaned = '+375';
                }
            }
            
            // Ограничиваем длину (+375 + 9 цифр = 13 символов)
            if (cleaned.length > 13) {
                cleaned = cleaned.slice(0, 13);
            }
            
            this.value = cleaned;
        });
        
        // При потере фокуса, если остался только +375, очищаем поле
        input.addEventListener('blur', function() {
            if (this.value === '+375') {
                this.value = '';
            }
        });
    });
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', setupPhoneMask);

// Дополнительная принудительная привязка для закрытия модалки
document.addEventListener('DOMContentLoaded', function() {
    const modalForm = document.querySelector('#modal .ajax-form');
    if (modalForm) {
        const originalSubmit = modalForm.onsubmit;
        modalForm.addEventListener('submit', function() {
            setTimeout(() => {
                closeModal();
            }, 100);
        });
    }
});