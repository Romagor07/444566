// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И ДАННЫЕ ==========
let currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
let cart = [];
let favorites = [];

// ========== ОПТИМИЗАЦИЯ ЗАГРУЗКИ ==========
// Отложенная загрузка некритических скриптов
function loadDeferredScripts() {
    // Загружаем Bootstrap только после полной загрузки страницы
    if (typeof bootstrap === 'undefined') {
        const bootstrapLink = document.createElement('link');
        bootstrapLink.rel = 'stylesheet';
        bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
        document.head.appendChild(bootstrapLink);
    }
    
    // Загружаем Swiper при необходимости
    if (document.querySelector('.swiper') && typeof Swiper === 'undefined') {
        const swiperScript = document.createElement('script');
        swiperScript.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
        swiperScript.defer = true;
        document.body.appendChild(swiperScript);
    }
}

// Запускаем после загрузки основного контента
if (window.requestIdleCallback) {
    requestIdleCallback(loadDeferredScripts);
} else {
    setTimeout(loadDeferredScripts, 1000);
}

// ========== ЛЕНИВАЯ ЗАГРУЗКА ИЗОБРАЖЕНИЙ ==========
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// Запускаем ленивую загрузку
document.addEventListener('DOMContentLoaded', initLazyLoading);

// ========== УЛУЧШЕННАЯ ЗАГРУЗКА ВИДЕО ==========
function initOptimizedVideo() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.addEventListener('canplay', () => {
            video.style.opacity = '1';
        });
        video.style.opacity = '0';
        video.style.transition = 'opacity 0.3s ease';
    });
}

// ПОЛНАЯ БАЗА ТОВАРОВ
const allProducts = [
    // ЗДОРОВЬЕ
    { id: "effector", name: "EFFECTOR", category: "health", price: 3910, desc: "биомодулятор для омоложения клеток", image: "images/effector.webp", volume: "30 стиков по 1 гр.", subtitle: "многофункциональный биомодулятор", description: "<p>Многофункциональный биомодулятор EFFECTOR – инновационный российский продукт.</p>", composition: "<p>RNA VERUMТМ, спермидин, сок киви.</p>", properties: "<ul><li>улучшение иммунитета</li><li>регенерация клеток</li></ul>", recommendations: "<p>содержимое стика высыпать под язык.</p>" },
    { id: "defender", name: "DEFENDER", category: "health", price: 1790, desc: "anti-stress complex", image: "images/defender.webp", volume: "30 капсул", subtitle: "anti-stress complex", description: "<p>Антистрессовый комплекс для нервной системы.</p>", composition: "<p>экстракт пустырника, валерианы, магний, B6.</p>", properties: "<ul><li>снижает тревожность</li><li>улучшает сон</li></ul>", recommendations: "<p>по 1 капсуле 2 раза в день.</p>" },
    { id: "chlorophyll", name: "VERUM Chlorophyll Ferrum", category: "health", price: 2750, desc: "Biogenic element", image: "images/chlorophyll.webp", volume: "60 п. по 1,25 г.", subtitle: "Biogenic element", description: "<p>Жидкий хлорофилл с органическим железом.</p>", composition: "<p>хлорофилл, железо, витамин C.</p>", properties: "<ul><li>повышает гемоглобин</li><li>улучшает кислородный обмен</li></ul>", recommendations: "<p>1 стик растворить в воде.</p>" },
    { id: "synbiotic", name: "SYNBIOTIC 5", category: "health", price: 1950, desc: "синбиотик 5-го поколения", image: "images/synbiotic.webp", volume: "30 капсул", subtitle: "синбиотик", description: "<p>Пробиотики + пребиотики для микробиоты.</p>", composition: "<p>5 штаммов пробиотиков, инулин.</p>", properties: "<ul><li>восстанавливает микрофлору</li><li>укрепляет иммунитет</li></ul>", recommendations: "<p>по 1 саше в день.</p>" },
    { id: "diwata", name: "DIWATA", category: "health", price: 2990, desc: "антипаразитарная программа", image: "images/diwata.webp", volume: "30 капсул", subtitle: "антипаразитарная программа", description: "<p>DIWATA – комплексная программа для борьбы с паразитарными инфекциями и восстановления микрофлоры организма.</p>", composition: "<p>экстракт гвоздики, экстракт пижмы, экстракт полыни, черный орех.</p>", properties: "<ul><li>Борется с паразитами</li><li>Восстанавливает микрофлору</li><li>Повышает иммунитет</li></ul>", recommendations: "<p>по 1 капсуле 2 раза в день.</p>" },
    { id: "takaralife", name: "VERUM TAKARALIFE", category: "health", price: 3950, desc: "Health Benefit", image: "images/takaralife.webp", volume: "30 стиков", subtitle: "Health Benefit", description: "<p>VERUM TAKARALIFE – инновационная формула для поддержания здоровья.</p>", composition: "<p>экстракт женьшеня, родиола розовая, витамины группы B.</p>", properties: "<ul><li>Повышает энергию</li><li>Укрепляет иммунитет</li></ul>", recommendations: "<p>по 1 стику в день.</p>" },
    { id: "brain", name: "VERUM HEALTHY BRAIN", category: "health", price: 3250, desc: "ноотропная формула нового поколения", image: "images/brain.webp", volume: "30 капсул", subtitle: "ноотропная формула", description: "<p>VERUM HEALTHY BRAIN – ноотропный комплекс для улучшения памяти.</p>", composition: "<p>гинкго билоба, бациопа моньери, фосфатидилсерин, магний.</p>", properties: "<ul><li>Улучшает память</li><li>Повышает концентрацию</li></ul>", recommendations: "<p>по 1 капсуле 2 раза в день.</p>" },
    { id: "nephro", name: "VERUM HEALTHY NEPHRO", category: "health", price: 2550, desc: "комплексная защита почек", image: "images/nephro.webp", volume: "30 капсул", subtitle: "защита почек", description: "<p>VERUM HEALTHY NEPHRO – комплексная защита почек.</p>", composition: "<p>экстракт клюквы, экстракт толокнянки, витамин C.</p>", properties: "<ul><li>Поддерживает здоровье почек</li><li>Антибактериальное действие</li></ul>", recommendations: "<p>по 1 капсуле 2 раза в день.</p>" },
    { id: "liver", name: "VERUM HEALTHY LIVER", category: "health", price: 1900, desc: "здоровье печени на клеточном уровне", image: "images/liver.webp", volume: "30 капсул", subtitle: "здоровье печени", description: "<p>VERUM HEALTHY LIVER – комплекс для поддержки печени.</p>", composition: "<p>экстракт расторопши, N-Ацетил-L-Цистеин, селен.</p>", properties: "<ul><li>Защищает клетки печени</li><li>Улучшает детоксикацию</li></ul>", recommendations: "<p>по 1–2 капсулы в день.</p>" },
    { id: "fiber", name: "VERUM HEALTHY FIBER", category: "health", price: 3450, desc: "уникальная формула клетчатки", image: "images/fiber.webp", volume: "30 стиков", subtitle: "клетчатка", description: "<p>Уникальная формула растворимой и нерастворимой клетчатки.</p>", composition: "<p>натуральное волокно, диетические волокна конжака, дигидрокверцетин.</p>", properties: "<ul><li>Стабилизация пищеварения</li><li>Поддержка микрофлоры</li></ul>", recommendations: "<p>растворить в 50 мл воды перед едой.</p>" },
    { id: "kyanos", name: "VERUM KÝANOS", category: "health", price: 1850, desc: "Капли для глаз", image: "images/kyanos.webp", volume: "10 мл", subtitle: "капли для глаз", description: "<p>Увлажняющие капли для глаз с натуральными компонентами.</p>", composition: "<p>гиалуроновая кислота, экстракт черники, витамин B12.</p>", properties: "<ul><li>Увлажняет глаза</li><li>Снимает усталость</li></ul>", recommendations: "<p>закапывать 1-2 капли 2-3 раза в день.</p>" },
    { id: "youth", name: "VERUM YOUTH", category: "health", price: 2400, desc: "Белково-энзимный смузи", image: "images/youth.webp", volume: "12 г", subtitle: "Белково-энзимный смузи", description: "<p>Низкокалорийная протеиновая смесь из 7 видов растительных белков.</p>", composition: "<p>белок семян конопли, миндаля, тыквы, гороха, льна, сои.</p>", properties: "<ul><li>Полноценное белковое питание</li><li>Быстрое восстановление</li></ul>", recommendations: "<p>пить 2-3 раза в день.</p>" },
    { id: "foherb", name: "Капсулы Линчжи Фохоу", category: "health", price: 2500, desc: "биологически активная добавка", image: "images/Фохоу.webp", volume: "60 капсул", subtitle: "Капсулы Линчжи Фохоу", description: "<p>БАД на основе гриба Линчжи (Reishi) по уникальным китайским рецептам.</p>", composition: "<p>экстракт гриба Линчжи, микрокристаллическая целлюлоза.</p>", properties: "<ul><li>Укрепляет иммунитет</li><li>Повышает выносливость</li><li>Нормализует сон</li></ul>", recommendations: "<p>по 2 капсулы 2 раза в день.</p>" },
    { id: "hemohim", name: "Хемохим Атоми", category: "health", price: 8800, desc: "Активация Nk-клеток", image: "images/hemohim-atomi.webp", volume: "60 саше (по 20 мл каждое)", subtitle: "Укрепление иммунитета", description: "<p>Хемохим Атоми — биологически активная добавка к пище корейского производства.</p>", composition: "<p>очищенная вода.</p><p>смесь растительных экстрактов HemoHIM™</p><p>лимонная кислота (Е330, антиокислитель</p>", properties: "<ul><li>поддержке кроветворения и повышению уровня гемоглобина</li><li>укреплению и регуляции иммунной системы</li></ul>", recommendations: "<p>по 2 саше в день во время еды.</p>" },
    { id: "e-omega3", name: "Аляска е-Омега 3 Атоми", category: "health", price: 2000, desc: "Высококачественые кислоты Ера &Dha", image: "images/omega.webp", volume: "180 капсул", subtitle: "бад", description: "<p>Подерживают здоровье сердца и сокращают риск заболеваний сердечно-сосудистой системы.</p>", composition: "<p>Очищенный рыбий жир (ЕРА и DHA 65%), D-альфа-токоферол (витамин Е), куркума длинная (масло)</p>", properties: "<ul><li>поддержка сердца и сосудов: снижение холестерина и триглицеридов, нормализация давления;</li><li>улучшение работы мозга: память, концентрация, эмоциональный фон;</li></ul>", recommendations: "<p>Принимать по 2 капсулы в день, после еды.</p>" },
    { id: "vitamin-c", name: "Витамин С Атоми", category: "health", price: 2000, desc: "Биологически активная добавка к пище", image: "images/vitamin-c.webp", volume: "90 саше", subtitle: "Vitamin C", description: "<p>Он защищает клетки кожи от вредного кислорода, формирует соединительную ткань и поддерживает ее функции, а также улучшает усвоение железа.</p>", composition: "<p>Витамин с (аскорбиновая кислота, аскорбат натрия), ксилит, мальтодекстрин кукурузный, сухой концентрат плодов манго, порошок лактозы, лиофилизированные плоды клубники, диоксид кремния е551, экстракт плодов граната, стевиолгликозиды е960, экстракт плодов тыквы, экстракт плодов мандарина, гидролизат рыбного коллагена, сухой экстракт цикория, экстракт гриба санхван, экстракт куркумы, коэнзим Q10.</p>", properties: "<ul><li>Формирование соединительной ткани, поддержание ее функций</li><li>Защита клеток кожи от вредного кислорода</li></ul>", recommendations: "<p>1 стик в день.</p>" },
    { id: "lutein", name: "Ай Лютеин Атоми", category: "health", price: 2700, desc: "Биологически активная добавкао поколения", image: "images/eye-lutein.webp", volume: "90 капсул ", subtitle: "Eye Lutein", description: "<p>Атоми ай лютеин поддерживает плотность макулярного пигмента и здоровье глаз.</p>", composition: "<p>масло семян винограда, желатин, глицерин Е422 (загуститель), пчелиный воск Е901 (носитель), экстракт цветков бархатцев прямостоячих (экстракт цветков бархатцев прямостоячих, масло подсолнечника, антиокислитель di-а-токоферол), масло бурачника, антиокислитель Е322, оксид цинка, порошок какао (краситель), стабилизатор Е 170, сухой экстракт красного апельсина, витамин А (ретинола пальмитат), сухой экстракт ягодной смеси (черника, брусника, голубика, арония), сухой экстракт черной смородины, сухой экстракт ягод бузины черной, сухой экстракт семян кассии остролистной, сухой экстракт ягод годжи, гиалуроновая кислота.</p>", properties: "<ul><li>Улучшение остроты зрения</li><li>Защита сетчатки</li><li>Поддержка при зрительных нагрузках</ul>", recommendations: "<p>взрослым по 1 капсуле в день во время еды.</p>" },
    { id: "spirulin", name: "Спирулина Атоми", category: "health", price: 2000, desc: "Биологическая добавка", image: "images/spirulin.webp", volume: "120 капсул", subtitle: "Pure Spirulina", description: "<p>Спирулина - Это Водоросль, история которой насчитывает 3,6 Миллиарда Лет.</p>", composition: "<p>100% спирулина Оболочка капсулы: гидроксипропилметилцеллюлоза.</p>", properties: "<ul><li>улучшение состояние кожи</li><li>уменьшает окислительные процессы в организме</li></ul>", recommendations: "<p>Взрослым и детям старше 12 лет принимать по 1 капсуле 2 раза в день, запивая достаточным количеством воды.</p>" },
    { id: "probiotics", name: "Пробиотик Атоми 10+", category: "health", price: 2800, desc: "Подавляет рост кишечных лактобактерий", image: "images/probiotics.webp", volume: "60 саше", subtitle: "Probiotics", description: "<p>Каждый стик содержит 30 миллиардов лактобактерий и гарантирует потребление 3 миллиардов лактобактерий.</p>", composition: "<p>Основные активные компоненты (12 штаммов бактерий).</p>", properties: "<ul><li>Помогает поддерживать здоровый и активный кишечник</li><li>Способствует облегчению дефекации</li></ul>", recommendations: "<p>взрослым по 1 саше в день во время еды.</p>" },
    // КРАСОТА
    { id: "daycream", name: "Jenel Day Cream", category: "beauty", price: 2350, desc: "крем дневной", image: "images/Day Cream.webp", volume: "50 мл", subtitle: "дневной крем", description: "<p>Увлажнение и защита на весь день.</p>", composition: "<p>RNA VERUM, масла, экстракты.</p>", properties: "<ul><li>разглаживает морщины</li><li>увлажняет</li></ul>", recommendations: "<p>нанести на очищенную кожу.</p>" },
    { id: "o2tonic", name: "Jenel O2 tonic", category: "beauty", price: 1100, desc: "кислородный тоник", image: "images/O2 tonic.webp", volume: "100 мл", subtitle: "кислородный тоник", description: "<p>Интенсивное увлажнение и омоложение.</p>", composition: "<p>кислородная вода, Matrixyl 3000.</p>", properties: "<ul><li>замедляет старение</li><li>насыщает влагой</li></ul>", recommendations: "<p>распылить на лицо.</p>" },
    { id: "fundesee", name: "FUNDESEE", category: "beauty", price: 12500, desc: "омолаживающая маска", image: "images/fundesee.webp", volume: "60 г", subtitle: "лифтинг-маска", description: "<p>Премиальный уход для лица.</p>", composition: "<p>протеин, гиалуроновая кислота.</p>", properties: "<ul><li>лифтинг эффект</li><li>увлажнение</li></ul>", recommendations: "<p>нанести на 20 минут.</p>" },
    { id: "aloevera", name: "Гель алоэ вера", category: "beauty", price: 1900, desc: "увлажняющее средство", image: "images/алоэ вера.webp", volume: "50 мл", subtitle: "гель алоэ вера", description: "<p>Универсальное увлажняющее средство для лица, тела и волос.</p>", composition: "<p>сок алоэ Barbadensis (99,8%).</p>", properties: "<ul><li>интенсивно увлажняет</li><li>успокаивает раздражения</li></ul>", recommendations: "<p>наносить на очищенную кожу.</p>" },
    { id: "cleanser", name: "Jenel Soft Foam Cleanser", category: "beauty", price: 2290, desc: "пенка для умывания", image: "images/сleanser.webp", volume: "150 мл", subtitle: "пенка для умывания", description: "<p>Мягкое очищение для любой кожи.</p>", composition: "<p>Matrixyl 3000, глицерин, экстракты водорослей.</p>", properties: "<ul><li>бережно очищает</li><li>увлажняет</li></ul>", recommendations: "<p>нанести на влажную кожу, смыть водой.</p>" },
    { id: "essence", name: "Золотая эссенция", category: "beauty", price: 3800, desc: "антивозрастной уход", image: "images/эссенция.webp", volume: "50 мл", subtitle: "золотая эссенция", description: "<p>Средство для борьбы с признаками старения.</p>", composition: "<p>золотые частицы, гиалуроновая кислота.</p>", properties: "<ul><li>антиоксидантная защита</li><li>лифтинг эффект</li></ul>", recommendations: "<p>наносить 1-2 раза в день.</p>" },
    { id: "nanosilver", name: "NANO SILVER", category: "beauty", price: 1750, desc: "коллоидное серебро", image: "images/nano silver.webp", volume: "100 мл", subtitle: "серебряный спрей", description: "<p>Натуральный биоцид нового поколения.</p>", composition: "<p>вода дистиллированная, серебро.</p>", properties: "<ul><li>уменьшает акне</li><li>антибактериальный эффект</li></ul>", recommendations: "<p>встряхнуть перед применением.</p>" },
    { id: "treatment", name: "Бальзам для губ Атоми", category: "beauty", price: 400, desc: "бальзам для губ", image: "images/lip-treatment.webp", volume: "3.9 г", subtitle: "стик", description: "<p>Бальзам напитывает губы влагой, разглаживает неровности, даря комфорт и увлажнение.</p>", composition: "<p>Петролатум, диизостеарилмалат, октилдодеканол, масло ши, эфиры жожоба, масло оливы</p>", properties: "<ul><li>Смягчает кожу и питает</li><li> Способствует обновлению кожи и увлажнение</li></ul>", recommendations: "<p>Нанесите необходимое количество средства на кожу и равномерно распределите.</p>" },
    { id: "glow-base", name: "Хэлси Глоу база под макияж Атоми", category: "beauty", price: 1000, desc: "Осветление кожи • борьба с морщинами, защита от уф излучений", image: "images/glow-base.webp", volume: "33 мл", subtitle: "Atomy healthy glow base", description: "<p>Розовая база, состоящая из розовой воды и жемчужного порошка, поддерживает кожу здоровой и придает ей естественное сияние.</p>", composition: "<p>Вода очищенная, бутилгликоль, этилгексилметоксициннамат, циклопентасилоксан, этилгексилсалицилат.</p>", properties: "<ul><li>Сияющая кожа</li><li>Многофункциональный продукт</li></ul>", recommendations: "<p>На первом этапе макияжа нанести Атоми хэлси глоу базу под макияж на область щек, лба, носа и подбородка.</p>" },
    { id: "lash-power", name: "Тушь Сила Объема Атоми", category: "beauty", price: 1200, desc: "Тушь для ресниц", image: "images/lash-power.webp", volume: "8 мл", subtitle: "тушь", description: "<p>Новая технология придает объем вашим ресницам не смазываясь и не осыпаясь из-за воды, пота и кожного себума, а также легко смываясь теплой водой.</p>", composition: "<p>очищенная вода, акрилат сополимер, карнаубский воск, пчелиный воск, целлюлоза, этанол.</p>", properties: "<ul><li>Противостоит воде, поту</li><li>Без комочков. Простое нанесение и супер стойкая</li></ul>", recommendations: "<p>Наносить тушь в 3 шага.</p>" },
    { id: "eyeliner", name: "Подводка-фломастер (чёрный) Атоми", category: "beauty", price: 900, desc: "Подводка в виде фломастера", image: "images/eyeliner.webp", volume: "0.6 г", subtitle: "Подводка-фломастер", description: "<p>Атоми Подводка-фломастер для глаз позволяет создать идеальные стрелки всего одним движением!</p>", composition: "<p>Очищенная вода, акрилат сополимер, метилпропандиол, лаурет-21.</p>", properties: "<ul><li>Успокаивающий эффект, увлажнение</li><li>Улучшение состояния кожи и волос</li></ul>", recommendations: "<p>Перед использованием слегка встряхните флакон 2-3 раза.</p>" },
    { id: "adelica", name: "Аделика румяна Атоми", category: "beauty", price: 2000, desc: "Секрет нежного макияжа", image: "images/adelica.webp", volume: "5.5 г", subtitle: "Аделика Румяна", description: "<p>Подчеркните свою индивидуальность вместе с аделикой</p>", composition: "<p>Тальк, слюда, нейлон 12, дифенилсилоксифенилтриметикон, микрорестат магния, диоксид титана, диоксид кремния.</p>", properties: "<ul><li>Великолепная стойкость</li><li>Роскошный цвет розового лепестка</li></ul>", recommendations: "<p>при помощи кисточки нанести небольшое количество румян на щеки.</p>" },
    { id: "bb-cream", name: "ББ крем Атоми", category: "beauty", price: 700, desc: "Идеальное покрытие, преображающее вашу кожу", image: "images/bb-cream.webp", volume: "40 мл", subtitle: "BB cream", description: "<p>Этот Бб-крем является базовым продуктом, который очень прост в использовании.</p>", composition: "<p>Очищенная вода, бутиленгликоль, Циклометикон , Диоксид титана, диметикон, масло сладкого миндаля, тальк изопропилпальмитата, дикаприлат/дикапрат бутиленгликоля, этилгексилметоксициннамат.</p>", properties: "<ul><li>Безупречная сияющая кожа</li><li>Защита от уф-Излучения</li></ul>", recommendations: "<p>Нанести небольшое количество Бб-крема на кожу после уходовых средств.</p>" },
    // ПРИБОРЫ
    { id: "energy_scarf", name: "Энергетический шарф", category: "devices", price: 13450, desc: "комплекс для спины", image: "images/Энергетический шарф.webp", volume: "198x140 см", subtitle: "палантин", description: "<p>Забота о здоровье и комфорт.</p>", composition: "<p>хлопок, полиэстер, спандекс.</p>", properties: "<ul><li>улучшает кровообращение</li><li>снимает напряжение</li></ul>", recommendations: "<p>носить на шее или плечах.</p>" },
    { id: "tourmaline_belt", name: "Турмалиновый магнитный пояс", category: "devices", price: 19900, desc: "магнитный пояс", image: "images/Турмалиновый магнитный пояс.webp", volume: "универсальный", subtitle: "Турмалиновый магнитный пояс", description: "<p>Ортопедическое изделие с турмалиновыми кристаллами и магнитами.</p>", composition: "<p>ткань с турмалином, система магнитов.</p>", properties: "<ul><li>оздоровительный эффект</li><li>улучшает кровообращение</li></ul>", recommendations: "<p>надевать на поясницу на 15-30 минут.</p>" },
    { id: "magic_massager", name: "Массажёр Magic Foherb", category: "devices", price: 65000, desc: "биоэнергетический прибор", image: "images/Массажёр Magic Foherb.webp", volume: "1 прибор", subtitle: "Биомассажер Magic", description: "<p>Биоэнергетический прибор для восстановления организма.</p>", composition: "<p>массажер, токопроводящие перчатки, кремы.</p>", properties: "<ul><li>улучшает кровообращение</li><li>снимает усталость</li></ul>", recommendations: "<p>надевать перчатки, смоченные водой.</p>" },
    { id: "ventun", name: "Набор прибора Вэнтун", category: "devices", price: 200000, desc: "физиотерапевтический комплекс", image: "images/Прибор Вэнтун.webp", volume: "1 прибор", subtitle: "Прибор Вэнтун 1.0", description: "<p>Сочетает традиционную китайскую медицину и современные технологии.</p>", composition: "<p>основной блок, нагревательный пояс, LED-панель.</p>", properties: "<ul><li>улучшает микроциркуляцию</li><li>повышает тонус</li></ul>", recommendations: "<p>продолжительность процедуры 40 минут.</p>" },
    { id: "insoles", name: "Коррекционные стельки c анионами", category: "devices", price: 11500, desc: "ортопедические изделия", image: "images/стельки.webp", volume: "1 пара", subtitle: "Коррекционные стельки", description: "<p>Ортопедические стельки с анионами.</p>", composition: "<p>активированный уголь, ионы серебра.</p>", properties: "<ul><li>улучшает кровообращение в стопах</li><li>антибактериальный эффект</li></ul>", recommendations: "<p>обрезать по размеру, носить в обуви.</p>" },
    { id: "computer_glasses", name: "Высокотехнологичные компьютерные очки", category: "devices", price: 5500, desc: "защита от излучения", image: "images/компьютерные очки.webp", volume: "1 шт.", subtitle: "Компьютерные очки", description: "<p>Защита от облучения, снятие усталости глаз.</p>", composition: "<p>пластиковая оправа, поликарбонатные линзы с антибликом.</p>", properties: "<ul><li>снижает утомление глаз</li><li>уменьшает головные боли</li></ul>", recommendations: "<p>надевать за 5-10 минут до работы за компьютером.</p>" },
    { id: "water_resonator", name: "Квантовый низкочастотный резонатор для воды", category: "devices", price: 31100, desc: "резонатор для воды", image: "images/резонатор.webp", volume: "кейс 16 упаковок", subtitle: "Резонатор воды", description: "<p>Изменение структуры воды с помощью низкочастотного резонанса.</p>", composition: "<p>молекулярно-резонансный модуль, частота 7,8 Гц.</p>", properties: "<ul><li>улучшает усвоение воды</li><li>нормализует pH-баланс</li></ul>", recommendations: "<p>обрабатывать воду 20 минут.</p>" },
    { id: "hydrogen_rod", name: "Водородный стержень", category: "devices", price: 5000, desc: "насыщение воды водородом", image: "images/стержень.webp", volume: "2 шт.", subtitle: "Водородный стержень", description: "<p>Приготовление насыщенной водородом воды в домашних условиях.</p>", composition: "<p>нержавеющая сталь, турмалин, нано-серебро.</p>", properties: "<ul><li>восстанавливает свойства воды</li><li>антиоксидантный эффект</li></ul>", recommendations: "<p>поместить в бутылку с водой на 10-15 минут.</p>" },
    { id: "bagua_sauna", name: "Мини сауна БА-ГУА", category: "devices", price: 68000, desc: "портативная сауна", image: "images/сауна.webp", volume: "70×80×95 см", subtitle: "Мини сауна БА-ГУА", description: "<p>Портативная инфракрасная сауна с лечебными камнями.</p>", composition: "<p>камни нефрит и турмалин, стульчик, коврик.</p>", properties: "<ul><li>улучшает микроциркуляцию</li><li>детоксикация</li><li>снятие стресса</li></ul>", recommendations: "<p>перед процедурой выпить воду, продолжительность 20-40 минут.</p>" },
    { id: "air_purifier", name: "Многофункциональный очиститель воздуха", category: "devices", price: 30600, desc: "очиститель воздуха", image: "images/очиститель.webp", volume: "1 шт.", subtitle: "Очиститель воздуха", description: "<p>Очистка воздуха от вредных веществ и микроорганизмов.</p>", composition: "<p>нано-серебро, HEPA-фильтр, ионизатор.</p>", properties: "<ul><li>удаляет вредные вещества</li><li>стерилизует воздух</li></ul>", recommendations: "<p>включить через пульт управления.</p>" },
    { id: "cell_activator", name: "Активатор клеток Whieda", category: "devices", price: 50000, desc: "физиотерапевтический прибор", image: "images/активатор.webp", volume: "1 шт.", subtitle: "Активатор клеток", description: "<p>Физиотерапевтический прибор на основе современных технологий.</p>", composition: "<p>инфракрасное и терагерцевое излучение, гиромагнетизм.</p>", properties: "<ul><li>стимулирует обмен веществ</li><li>укрепляет иммунитет</li><li>замедляет старение</li></ul>", recommendations: "<p>курс: неделя применения, перерыв 3-5 дней.</p>" }
];

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== РАБОТА С ДАННЫМИ ПОЛЬЗОВАТЕЛЯ ==========
function loadUserData() {
    if (currentUser && currentUser.email) {
        const savedCart = localStorage.getItem(`cart_${currentUser.email}`);
        const savedFav = localStorage.getItem(`fav_${currentUser.email}`);
        cart = savedCart ? JSON.parse(savedCart) : [];
        favorites = savedFav ? JSON.parse(savedFav) : [];
    } else {
        cart = [];
        favorites = [];
    }
    updateCartBadge();
    updateFavBadge();
}

function saveCart() {
    if (currentUser && currentUser.email) {
        localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify(cart));
    }
    updateCartBadge();
}

function saveFavorites() {
    if (currentUser && currentUser.email) {
        localStorage.setItem(`fav_${currentUser.email}`, JSON.stringify(favorites));
    }
    updateFavBadge();
}

function addToCart(product) {
    if (!currentUser) {
        redirectToLogin();
        return;
    }
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    
    if (typeof window.renderCartContent === 'function') window.renderCartContent();
    if (typeof window.renderFavoritesContent === 'function') window.renderFavoritesContent();
    if (typeof window.renderPopularGoods === 'function') window.renderPopularGoods();
    if (typeof window.updateCartButtons === 'function') window.updateCartButtons();
    
    updateCartBadge();
}

function addToCartById(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) addToCart(product);
}

function toggleFavorite(productId) {
    if (!currentUser) {
        redirectToLogin();
        return;
    }
    const index = favorites.findIndex(f => f.id === productId);
    if (index === -1) {
        const product = allProducts.find(p => p.id === productId);
        if (product) favorites.push(product);
    } else {
        favorites.splice(index, 1);
    }
    saveFavorites();
    
    // Обновляем страницы
    if (typeof window.renderCartContent === 'function') window.renderCartContent();
    if (typeof window.renderFavoritesContent === 'function') window.renderFavoritesContent();
    if (typeof window.renderPopularGoods === 'function') window.renderPopularGoods();
        document.querySelectorAll('.product-fav').forEach(btn => {
            const productId = btn.dataset.id;
            const isFav = favorites.some(f => f && f.id === productId);
            const icon = btn.querySelector('i');
                if (icon) {
            icon.className = isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            if (isFav) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });
}

function redirectToLogin() {
    sessionStorage.setItem('returnUrl', window.location.href);
    window.location.href = 'login.html';
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function updateCartBadge() {
    const cartBadge = document.getElementById('cartCountHeader');
    if (cartBadge) cartBadge.innerText = cart.length;
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.innerText = cart.length;
    // Обновляем мобильные бейджи
    const cartMobile = document.getElementById('cartCountMobile');
    if (cartMobile) cartMobile.innerText = cart.length;
}

function updateFavBadge() {
    const favBadge = document.getElementById('favoritesCountHeader');
    if (favBadge) favBadge.innerText = favorites.length;
    const favCount = document.getElementById('favoritesCount');
    if (favCount) favCount.innerText = favorites.length;
    // Обновляем мобильные бейджи
    const favMobile = document.getElementById('favoritesCountMobile');
    if (favMobile) favMobile.innerText = favorites.length;
}

// ========== ГЛОБАЛЬНЫЙ ПОИСК ==========
function initGlobalSearch() {
    const searchInput = document.getElementById('searchInputGlobal');
    const searchResults = document.getElementById('searchResultsGlobal');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (!query) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = '';
            return;
        }
        
        const results = allProducts.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.desc && product.desc.toLowerCase().includes(query.toLowerCase()))
        );
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div style="padding: 15px; text-align: center; color: #693D3D;">Ничего не найдено</div>';
            searchResults.classList.add('active');
            return;
        }
        
        const limitedResults = results.slice(0, 10);
        
        searchResults.innerHTML = limitedResults.map(product => `
            <a href="product-detail.html?id=${product.id}" class="search-result-item">
                <div class="search-result-img">
                    <img src="${product.image}" onerror="this.parentElement.innerHTML='📦'" style="width: 40px; height: 40px; object-fit: contain;">
                </div>
                <div class="search-result-info">
                    <h4>${escapeHtml(product.name)}</h4>
                    <p>${product.price.toLocaleString()} ₽</p>
                </div>
            </a>
        `).join('');
        
        searchResults.classList.add('active');
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
}

function loadHeaderAndFooter() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (headerPlaceholder) {
        const isAuth = !!currentUser;
        const userName = currentUser?.name || '';
        const userAvatar = currentUser?.avatar || 'images/default-avatar.png';
        
        headerPlaceholder.innerHTML = `
            <!-- Верхняя белая шапка (только логотип и мобильные элементы) -->
            <div class="header-top-white">
                <div class="container">
                    <div class="header-top-row">
                        <div class="logo-col">
                            <a href="${isAuth ? 'cabinet.html' : 'index.html'}" class="logo-link">
                                <img src="logo.webp" fetchpriority="high" alt="Формула здоровья" class="logo-img">
                                <span class="logo-text-gradient">Формула здоровья</span>
                            </a>
                        </div>
                        
                        <!-- На десктопе здесь ничего нет, всё в нижней шапке -->
                        ${!isAuth ? `
                        <div class="auth-col" id="authButtonsHeader">
                            <a href="login.html" class="auth-link-white">Регистрация</a> 
                            <span class="auth-divider">|</span> 
                            <a href="login.html" class="auth-link-white">Вход в кабинет</a>
                        </div>
                        ` : ''}
                        
                        <!-- МОБИЛЬНЫЕ ЭЛЕМЕНТЫ (видны только на телефонах) -->
                        <div class="header-mobile-actions" style="display: flex; align-items: center; gap: 8px;">
                            <button class="search-icon-mobile" id="searchIconMobile">
                                <i class="fas fa-search"></i>
                            </button>
                            ${isAuth ? `
                            <button class="mobile-profile-avatar" id="mobileProfileAvatarBtn">
                                <img src="${userAvatar}" alt="avatar" id="mobileAvatarImg" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #ddd;">
                            </button>
                            ` : ''}
                            <button class="burger-menu" id="burgerMenuBtnMobile">
                                <span></span><span></span><span></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Нижняя зелёная шапка (ДЕСКТОП: вся навигация и иконки профиля/корзины/избранного) -->
            <div class="header-bottom-green">
                <div class="container">
                    <div class="header-bottom-row">
                        <nav class="nav-menu">
                            <div class="dropdown-wrapper">
                                <a href="#" class="nav-link-green">Продукты <i class="fas fa-chevron-down"></i></a>
                                <div class="dropdown-mega-menu">
                                    <div class="mega-menu-container">
                                        <div class="mega-menu-section">
                                            <ul>
                                                <li><a href="new-items.html"><i class="fas fa-star"></i> Новинки</a></li>
                                                <li><a href="health.html"><i class="fas fa-heartbeat"></i> Здоровье</a></li>
                                                <li><a href="beauty.html"><i class="fas fa-spa"></i> Красота</a></li>
                                                <li><a href="devices.html"><i class="fas fa-microchip"></i> Приборы/Аксессуары</a></li>
                                                <li><a href="all-products.html" class="all-link"><i class="fas fa-th-large"></i> Смотреть всё</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="dropdown-wrapper-about">
                                <a href="#" class="nav-link-green dropdown-toggle-about">О нас <i class="fas fa-chevron-down dropdown-arrow-about"></i></a>
                                <div class="dropdown-menu-about">
                                    <div class="mega-menu-container-about">
                                        <div class="mega-menu-section-about">
                                            <ul>
                                                <li><a href="history.html"><i class="fas fa-book-open"></i> История</a></li>
                                                <li><a href="channels.html"><i class="fas fa-users"></i> Наши каналы</a></li>
                                                <li><a href="presentations.html"><i class="fas fa-file-powerpoint"></i> Презентации</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="dropdown-wrapper-info">
                                <a href="#" class="nav-link-green dropdown-toggle-info">Информация <i class="fas fa-chevron-down dropdown-arrow-info"></i></a>
                                <div class="dropdown-menu-info">
                                    <div class="mega-menu-container-info">
                                        <div class="mega-menu-section-info">
                                            <ul>
                                                <li><a href="articles.html"><i class="fas fa-file-alt"></i> Статьи</a></li>
                                                <li><a href="reviews.html"><i class="fas fa-star"></i> Отзывы</a></li>
                                                <li><a href="delivery.html"><i class="fas fa-truck"></i> Оплата и доставка</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <a href="faq.html" class="nav-link-green">FAQ</a>
                        </nav>
                        
                        <div class="search-wrapper">
                            <input type="text" class="search-input" id="searchInputGlobal" placeholder="Поиск товаров...">
                            <div class="search-results" id="searchResultsGlobal"></div>
                        </div>
                        
                        <!-- ДЕСКТОП: иконки корзины, избранного и профиля ТОЛЬКО ЗДЕСЬ -->
                        ${isAuth ? `
                        <div class="action-icons-header">
                            <a href="favorites.html" class="action-icon-header"><i class="far fa-heart"></i><span class="badge-header" id="favoritesCountHeader">0</span></a>
                            <a href="cart.html" class="action-icon-header"><i class="fas fa-shopping-cart"></i><span class="badge-header" id="cartCountHeader">0</span></a>
                            <div class="profile-btn-wrapper">
                                <button class="profile-trigger" id="profileTrigger">
                                    <img src="${userAvatar}" alt="avatar" id="headerUserAvatar" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" onerror="this.src='images/default-avatar.png'">
                                </button>
                                <div class="profile-dropdown" id="profileDropdown">
                                    <a href="profile.html" class="dropdown-item-custom"><i class="fas fa-user-circle"></i> Мой профиль</a>
                                    <a href="#" class="dropdown-item-custom" id="logoutLink"><i class="fas fa-sign-out-alt"></i> Выйти</a>
                                </div>
                            </div>
                        </div>
                        ` : `
                        <div class="social-icons">
                            <a href="https://t.me/formula_health07" target="_blank" class="social-icon-green" title="Telegram"><i class="fab fa-telegram"></i></a>
                            <a href="https://chat.whatsapp.com/JUMvATnb4BB221ohTk8vKt" target="_blank" class="social-icon-green" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                            <a href="https://www.instagram.com/formula_health" target="_blank" class="social-icon-green" title="Instagram"><i class="fab fa-instagram"></i></a>
                            <a href="https://rutube.ru/video/741d2f5cacf5f7442516a02d371053a7/" target="_blank" class="social-icon-green" title="Rutube"><i class="fas fa-play-circle"></i></a>
                        </div>
                        `}
                    </div>
                </div>
            </div>
            <div class="header-spacer"></div>
            
            <!-- Мобильное модальное окно поиска -->
            <div class="mobile-search-modal" id="mobileSearchModal">
                <div class="mobile-search-modal-content">
                    <button class="mobile-search-modal-close" id="mobileSearchModalClose">&times;</button>
                    <input type="text" class="mobile-search-modal-input" id="mobileSearchInput" placeholder="Поиск товаров...">
                    <div class="mobile-search-modal-results" id="mobileSearchResults"></div>
                </div>
            </div>
        `;
        
        initGlobalSearch();
        initMobileSearchModal();
        initMobileBurgerMenuNew();
        
        if (isAuth) {
            initMobileProfileBurgerMenu();
            updateCartBadge();
            updateFavBadge();
            
            const profileTrigger = document.getElementById('profileTrigger');
            const profileDropdown = document.getElementById('profileDropdown');
            if (profileTrigger) {
                profileTrigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    profileDropdown.classList.toggle('open');
                });
                document.addEventListener('click', (e) => {
                    if (!profileTrigger.contains(e.target) && !profileDropdown.contains(e.target)) {
                        profileDropdown.classList.remove('open');
                    }
                });
            }
            const logoutLink = document.getElementById('logoutLink');
            if (logoutLink) logoutLink.addEventListener('click', (e) => { e.preventDefault(); logout(); });
        }
    }
    
    // Подвал (без изменений)
    if (footerPlaceholder) {
        const isAuthForFooter = !!currentUser;
        footerPlaceholder.innerHTML = `
            <footer class="footer-new">
                <div class="footer-bg"></div>
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-brand">
                            <div class="footer-logo-wrapper">
                                <img src="logo.webp" loading="lazy" alt="Формула здоровья" class="footer-logo-img-new">
                                <span class="footer-brand-name">Формула здоровья</span>
                            </div>
                            <div class="footer-social">
                                <a href="https://t.me/formula_health07" target="_blank" class="footer-social-icon" title="Telegram"><i class="fab fa-telegram"></i></a>
                                <a href="https://chat.whatsapp.com/JUMvATnb4BB221ohTk8vKt" target="_blank" class="footer-social-icon" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                                <a href="https://www.instagram.com/formula_health" target="_blank" class="footer-social-icon" title="Instagram"><i class="fab fa-instagram"></i></a>
                                <a href="https://rutube.ru/video/741d2f5cacf5f7442516a02d371053a7/" target="_blank" class="footer-social-icon" title="Rutube"><i class="fas fa-play-circle"></i></a>
                            </div>
                        </div>
                        <div class="footer-column">
                            <h4 class="footer-title">Продукты</h4>
                            <ul class="footer-menu">
                                <li><a href="health.html">Здоровье</a></li>
                                <li><a href="beauty.html">Красота</a></li>
                                <li><a href="devices.html">Приборы/Аксессуары</a></li>
                                <li><a href="all-products.html">Смотреть всё</a></li>
                            </ul>
                        </div>
                        <div class="footer-column">
                            <h4 class="footer-title">О нас</h4>
                            <ul class="footer-menu">
                                <li><a href="history.html">Компания</a></li>
                                <li><a href="channels.html">Наши каналы</a></li>
                                <li><a href="presentations.html">Презентации</a></li>
                            </ul>
                        </div>
                        <div class="footer-column">
                            <h4 class="footer-title">Информация</h4>
                            <ul class="footer-menu">
                                <li><a href="articles.html">Статьи</a></li>
                                <li><a href="reviews.html">Отзывы</a></li>
                                <li><a href="delivery.html">Оплата и доставка</a></li>
                            </ul>
                        </div>
                        <div class="footer-column">
                            <h4 class="footer-title">FAQ</h4>
                            <ul class="footer-menu">
                                <li><a href="faq.html">Часто задаваемые вопросы</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <div class="footer-copyright"><p>© 2026 | Все права защищены</p></div>
                        <div class="footer-bottom-links">
                            <a href="${isAuthForFooter ? 'profile.html' : 'login.html'}">Личный кабинет</a>
                            <a href="privacy.html">Политика конфиденциальности</a>
                            <a href="map.html">Наши данные</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}

// ========== РЕНДЕРИНГ ТОВАРОВ ==========
function renderProductsGrid(containerId, products, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const isAuth = !!currentUser;
    const limit = options.limit || products.length;
    const productsToRender = products.slice(0, limit);
    
    if (productsToRender.length === 0) {
        container.innerHTML = '<p class="text-center">Нет товаров в этой категории</p>';
        return;
    }
    
    container.innerHTML = productsToRender.map(product => {
        const isFav = favorites.some(f => f && f.id === product.id);
        
        let actionButton = '';
        if (isAuth) {
            actionButton = `<button class="btn-cart-icon" data-id="${product.id}"><i class="fas fa-shopping-cart"></i></button>`;
        } else {
            actionButton = `<button class="btn-buy-guest" onclick="redirectToLogin()">Купить</button>`;
        }
        
        const favButton = isAuth ? 
            `<button class="product-fav ${isFav ? 'active' : ''}" data-id="${product.id}"><i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i></button>` : '';
        
        return `
            <div class="product-card">
                ${favButton}
                <div class="product-image"><img src="${product.image}" loading="lazy" alt="${product.name}" onerror="this.parentElement.innerHTML='📦'"></div>
                <div class="product-info">
                    <h3>${escapeHtml(product.name)}</h3>
                    <div class="product-desc">${escapeHtml(product.desc)}</div>
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                    <div class="product-actions">
                        <a href="product-detail.html?id=${product.id}" class="btn-more">Подробнее</a>
                        ${actionButton}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    if (isAuth) {
        container.querySelectorAll('.product-fav').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(btn.dataset.id);
            });
        });
        container.querySelectorAll('.btn-cart-icon:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => addToCartById(btn.dataset.id));
        });
    }
}

// Глобальные функции
window.renderProductsGrid = renderProductsGrid;
window.addToCartById = addToCartById;
window.toggleFavorite = toggleFavorite;
window.redirectToLogin = redirectToLogin;
window.updateCartBadge = updateCartBadge;
window.updateFavBadge = updateFavBadge;
window.initGlobalSearch = initGlobalSearch;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadHeaderAndFooter();
});

// ========== СТАТЬИ ==========
// База данных статей
const articlesData = {
    'rna-technology': {
    title: 'Как работает RNA технология?',
    category: 'Наука',
    date: '15 марта 2025',
    readTime: '4 минуты чтения',
    image: 'images/rnk.webp',
    content: `
        <p><strong>RNA-технология</strong> — это комплекс методов, связанных с изучением РНК (рибонуклеиновой кислоты) и её функций в живых организмах. Основные направления включают анализ транскриптома, изучение экспрессии генов, работу с малыми РНК и другие области.</p>
        
        <h2>Основные методы работы с РНК</h2>
        
        <h3>Секвенирование РНК (RNA-Seq)</h3>
        <p>Метод высокопроизводительного секвенирования для анализа транскриптома, то есть совокупности всех РНК-молекул, экспрессированных в клетке или образце. Позволяет изучать экспрессию генов, идентифицировать новые транскрипты, альтернативный сплайсинг, аллель-специфическую экспрессию и другие явления.</p>
        
        <h3>Принцип работы RNA-Seq:</h3>
        <ul>
            <li>Выделение РНК из биологического материала (клеток, тканей и т. д.)</li>
            <li>Преобразование РНК в кДНК (комплементарную ДНК) с помощью обратной транскрипции</li>
            <li>Фрагментация кДНК и добавление адаптеров к концам фрагментов</li>
            <li>Подготовка библиотеки для секвенирования</li>
            <li>Секвенирование на платформе высокопроизводительного секвенирования (NGS)</li>
            <li>Биоинформатический анализ полученных данных: очистка от технических последовательностей, выравнивание по референсному геному, подсчёт количества прочтений на каждый ген, выявление дифференциальной экспрессии и биологическая интерпретация результатов</li>
        </ul>
        
        <img src="images/RNA_seq_schematic.webp" alt="Схема RNA-Seq" style="max-width: 100%; border-radius: 16px; margin: 20px 0;">
        
        <h3>РНК-интерференция (RNAi)</h3>
        <p>Биологический процесс, при котором молекулы РНК участвуют в последовательном подавлении экспрессии генов с помощью двуцепочечной РНК.</p>
        
        <h4>Механизм действия:</h4>
        <ul>
            <li>Фермент Dicer расщепляет длинные двуцепочечные РНК на короткие фрагменты (например, siRNA — малые интерферирующие РНК)</li>
            <li>Каждая siRNA раскручивается на две одноцепочечные РНК — пассажирскую и направляющую</li>
            <li>Направляющая цепь включается в РНК-индуцируемый комплекс глушения (RISC), который связывается с целевой мРНК и вызывает её деградацию</li>
        </ul>
        
        <p><strong>Использование:</strong> RNAi применяется как инструмент в исследованиях (например, для крупномасштабных скринингов генов) и в медицине.</p>
        
        <h2>Виды RNA-технологий</h2>
        <ul>
            <li><strong>Bulk RNA-Seq</strong> — анализ тотальной РНК из популяции клеток, тканей или биоптатов. Даёт усреднённый профиль экспрессии</li>
            <li><strong>Single-cell RNA-Seq (scRNA-seq)</strong> — секвенирование РНК отдельных клеток. Позволяет изучать гетерогенность клеток в ткани, анализировать траектории клеточной дифференцировки, обнаруживать новые типы клеток и процессы</li>
            <li><strong>miRNA-seq</strong> — целенаправленный подход для профилирования малых регуляторных РНК, таких как микроРНК</li>
        </ul>
        
        <h2>Преимущества RNA-технологий</h2>
        <ul>
            <li>Широкий динамический диапазон для анализа экспрессии генов</li>
            <li>Высокая чувствительность к обнаружению низкоуровневых транскриптов</li>
            <li>Возможность выявления новых транскриптов и изоформ</li>
            <li>Количественная оценка уровней экспрессии генов</li>
        </ul>
        
        <p>RNA-технологии находят применение в исследованиях геномики, онкологии, иммунологии, изучении микробиома, разработке лекарств и других областях.</p>
    `
},
    'autophagy': {
    title: 'Аутофагия: ключ к долголетию',
    category: 'Здоровье',
    date: '1 марта 2025',
    readTime: '6 минут чтения',
    image: 'images/autofagia.webp',
    content: `
        <p><strong>Аутофагия</strong> (от греч. «auto» — «сам» и «phagein» — «пожирать») — это естественный процесс «самоочищения» клеток, при котором организм избавляется от повреждённых или изношенных компонентов. Проще говоря, в ходе аутофагии клетки как бы «перерабатывают» собственный мусор, используя его в качестве источника энергии и «строительных материалов».</p>
        
        <p>За открытие механизмов аутофагии биолог Ёсинори Осуми в 2016 году удостоился Нобелевской премии по физиологии и медицине. С тех пор интерес к аутофагии стремительно вырос, особенно из-за её потенциальной роли в долголетии и профилактике различных заболеваний.</p>
        
        <img src="images/autofag-scheme.webp" alt="Схема аутофагии" style="max-width: 100%; border-radius: 16px; margin: 30px 0;">
        
        <h2>Механизм аутофагии: как клетки «убирают мусор»</h2>
        <p>Клетки нашего организма ежедневно подвергаются воздействию различных стрессовых факторов: ультрафиолетового излучения, токсинов, вирусов, механических повреждений. Кроме того, внутри самих клеток в норме накапливаются «бракованные» белки и старые органеллы (например, митохондрии), уже не способные эффективно выполнять свои функции. При отсутствии механизмов очистки это может привести к «засорению» клетки, накоплению потенциально опасных веществ и, как следствие, развитию хронических заболеваний.</p>
        
        <p>Ключевой компонент аутофагии — это специальные внутриклеточные структуры, <strong>лизосомы</strong>, содержащие ферменты для расщепления «отработанного материала». Процесс аутофагии включает несколько этапов:</p>
        
        <ul>
            <li><strong>Распознавание и изоляция</strong> повреждённых компонентов. Клетка «метит» испорченные белки или органеллы, оборачивая их мембраной, формируя аутофагосому.</li>
            <li><strong>Слияние аутофагосомы с лизосомой</strong>. Мембраны связываются, и ферменты лизосомы начинают расщеплять содержимое.</li>
            <li><strong>Утилизация и рециклинг</strong>. Полученные питательные вещества либо выводятся из клетки, либо повторно используются для построения новых белков и органелл.</li>
        </ul>
        
        <p>Выделяют несколько типов аутофагии: макроаутофагия (крупномасштабный захват участков цитоплазмы и целых органелл), микроаутофагия (поглощение небольших порций клеточного содержимого) и шаперон-опосредованная аутофагия (прицельный перенос белков через мембрану лизосомы с помощью специальных «транспортировщиков»).</p>
        
        <h2>Почему аутофагия важна для долголетия</h2>
        <p>Исследования на животных и клеточных культурах показывают, что активная аутофагия связана с лучшим состоянием здоровья и увеличением продолжительности жизни. Например, в экспериментах на мышах усиление аутофагии замедляло возрастные изменения и снижало вероятность развития таких заболеваний, как рак и метаболические нарушения.</p>
        
        <p>Учёные связывают этот эффект с несколькими механизмами:</p>
        <ul>
            <li><strong>Удаление повреждённых митохондрий</strong>. Митохондрии — это «энергетические станции» клетки. Аутофагия помогает избавиться от повреждённых митохондрий, снижая уровень окислительного стресса.</li>
            <li><strong>Предотвращение накопления белковых агрегатов</strong>. При старении и нейродегенеративных заболеваниях отмечается агрегация патологических белков. Аутофагия способствует их удалению.</li>
            <li><strong>Оптимизация ресурсопользования</strong>. Переработка внутреннего «мусора» даёт дополнительные питательные вещества для клетки в условиях голода.</li>
        </ul>
        
        <h2>Аутофагия и профилактика болезней</h2>
        <p>Потенциальная польза аутофагии не ограничивается лишь замедлением старения. Установлено, что активация этого процесса может играть заметную роль в профилактике:</p>
        <ul>
            <li>Сердечно-сосудистых заболеваний</li>
            <li>Злокачественных новообразований</li>
            <li>Метаболического синдрома и диабета 2 типа</li>
            <li>Нейродегенеративных заболеваний (болезнь Альцгеймера, Паркинсона)</li>
        </ul>
        
        <h2>Научные исследования</h2>
        <p><strong>Нобелевская премия за аутофагию.</strong> Работы Ёсинори Осуми стали прорывными в понимании механизмов аутофагии. Он изучал дрожжевые клетки и показал, как генетические мутации могут влиять на аутофагический процесс.</p>
        
        <p><strong>Эксперименты на мышах.</strong> В исследованиях на лабораторных животных усиление аутофагии приводило к увеличению продолжительности жизни на 10–30%.</p>
        
        <p><strong>Интервальное голодание.</strong> Согласно обзору, опубликованному в журнале Cell Metabolism в 2019 году, интервальное голодание (16:8, 5:2 и другие схемы) может стимулировать аутофагию.</p>
        
        <h2>Способы мягкой стимуляции аутофагии</h2>
        
        <h3>1. Умеренное голодание</h3>
        <p>Интервальное голодание (например, схема 16:8, при которой разрешается есть в течение 8 часов и воздерживаться от пищи 16 часов) помогает временно снизить доступность глюкозы и активирует аутофагию. Ограничение калорий в целом (на 15–20% от суточной нормы) также может стимулировать аутофагию.</p>
        
        <h3>2. Физическая активность</h3>
        <p>Регулярные тренировки (аэробные и силовые) способствуют стрессовой адаптации клетки, стимулируя аутофагию в мышцах. Оптимальная нагрузка — 150–300 минут умеренных аэробных тренировок в неделю.</p>
        
        <h3>3. Контроль уровня стресса</h3>
        <p>Хронический стресс и нарушение сна угнетают аутофагию. Практики осознанности (медитация, йога, дыхательные упражнения) и качественный сон (7–9 часов) благоприятствуют сбалансированной аутофагии.</p>
        
        <h3>4. Некоторые нутриенты</h3>
        <p>Полифенолы (содержатся в зелёном чае, ягодах, винограде) и ресвератрол способны модулировать аутофагические пути. Кетогенная диета в ряде экспериментов также усиливала аутофагию, но требует осторожности.</p>
        
        <h2>Рекомендации по безопасности</h2>
        <p>Длительные периоды голода без врачебного контроля грозят потерей мышечной массы, снижением иммунитета и дефицитом важных микроэлементов. Перед тем, как вносить кардинальные изменения в рацион или график тренировок, рекомендуется проконсультироваться с профильными специалистами.</p>
        
        <h2>Выводы</h2>
        <p>Аутофагия — фундаментальный процесс клеточного самообновления, который помогает избавляться от повреждённых белков и органелл, способствует метаболической гибкости и может играть существенную роль в продлении жизни и профилактике множества заболеваний.</p>
        
        <p>Регулярная физическая активность, разумное ограничение калорий, интервальное голодание и контроль над стрессом — это четыре основные стратегии мягкой стимуляции аутофагии. Регулярная «уборка» на клеточном уровне способна продлить активную фазу жизни, снизить риски развития тяжёлых болезней и улучшить общее самочувствие.</p>
    `
},
    'collagen': {
    title: 'Коллаген: мифы и реальность',
    category: 'Красота',
    date: '10 февраля 2025',
    readTime: '5 минут чтения',
    image: 'images/colagen.webp',
    content: `
        <p><strong>Коллаген</strong> — слово, которое звучит почти магически, когда речь заходит о красоте и молодости. Его называют «белком красоты», обещают вернуть с его помощью гладкость кожи и избавить от морщин. Но где здесь правда, а где маркетинг? Давайте разберёмся.</p>
        
        <h2>Что такое коллаген?</h2>
        <p>Коллаген — это белок, который составляет до 80% структуры нашей кожи. Он отвечает за её упругость, гладкость и эластичность. Со временем выработка коллагена замедляется, и кожа начинает стареть: появляются морщины, теряется тонус, а овал лица становится менее чётким.</p>
        
        <p>Чтобы лучше понять, как это работает, представьте надувной матрас. Когда он новый, он держит форму, а со временем начинает сдуваться. С кожей происходит примерно то же самое.</p>
        
        <h2>Мифы о коллагене: что мы знаем, но не проверяем?</h2>
        <p>Коллаген окружен мифами, которые создают ожидания, часто не соответствующие реальности. Вот основные из них:</p>
        
        <h3>Миф №1: Кремы с коллагеном омолаживают кожу</h3>
        <p>Кремы с коллагеном популярны, но малоэффективны. Почему? Молекула коллагена слишком крупная, чтобы проникнуть в глубокие слои кожи. На самом деле такие кремы работают только на поверхности, увлажняя и создавая иллюзию гладкости.</p>
        <p><strong>Факт:</strong> Для омоложения нужны средства, которые стимулируют собственный коллаген кожи, а не просто создают временный эффект.</p>
        
        <h3>Миф №2: Коллагеновые добавки решают все проблемы</h3>
        <p>Порошки, капсулы и напитки с коллагеном — тренд последних лет. Однако стоит помнить, что в желудке добавки расщепляются на аминокислоты, а организм распределяет их так, как считает нужным. Никаких гарантий, что они пойдут именно на кожу, нет.</p>
        <p><strong>Факт:</strong> Коллагеновые добавки могут быть полезны для общего состояния организма, но не стоит ожидать мгновенного омоложения.</p>
        
        <h3>Миф №3: Коллаген можно полностью восстановить</h3>
        <p>Реальность такова, что полностью вернуть коллаген молодости невозможно. Однако современные процедуры и уход могут стимулировать его выработку и значительно улучшить состояние кожи.</p>
        <p><strong>Факт:</strong> Поддерживать уровень коллагена — реально. Для этого нужны грамотный уход, аппаратные методики и правильный образ жизни.</p>
        
        <h3>Миф №4: Стресс не влияет на кожу</h3>
        <p>Хронический стресс разрушает коллаген. Гормон кортизол, который вырабатывается при стрессе, замедляет регенерацию тканей и ухудшает кровообращение.</p>
        <p><strong>Факт:</strong> Умение расслабляться и забота о внутреннем состоянии так же важны для красоты, как и косметические процедуры.</p>
        
        <h2>Как сохранить коллаген и молодость кожи?</h2>
        <p>Хотя полностью остановить возрастные изменения нельзя, можно замедлить их. Вот несколько советов, которые помогут вашей коже:</p>
        
        <ul>
            <li><strong>Защищайтесь от солнца</strong> — Ультрафиолет разрушает коллаген, поэтому солнцезащитный крем с SPF — обязательный элемент ухода.</li>
            <li><strong>Ешьте продукты, богатые антиоксидантами</strong> — Витамин C, цинк и аминокислоты — ключевые помощники в синтезе коллагена.</li>
            <li><strong>Поддерживайте гидратацию</strong> — Пейте больше воды и используйте увлажняющие средства.</li>
            <li><strong>Скажите "нет" курению</strong> — Никотин снижает выработку коллагена и ухудшает качество кожи.</li>
        </ul>
        
        <h2>Выводы</h2>
        <p>Коллаген действительно важен для молодости кожи, но не стоит верить всем мифам вокруг него. Наиболее эффективный подход — комплексный: правильный уход, здоровый образ жизни и разумное использование косметических средств. Помните, что настоящая красота — это результат заботы о себе изнутри и снаружи.</p>
    `
},
    'biomodulators': {
    title: 'Биомодуляторы: что это и как работают',
    category: 'Наука',
    date: '25 января 2025',
    readTime: '7 минут чтения',
    image: 'images/hqdefault.webp',
    content: `
        <p><strong>Биомодуляторы</strong> — это вещества или препараты, которые воздействуют на живые организмы, регулируя их физиологические процессы, стимулируя естественные механизмы роста, развития или восстановления. Термин используется в разных областях, например в сельском хозяйстве и косметологии.</p>
        
        <h2>Биомодуляторы в сельском хозяйстве</h2>
        <p>В агрономии биомодуляторы — это вещества или микроорганизмы, которые улучшают физиологические функции растений, повышают их устойчивость к стрессам (засуха, перепады температур, болезни) и способствуют росту.</p>
        
        <h3>Примеры биомодуляторов в сельском хозяйстве:</h3>
        <ul>
            <li><strong>Эндофитные микроорганизмы</strong> (например, бактерии B. subtilis), которые взаимодействуют с растениями и укрепляют их иммунную систему, улучшают усвоение питательных веществ из почвы.</li>
            <li><strong>Протатраны</strong> — соединения, которые исследуются как биомодуляторы роста дрожжей Candida ethanolica.</li>
            <li><strong>Микробные стимуляторы</strong> — препараты, которые стимулируют почвенные микробы для высвобождения недоступных ранее питательных веществ, улучшая их доступность для растений.</li>
            <li><strong>Модификаторы метаболизма растений</strong>, полученные из экстрактов растений и морских водорослей. Они целенаправленно модулируют клеточный метаболизм, улучшая транспортировку сахаров и питательных веществ.</li>
        </ul>
        
        <h3>Механизмы действия биомодуляторов в растениях могут включать:</h3>
        <ul>
            <li>Усиление метаболизма на клеточном уровне</li>
            <li>Защиту от стрессов (например, помощь в выработке антиоксидантов)</li>
            <li>Ускорение роста корневой системы</li>
            <li>Повышение эффективности фотосинтеза</li>
        </ul>
        
        <h2>Биомодуляторы в косметологии</h2>
        <p>В косметологии биомодуляторы — это препараты, которые воздействуют на клеточном уровне, восстанавливая структуру кожи и стимулируя её регенерацию. Они используются для борьбы с возрастными изменениями, коррекции морщин, восстановления объёма тканей, улучшения текстуры кожи.</p>
        
        <h3>Примеры биомодуляторов в косметологии:</h3>
        <ul>
            <li><strong>SkyMas</strong> — препараты, которые проникают в кожу, восстанавливают её матрикс, улучшают цито-гистологические показатели соединительной ткани. Они могут увлажнять кожу, омолаживать её, корректировать рубцы, растяжки и последствия акне.</li>
            
            <li><strong>Novacutan BioPRO (Матрикс-биомодулятор)</strong> — препарат на основе гиалуроновой кислоты с трёхступенчатым механизмом действия: внеклеточный уровень (распределение геля во внеклеточном матриксе), внутриклеточный (проникновение гиалуроновой кислоты внутрь клетки) и митохондриальный (субклеточный уровень, где запускается биодеградация гиалуроновой кислоты и повышается активность фибробластов). Обеспечивает лифтинг-эффект, моделирование овала лица, улучшение тургора кожи и другие результаты.</li>
            
            <li><strong>Биомодуляторы соединительной ткани</strong> — средства, которые укрепляют структуру кожи, повышают её эластичность и упругость, стимулируют выработку коллагена и эластина, устраняют мелкие морщины, тёмные круги и признаки усталости.</li>
        </ul>
        
        <h2>Выводы</h2>
        <p>Таким образом, биомодуляторы в разных сферах — это инструменты, которые регулируют естественные процессы, усиливают устойчивость организмов или восстанавливают их функции. В косметологии они становятся всё более популярными благодаря своей способности работать на клеточном уровне, стимулируя собственные ресурсы кожи к восстановлению и омоложению, а не просто создавая временный эффект.</p>
        
        <p>При выборе биомодуляторов важно обращать внимание на их состав, механизм действия и консультироваться со специалистами, особенно когда речь идёт об инъекционных методах в косметологии.</p>
    `
},
'bads': {
    title: 'Биологически активные добавки (БАДы): польза, риски и правила выбора',
    category: 'Здоровье',
    date: '20 апреля 2026',
    readTime: '8 минут чтения',
    image: 'images/bud2.webp',
    content: `
        <p><strong>Биологически активные добавки (БАДы)</strong> — это композиции натуральных или идентичных натуральным биологически активных веществ, предназначенные для непосредственного приёма с пищей или введения в состав пищевых продуктов с целью обогащения рациона отдельными пищевыми или биологически активными веществами или их комплексами. Они не являются лекарствами и не предназначены для лечения болезней, но могут использоваться для поддержания здоровья, профилактики заболеваний и восполнения дефицита нутриентов.</p>
        
        <h2>Что такое БАДы?</h2>
        <p>Согласно определению Роспотребнадзора, БАД — это композиции веществ, получаемых из растительного, животного или минерального сырья, химическими или биотехнологическими способами. Они служат дополнительным источником пищевых и биологически активных веществ, оптимизируют обмен веществ и нормализуют функциональное состояние органов и систем.</p>
        
        <img src="images/bud2.webp" alt="Биологически активные добавки" style="max-width: 100%; border-radius: 16px; margin: 20px 0;">
        
        <h2>Классификация БАДов</h2>
        <p>Выделяют три основные группы биологически активных добавок:</p>
        <ul>
            <li><strong>Нутрицевтики</strong> — применяются для восполнения дефицита эссенциальных пищевых веществ (витаминов, минералов, аминокислот).</li>
            <li><strong>Парафармацевтики</strong> — обладают фармакологической активностью, используются для профилактики и вспомогательной терапии различных состояний.</li>
            <li><strong>Эубиотики (пробиотики)</strong> — содержат живые микроорганизмы или их метаболиты для нормализации микрофлоры кишечника.</li>
        </ul>
        <p>Однако это деление условно, так как многие современные БАДы являются поликомпонентными и могут содержать вещества из разных групп одновременно.</p>
        
        <h2>Цели использования БАДов</h2>
        <p>БАДы применяются для:</p>
        <ul>
            <li>Восполнения недостающих нутриентов (витаминов, минералов, микроэлементов)</li>
            <li>Регулирования калорийности рациона</li>
            <li>Повышения резистентности организма к воздействию неблагоприятных факторов</li>
            <li>Оптимизации обмена веществ</li>
            <li>Нормализации функционального состояния органов и систем</li>
            <li>Поддержки физической и умственной активности</li>
            <li>Контроля веса и детоксикации</li>
        </ul>
        
        <h2>Потенциальная польза БАДов</h2>
        <p>Рацион современного человека часто не полностью удовлетворяет потребности в биологически активных веществах. БАДы могут помочь:</p>
        <ul>
            <li>Восполнить дефицит витамина D в северных регионах</li>
            <li>Обеспечить достаточное поступление омега-3 жирных кислот</li>
            <li>Поддержать здоровье кишечника с помощью пробиотиков</li>
            <li>Укрепить иммунитет в сезон простуд</li>
            <li>Замедлить возрастные изменения с помощью антиоксидантов</li>
        </ul>
        
        <h2>Риски и побочные эффекты</h2>
        <p>Несмотря на пользу, при приёме БАДов существуют определённые риски:</p>
        <ul>
            <li><strong>Несоответствие заявленного и реального состава</strong> — недобросовестные производители могут указывать на упаковке не соответствующие действительности компоненты.</li>
            <li><strong>Негативное взаимодействие с лекарственными препаратами</strong> — некоторые БАДы могут усиливать или ослаблять действие лекарств.</li>
            <li><strong>Прямое токсическое действие</strong> — при превышении дозировок или низком качестве продукции.</li>
            <li><strong>Полипрагмазия</strong> — избыточный приём множества добавок одновременно, что может привести к непредсказуемым последствиям.</li>
            <li><strong>Передозировка витаминами</strong> — избыток витамина D может привести к гиперкальциемии и повреждению почек, избыток витамина A — к токсическому поражению печени.</li>
        </ul>
        
        <h2>Кому особенно важно быть осторожными?</h2>
        <p>Особую осторожность при приёме БАДов следует соблюдать следующим категориям:</p>
        <ul>
            <li>Беременные и кормящие женщины</li>
            <li>Дети и подростки</li>
            <li>Пожилые люди</li>
            <li>Пациенты с хроническими заболеваниями (печени, почек, сердечно-сосудистой системы)</li>
            <li>Люди, принимающие лекарственные препараты на постоянной основе</li>
        </ul>
        
        <h2>Как правильно выбирать БАДы?</h2>
        <p>Чтобы выбор БАДов был безопасным и эффективным, следуйте этим рекомендациям:</p>
        <ul>
            <li>Перед началом приёма обязательно проконсультируйтесь с врачом</li>
            <li>Отдавайте предпочтение продукции известных, проверенных производителей</li>
            <li>Обращайте внимание на наличие сертификатов качества и регистрационных удостоверений</li>
            <li>Изучайте состав — выбирайте добавки с минимальным количеством вспомогательных веществ</li>
            <li>Не превышайте рекомендованные дозировки</li>
            <li>Не сочетайте несколько БАДов без консультации со специалистом</li>
            <li>Не используйте БАДы вместо назначенных врачом лекарств</li>
        </ul>
        
        <h2>Мнение экспертов</h2>
        <p>Врач-педиатр Юлия Лашкова предупреждает, что бесконтрольное употребление БАДов, особенно в детском возрасте, может нанести вред здоровью. Добавки могут быть полезны только при доказанном дефиците витаминов или микроэлементов, но их приём требует консультации врача.</p>
        
        <p>Врачи-терапевты также отмечают, что проблемы часто возникают при использовании БАДов вместо лекарств, превышении дозировок или одновременном приёме нескольких добавок. Состав БАДов не регламентирован так строго, как у лекарственных препаратов, особенно это касается добавок на растительной основе.</p>
        
        <h2>Выводы</h2>
        <p>БАДы могут быть полезным инструментом для поддержания здоровья, но только при грамотном и осознанном подходе. Главные принципы безопасного применения:</p>
        <ul>
            <li>Консультация с врачом перед началом приёма</li>
            <li>Выбор качественной продукции от проверенных производителей</li>
            <li>Соблюдение рекомендованных дозировок</li>
            <li>Отсутствие попыток заменять БАДами назначенное лечение</li>
            <li>Особенная осторожность для детей, беременных и людей с хроническими заболеваниями</li>
        </ul>
        <p>Помните: здоровье — это комплексная система, и никакие добавки не заменят сбалансированного питания, физической активности и полноценного отдыха.</p>
    `
},
'silicon': {
    title: 'Кремний: жизненно важный микроэлемент для здоровья костей, суставов и молодости',
    category: 'Здоровье',
    date: '1 мая 2026',
    readTime: '10 минут чтения',
    image: 'images/krem.webp',
    content: `
        <p><strong>Кремний</strong> — это жизненно важный микроэлемент, который играет ключевую роль в поддержании здоровья человека. Он участвует в формировании и функционировании соединительной ткани, влияет на состояние костей, суставов, кожи, волос, ногтей, а также на работу сердечно-сосудистой системы и иммунной системы.</p>
        
        <h2>Роль кремния в организме</h2>
        
        <h3>Формирование и минерализация костной ткани</h3>
        <p>Кремний необходим для отложения кальция и фосфора в костном матриксе, что обеспечивает прочность костей. Он участвует в процессах остеогенеза — формирования костной ткани. Исследования показывают, что в областях активного костеобразования концентрация кремния может быть в десятки раз выше, чем в зрелой костной ткани.</p>
        
        <h3>Поддержка соединительной ткани</h3>
        <p>Кремний входит в состав коллагена и гликозаминогликанов — ключевых компонентов соединительной ткани. Он способствует стабилизации и «сшиванию» коллагеновых волокон, улучшает свойства соединительной ткани, помогая обеспечить её прочность и гибкость. Это ускоряет восстановление тканей после повреждений.</p>
        
        <h3>Влияние на суставы и хрящи</h3>
        <p>Кремний придаёт хрящу гладкость и эластичность, улучшает синтез коллагена, что важно для подвижности и износоустойчивости суставов.</p>
        
        <h3>Поддержание здоровья кожи, волос и ногтей</h3>
        <p>Как компонент соединительной ткани, кремний поддерживает упругость кожи, прочность волос и ногтей. Он также участвует в усвоении и усилении антиоксидантных свойств витаминов А, Е, С, которые влияют на состояние кожи, волос и ногтей.</p>
        
        <h3>Поддержка сердечно-сосудистой системы</h3>
        <p>Кремний укрепляет стенки сосудов за счёт участия в синтезе коллагена и эластина. Снижение уровня кремния в стенках сосудов коррелирует с развитием атеросклероза, что указывает на его роль в сохранении эластичности артерий.</p>
        
        <h3>Иммуномодулирующее и антиоксидантное действие</h3>
        <p>Кремний участвует в работе иммунной системы, обладает противовоспалительными свойствами, ускоряет нейтрализацию свободных радикалов, помогает выводить токсины, защищает от инфекций и воспалений.</p>
        
        <h3>Влияние на обмен жиров</h3>
        <p>Кремний замедляет отложение холестериновых бляшек на стенках сосудов, что снижает риск развития атеросклероза.</p>
        
        <h3>Защита от токсического действия алюминия</h3>
        <p>Кремний конкурирует с алюминием, поэтому при достаточном его содержании алюминий не будет оседать в сосудах. Алюминий считается одним из факторов риска развития болезни Альцгеймера.</p>
        
        <h2>Источники кремния</h2>
        <ul>
            <li><strong>Растительные продукты</strong> — крупы (овёс, бурый рис, ячмень, просо), бобовые (соя, фасоль, нут), овощи (свёкла, морковь, капуста, брокколи, шпинат), фрукты (ананас, бананы, дыня). В них кремний присутствует в доступной для усвоения форме — ортокремниевой кислоте.</li>
            <li><strong>Питьевая вода</strong> — кремний содержится в ней в форме растворённых соединений, которые легко усваиваются.</li>
            <li><strong>Минеральные воды</strong> с высоким содержанием кремния.</li>
        </ul>
        
        <h2>Суточная потребность и факторы риска дефицита</h2>
        <p>Суточная потребность человека в кремнии варьируется от 20 до 50 мг. Однако точная норма не установлена, так как роль кремния в организме изучена не полностью.</p>
        
        <h3>Причины дефицита кремния:</h3>
        <ul>
            <li>несбалансированное питание с преобладанием рафинированных продуктов;</li>
            <li>длительные низкокалорийные диеты с ограничением растительной пищи;</li>
            <li>избыточное потребление алюминия;</li>
            <li>заболевания желудочно-кишечного тракта (гастриты, энтериты, колиты), дисбактериоз кишечника;</li>
            <li>период активного роста у детей и подростков, беременность, грудное вскармливание, интенсивные физические нагрузки;</li>
            <li>возрастные изменения метаболизма после 45–50 лет.</li>
        </ul>
        
        <h3>Признаки дефицита:</h3>
        <ul>
            <li>ухудшение состояния кожи, ломкость волос и ногтей;</li>
            <li>болезненность суставов и костей;</li>
            <li>плохая переносимость физической нагрузки, быстрое утомление;</li>
            <li>проблемы с иммунной защитой, частые простуды.</li>
        </ul>
        
        <h2>Избыток кремния</h2>
        <p>Порог токсичности кремния — около 500 мг в сутки. Избыток может возникать при нарушении регуляции обмена кремния, избыточном поступлении микроэлемента (например, при работе на промышленных предприятиях, связанных с добычей, переработкой или применением кремния).</p>
        
        <h3>Признаки избытка:</h3>
        <ul>
            <li>фиброз и силикоз лёгких;</li>
            <li>моче- и желчекаменная болезнь;</li>
            <li>злокачественные опухоли плевры;</li>
            <li>подагра, раздражительность.</li>
        </ul>
        
        <h2>Дополнительные аспекты</h2>
        <ul>
            <li>С возрастом способность организма усваивать и удерживать кремний снижается. После 30–35 лет концентрация кремния в тканях начинает постепенно уменьшаться, что является одним из факторов старения соединительной ткани.</li>
            <li>При некоторых состояниях (остеопения, постменопауза, снижение всасывания после операций) врач может назначить биологически активные добавки (БАДы) с кремнием, но только по назначению специалиста.</li>
            <li>Важно учитывать, что кремний может конкурировать с другими веществами, поэтому при наличии проблем с усвоением или других заболеваний необходимо проконсультироваться с врачом.</li>
        </ul>
        
        <h2>Выводы</h2>
        <p>Перед внесением изменений в рацион или приёмом добавок рекомендуется проконсультироваться со специалистом, чтобы избежать избытка или недостатка кремния. Кремний — важнейший микроэлемент для поддержания здоровья костей, суставов, сосудов и молодости кожи. Сбалансированное питание с включением продуктов, богатых кремнием, поможет сохранить здоровье и активность на долгие годы.</p>
    `
},
'vitamin-k2': {
    title: 'Витамин K2 и MenaQ7: ключ к здоровью сосудов, костей и долголетию',
    category: 'Здоровье',
    date: '15 мая 2026',
    readTime: '9 минут чтения',
    image: 'images/menag.webp',
    content: `
        <p><strong>Витамин K2</strong> — один из самых недооценённых, но критически важных витаминов для здоровья человека. Долгое время он оставался в тени своего "коллеги" витамина K1, но современные исследования открывают всё новые грани его влияния на организм. А форма <strong>MenaQ7</strong> (менихинон-7) считается наиболее эффективной и биодоступной формой витамина K2.</p>
        
        <img src="images/menaq72.webp" alt="Витамин K2 и MenaQ7" style="max-width: 100%; border-radius: 16px; margin: 20px 0;">
        
        <h2>Что такое витамин K2?</h2>
        <p>Витамин K — это группа жирорастворимых витаминов, которая включает две основные формы:</p>
        <ul>
            <li><strong>Витамин K1 (филлохинон)</strong> — содержится в зелёных листовых овощах, участвует в свёртывании крови.</li>
            <li><strong>Витамин K2 (менихинон)</strong> — содержится в ферментированных продуктах и продуктах животного происхождения, отвечает за метаболизм кальция.</li>
        </ul>
        <p>Витамин K2, в свою очередь, имеет несколько подформ — от MK-4 до MK-13. Наиболее изученной и эффективной считается форма <strong>MK-7 (MenaQ7)</strong>, которая обладает самой высокой биодоступностью и самым длительным периодом действия в организме (до 72 часов).</p>
        
        <h2>Как работает витамин K2?</h2>
        <p>Главная функция витамина K2 — активация белков, которые управляют распределением кальция в организме. Два ключевых белка:</p>
        <ul>
            <li><strong>Остеокальцин</strong> — белок, который "притягивает" кальций в костную ткань, обеспечивая её прочность и плотность.</li>
            <li><strong>Матриксный Gla-белок (MGP)</strong> — белок, который защищает сосуды от обызвествления, предотвращая отложение кальция на стенках артерий.</li>
        </ul>
        <p>Без достаточного количества витамина K2 эти белки остаются неактивными. Кальций, вместо того чтобы укреплять кости, начинает откладываться там, где ему не место — в сосудах, почках, суставах и мягких тканях.</p>
        
        <h2>Витамин K2 и витамин D3: идеальная пара</h2>
        <p>Витамин D3 увеличивает всасывание кальция в кишечнике — но не указывает, куда этот кальций должен направиться. Именно витамин K2 "даёт указания" кальцию: в кости — пожалуйста, в сосуды — ни в коем случае. Приём витамина D3 без витамина K2 может даже навредить, способствуя отложению кальция в сосудах. Поэтому во многих качественных добавках эти два витамина сочетаются.</p>
        
        <h2>Польза витамина K2 и MenaQ7 для здоровья</h2>
        
        <h3>1. Здоровье костей и профилактика остеопороза</h3>
        <p>Витамин K2 активирует остеокальцин, который связывает кальций и встраивает его в костный матрикс. Многочисленные исследования показывают, что приём витамина K2 снижает риск переломов шейки бедра на 60-80%, увеличивает минеральную плотность костной ткани и замедляет потерю костной массы у женщин в постменопаузе.</p>
        
        <h3>2. Здоровье сердечно-сосудистой системы</h3>
        <p>Активируя матриксный Gla-белок (MGP), витамин K2 предотвращает кальциноз сосудов — процесс, при котором стенки артерий становятся жёсткими и ломкими. Исследование Rotterdam Study с участием 4800 человек показало, что высокое потребление витамина K2 снижает риск кальциноза аорты на 57% и риск смерти от ишемической болезни сердца на 57%.</p>
        
        <h3>3. Здоровье зубов</h3>
        <p>Остеокальцин, активируемый витамином K2, также участвует в формировании дентина — твёрдой ткани зуба. Витамин K2 помогает укреплять эмаль и снижает риск кариеса.</p>
        
        <h3>4. Профилактика варикозного расширения вен</h3>
        <p>MGP белок также защищает венозные клапаны от кальцификации, что может снижать риск развития варикозной болезни.</p>
        
        <h3>5. Поддержка когнитивного здоровья</h3>
        <p>Новые исследования показывают, что витамин K2 может защищать нервные клетки и снижать риск нейродегенеративных заболеваний за счёт участия в метаболизме сфинголипидов — важных компонентов миелиновой оболочки нервов.</p>
        
        <h2>Источники витамина K2</h2>
        <ul>
            <li><strong>Ферментированные продукты</strong> — натто (ферментированные соевые бобы) абсолютный лидер по содержанию MK-7, квашеная капуста, кимчи, ферментированные сыры (гауда, бри, камамбер).</li>
            <li><strong>Продукты животного происхождения</strong> — яичные желтки (особенно от кур на свободном выгуле), сливочное масло, печень, мясо птицы.</li>
            <li><strong>БАДы с MenaQ7</strong> — наиболее надёжный способ получить терапевтическую дозу витамина K2 в правильной форме.</li>
        </ul>
        
        <h2>Дефицит: факторы риска и признаки</h2>
        <h3>Факторы риска дефицита витамина K2:</h3>
        <ul>
            <li>Низкое потребление ферментированных продуктов</li>
            <li>Приём антибиотиков (угнетают кишечную микрофлору, которая частично синтезирует K2)</li>
            <li>Заболевания кишечника с нарушением всасывания (целиакия, болезнь Крона)</li>
            <li>Приём статинов (снижают уровень K2)</li>
            <li>Возраст старше 50 лет (снижение всасывания)</li>
        </ul>
        
        <h3>Признаки дефицита:</h3>
        <ul>
            <li>Склонность к переломам, остеопения, остеопороз</li>
            <li>Кальциноз сосудов (выявляется на УЗИ или КТ)</li>
            <li>Кровоточивость дёсен</li>
            <li>Проблемы с зубами, частый кариес</li>
            <li>Варикозное расширение вен</li>
        </ul>
        
        <h2>Рекомендуемые дозировки</h2>
        <p>Для профилактики остеопороза и сердечно-сосудистых заболеваний рекомендуемая доза MenaQ7 (MK-7) составляет <strong>90-120 мкг в день</strong>. Важно принимать витамин K2 одновременно с жирной пищей для лучшего усвоения (он жирорастворим), а также в паре с витамином D3 (типичное соотношение: 100 мкг K2 на 2000-5000 МЕ D3).</p>
        
        <h2>Безопасность и противопоказания</h2>
        <p>Витамин K2 считается безопасным даже в высоких дозах, так как избыток выводится из организма. Однако людям, принимающим антикоагулянты (варфарин, кумадин), следует проконсультироваться с врачом перед приёмом добавок с витамином K, так как он может влиять на свёртываемость крови. Новые антикоагулянты нового поколения (апиксабан, ривароксабан) не взаимодействуют с витамином K.</p>
        
        <h2>Почему MenaQ7?</h2>
        <p>MenaQ7 — это запатентованная форма витамина K2 MK-7, полученная из натто (ферментированных бобов). Преимущества MenaQ7:</p>
        <ul>
            <li><strong>Максимальная биодоступность</strong> — усваивается почти на 100%</li>
            <li><strong>Длительное действие</strong> — период полувыведения до 72 часов</li>
            <li><strong>Натуральное происхождение</strong> — 100% растительный источник (также есть веганские варианты)</li>
            <li><strong>Клинически доказанная эффективность</strong> — более 20 клинических исследований</li>
        </ul>
        
        <h2>Выводы</h2>
        <p>Витамин K2, особенно в форме MenaQ7, — это незаменимый микронутриент для здоровья костей, сосудов и сердца. Он работает в синергии с витамином D3, направляя кальций туда, где он действительно нужен, и защищая организм от кальцификации сосудов и остеопороза. Учитывая, что современный рацион беден источниками витамина K2, дополнительный приём качественных добавок с MenaQ7 — стратегически важное решение для долголетия и качества жизни.</p>
        
        <p><em>Перед началом приёма любых добавок рекомендуется проконсультироваться с врачом.</em></p>
    `
},
};

// Функция загрузки статьи
function loadArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    if (articleId && articlesData[articleId]) {
        const article = articlesData[articleId];
        document.title = `${article.title} - Формула здоровья`;
        
        const categoryEl = document.getElementById('articleCategory');
        const titleEl = document.getElementById('articleTitle');
        const dateEl = document.getElementById('articleDate');
        const readTimeEl = document.getElementById('articleReadTime');
        const imageEl = document.getElementById('articleImage');
        const contentEl = document.getElementById('articleContent');
        
        if (categoryEl) categoryEl.textContent = article.category;
        if (titleEl) titleEl.textContent = article.title;
        if (dateEl) dateEl.textContent = article.date;
        if (readTimeEl) readTimeEl.textContent = article.readTime;
        if (imageEl) imageEl.innerHTML = `<img src="${article.image}" alt="${article.title}" onerror="this.parentElement.innerHTML='📖'">`;
        if (contentEl) contentEl.innerHTML = article.content;
    }
}

// Запускаем загрузку статьи на странице статьи
if (document.getElementById('articleContent')) {
    loadArticle();
}

// ========== ПРЕЗЕНТАЦИИ - ИНИЦИАЛИЗАЦИЯ МОДАЛЬНОГО ОКНА ДЛЯ ВИДЕО ==========
function initPresentationsVideoModal() {
    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const modalTitle = document.getElementById('modalVideoTitle');
    const closeBtn = document.querySelector('.video-modal-close');
    const openBtns = document.querySelectorAll('.open-video-modal-btn');
    
    if (!modal) return;
    
    // Открытие модального окна
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const videoSrc = btn.getAttribute('data-video-src');
            const videoTitle = btn.getAttribute('data-video-title') || 'Видео презентация';
            
            if (modalVideo) {
                const source = modalVideo.querySelector('source');
                if (source) {
                    source.src = videoSrc;
                    modalVideo.load();
                }
            }
            
            if (modalTitle) {
                modalTitle.textContent = videoTitle;
            }
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Закрытие модального окна
    const closeModal = () => {
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Запускаем инициализацию для страницы презентаций
if (document.querySelector('.presentations-page')) {
    document.addEventListener('DOMContentLoaded', () => {
        initPresentationsVideoModal();
    });
}

// ========== СТРАНИЦА ПРОФИЛЯ ==========
function initProfilePage() {
    if (!document.getElementById('personalTab')) return;
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    function formatDate(dateString) {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }
    
    // Обновление отображения личных данных
    function updatePersonalDisplay() {
        const profileEmail = document.getElementById('profileEmail');
        const displayName = document.getElementById('displayName');
        const displayEmail = document.getElementById('displayEmail');
        const displayPhone = document.getElementById('displayPhone');
        const displayRegDate = document.getElementById('displayRegDate');
        const editName = document.getElementById('editName');
        const editEmail = document.getElementById('editEmail');
        const editPhone = document.getElementById('editPhone');
        const avatarImg = document.getElementById('avatarImg');
        
        if (profileEmail) profileEmail.textContent = currentUser.email || '';
        if (displayName) displayName.textContent = currentUser.name || '—';
        if (displayEmail) displayEmail.textContent = currentUser.email || '—';
        if (displayPhone) displayPhone.textContent = currentUser.phone || '—';
        if (displayRegDate) displayRegDate.textContent = formatDate(currentUser.regDate) || '—';
        if (editName) editName.value = currentUser.name || '';
        if (editEmail) editEmail.value = currentUser.email || '';
        if (editPhone) editPhone.value = currentUser.phone || '';
        if (avatarImg && currentUser.avatar) {
            avatarImg.src = currentUser.avatar;
        }
    }
    
    // Обновление аватарки
    function updateAvatar(imageData) {
        currentUser.avatar = imageData;
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].avatar = imageData;
            localStorage.setItem('users', JSON.stringify(users));
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        const avatarImg = document.getElementById('avatarImg');
        if (avatarImg) avatarImg.src = imageData;
    }
    
    // Загрузка аватарки
    const avatarInput = document.getElementById('avatarInput');
    const avatarOverlay = document.querySelector('.avatar-overlay');
    
    if (avatarOverlay && avatarInput) {
        avatarOverlay.addEventListener('click', () => {
            avatarInput.click();
        });
        
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    updateAvatar(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Отображение истории заказов
    function displayOrders() {
        const ordersKey = `orders_${currentUser.email}`;
        const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
        const container = document.getElementById('ordersList');
        
        if (!container) return;
        
        if (orders.length === 0) {
            container.innerHTML = '<div class="empty-orders">У вас пока нет заказов</div>';
            return;
        }
        
        container.innerHTML = orders.reverse().map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Заказ №${order.orderId}</span>
                    <span class="order-date">${order.date}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span class="order-item-name">${escapeHtml(item.name)} × ${item.quantity}</span>
                            <span class="order-item-price">${item.total.toLocaleString()} ₽</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">Итого: ${order.total.toLocaleString()} ₽</div>
            </div>
        `).join('');
    }
    
    // Сохранение профиля
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const newName = document.getElementById('editName').value;
            const newEmail = document.getElementById('editEmail').value;
            const newPhone = document.getElementById('editPhone').value;
            
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            if (userIndex !== -1) {
                users[userIndex].name = newName;
                users[userIndex].email = newEmail;
                users[userIndex].phone = newPhone;
                localStorage.setItem('users', JSON.stringify(users));
                
                currentUser = users[userIndex];
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                updatePersonalDisplay();
                const editForm = document.getElementById('editForm');
                if (editForm) editForm.classList.remove('active');
                alert('Данные сохранены!');
            }
        });
    }
    
    // Смена пароля
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            const oldPass = document.getElementById('oldPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;
            
            if (oldPass !== currentUser.password) {
                alert('Неверный текущий пароль');
                return;
            }
            if (newPass.length < 6) {
                alert('Новый пароль должен быть не менее 6 символов');
                return;
            }
            if (newPass !== confirmPass) {
                alert('Пароли не совпадают');
                return;
            }
            
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            if (userIndex !== -1) {
                users[userIndex].password = newPass;
                localStorage.setItem('users', JSON.stringify(users));
                currentUser.password = newPass;
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                alert('Пароль успешно изменен!');
                document.getElementById('oldPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            }
        });
    }
    
    // Выход
    const logoutProfileBtn = document.getElementById('logoutProfileBtn');
    if (logoutProfileBtn) {
        logoutProfileBtn.addEventListener('click', () => {
            logout();
        });
    }
    
    // Редактирование
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editForm = document.getElementById('editForm');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    
    if (editProfileBtn && editForm) {
        editProfileBtn.addEventListener('click', () => {
            editForm.classList.toggle('active');
        });
    }
    if (cancelEditBtn && editForm) {
        cancelEditBtn.addEventListener('click', () => {
            editForm.classList.remove('active');
        });
    }
    
    // Переключение вкладок
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const tabContent = document.getElementById(`${tab}Tab`);
            if (tabContent) tabContent.classList.add('active');
            
            if (tab === 'orders') {
                displayOrders();
            }
        });
    });
    
    // Инициализация
    updatePersonalDisplay();
    
    // Добавляем дату регистрации, если её нет
    if (!currentUser.regDate) {
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].regDate = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));
            currentUser.regDate = users[userIndex].regDate;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }
    updatePersonalDisplay();
}

if (document.getElementById('personalTab')) {
    document.addEventListener('DOMContentLoaded', () => {
        initProfilePage();
    });
}

// ========== БУРГЕР-МЕНЮ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ ==========
function initBurgerMenu() {
    // Создаем элементы бургер-меню, если их нет
    if (!document.querySelector('.burger-menu')) {
        const headerBottomRow = document.querySelector('.header-bottom-row');
        if (!headerBottomRow) return;
        
        // Удаляем старые элементы, если есть
        const oldBurger = document.querySelector('.burger-menu');
        if (oldBurger) oldBurger.remove();
        
        // Создаем кнопку бургер
        const burgerBtn = document.createElement('button');
        burgerBtn.className = 'burger-menu';
        burgerBtn.innerHTML = '<span></span><span></span><span></span>';
        
        // Создаем оверлей (полупрозрачный фон)
        const overlay = document.createElement('div');
        overlay.className = 'burger-overlay';
        
        // Создаем содержимое бургера (полный экран)
        const burgerContent = document.createElement('div');
        burgerContent.className = 'burger-content';
        
        // Создаем кнопку закрытия (крестик)
        const closeBtn = document.createElement('button');
        closeBtn.className = 'burger-close';
        
        // Определяем, авторизован ли пользователь
        const isAuth = !!currentUser;
        
        burgerContent.innerHTML = `
    <div class="burger-nav">
        <!-- РАЗДЕЛ ПРОДУКТЫ с выпадающим подменю -->
        <div class="burger-nav-section dropdown-section">
            <div class="burger-nav-title dropdown-title" data-dropdown="products">
                Продукты <i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>
            <div class="dropdown-submenu" id="dropdown-products">
                <ul class="burger-nav-links">
                    <li><a href="new-items.html">Новинки</a></li>
                    <li><a href="health.html">Здоровье</a></li>
                    <li><a href="beauty.html">Красота</a></li>
                    <li><a href="devices.html">Приборы/Аксессуары</a></li>
                    <li><a href="all-products.html">Смотреть всё</a></li>
                </ul>
            </div>
        </div>
        
        <!-- РАЗДЕЛ О НАС с выпадающим подменю -->
        <div class="burger-nav-section dropdown-section">
            <div class="burger-nav-title dropdown-title" data-dropdown="about">
                О нас <i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>
            <div class="dropdown-submenu" id="dropdown-about">
                <ul class="burger-nav-links">
                    <li><a href="history.html">История</a></li>
                    <li><a href="channels.html">Наши каналы</a></li>
                    <li><a href="presentations.html">Презентации</a></li>
                </ul>
            </div>
        </div>
        
        <!-- РАЗДЕЛ ИНФОРМАЦИЯ с выпадающим подменю -->
        <div class="burger-nav-section dropdown-section">
            <div class="burger-nav-title dropdown-title" data-dropdown="info">
                Информация <i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>
            <div class="dropdown-submenu" id="dropdown-info">
                <ul class="burger-nav-links">
                    <li><a href="articles.html">Статьи</a></li>
                    <li><a href="reviews.html">Отзывы</a></li>
                    <li><a href="delivery.html">Оплата и доставка</a></li>
                </ul>
            </div>
        </div>
        
        <!-- FAQ - просто ссылка -->
        <div class="burger-nav-section">
            <a href="faq.html" class="burger-nav-title plain-link">FAQ</a>
        </div>
        
        <!-- Этот блок будет занимать всё свободное место (пустота) -->
        <div class="burger-nav-spacer"></div>
        
        ${!isAuth ? `
        <!-- ВХОД/РЕГИСТРАЦИЯ - внизу перед соцсетями -->
        <div class="burger-nav-section bottom-section">
            <a href="login.html" class="burger-nav-title plain-link">Вход / Регистрация</a>
        </div>
        ` : `
        <!-- Для авторизованных: Личный кабинет внизу -->
        <div class="burger-nav-section bottom-section">
            <div class="burger-nav-title dropdown-title" data-dropdown="account">
                Личный кабинет <i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>
            <div class="dropdown-submenu" id="dropdown-account">
                <ul class="burger-nav-links">
                    <li><a href="profile.html">Мой профиль</a></li>
                    <li><a href="favorites.html">Избранное</a></li>
                    <li><a href="cart.html">Корзина</a></li>
                    <li><a href="#" id="burgerLogoutLink">Выйти</a></li>
                </ul>
            </div>
        </div>
        `}
    </div>
    
    <div class="burger-social">
        <div class="burger-social-title">Мы в соцсетях</div>
        <div class="burger-social-icons">
            <a href="https://t.me/formula_health07" target="_blank"><i class="fab fa-telegram"></i></a>
            <a href="https://chat.whatsapp.com/JUMvATnb4BB221ohTk8vKt" target="_blank"><i class="fab fa-whatsapp"></i></a>
            <a href="https://www.instagram.com/formula_health" target="_blank"><i class="fab fa-instagram"></i></a>
            <a href="https://rutube.ru/video/741d2f5cacf5f7442516a02d371053a7/" target="_blank"><i class="fas fa-play-circle"></i></a>
        </div>
    </div>
`;
        
        // Добавляем кнопку закрытия в начало
        burgerContent.insertBefore(closeBtn, burgerContent.firstChild);
        
        // Добавляем элементы на страницу
        document.body.appendChild(overlay);
        document.body.appendChild(burgerContent);
        
        // Добавляем кнопку в header-bottom-row (после search-wrapper - справа)
        const searchWrapper = headerBottomRow.querySelector('.search-wrapper');
        if (searchWrapper) {
            // Вставляем ПОСЛЕ search-wrapper
            searchWrapper.insertAdjacentElement('afterend', burgerBtn);
        } else {
            headerBottomRow.appendChild(burgerBtn);
        }
        
        // Для авторизованных добавляем мобильные иконки корзины и избранного
        if (isAuth) {
            const actionIcons = document.createElement('div');
            actionIcons.className = 'action-icons-header-mobile';
            actionIcons.style.display = 'flex';
            actionIcons.innerHTML = `
                <a href="favorites.html" class="action-icon-mobile">
                    <i class="far fa-heart"></i>
                    <span class="badge-mobile" id="favoritesCountMobile">${favorites.length}</span>
                </a>
                <a href="cart.html" class="action-icon-mobile">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="badge-mobile" id="cartCountMobile">${cart.length}</span>
                </a>
            `;
            headerBottomRow.appendChild(actionIcons);
        }
        
        // Функции открытия/закрытия
        const openBurger = () => {
            burgerBtn.classList.add('active');
            overlay.classList.add('active');
            burgerContent.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        
        const closeBurger = () => {
            burgerBtn.classList.remove('active');
            overlay.classList.remove('active');
            burgerContent.classList.remove('active');
            document.body.style.overflow = '';
        };
        
        burgerBtn.addEventListener('click', openBurger);
        overlay.addEventListener('click', closeBurger);
        closeBtn.addEventListener('click', closeBurger);
        
        // Обработчики для выпадающих подменю
        const dropdownTitles = document.querySelectorAll('.dropdown-title');
        dropdownTitles.forEach(title => {
            title.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdownId = title.dataset.dropdown;
                const submenu = document.getElementById(`dropdown-${dropdownId}`);
                if (submenu) {
                    submenu.classList.toggle('open');
                    title.classList.toggle('open');
                }
            });
        });
        
        // Обработчик для выхода в бургере
        const burgerLogout = document.getElementById('burgerLogoutLink');
        if (burgerLogout) {
            burgerLogout.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
        
        // Закрытие бургера при клике на ссылку
        burgerContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeBurger);
        });
    }
}

// Запуск бургер-меню на мобильных устройствах
function checkMobileAndInitBurger() {
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            initBurgerMenu();
        }, 100);
    }
}

// Слушаем изменение размера окна
window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
        if (!document.querySelector('.burger-menu')) {
            initBurgerMenu();
        }
    }
});

// ========== МОБИЛЬНОЕ ВИДЕО ==========
function initMobileVideo() {
    const videoWrapper = document.querySelector('.video-wrapper');
    if (!videoWrapper) return;
    
    // Очищаем wrapper и создаем новое видео
    function setVideoForScreen() {
        const isMobile = window.innerWidth <= 768;
        const videoSrc = isMobile ? 'video2.mp4' : 'video.mp4';
        
        // Находим существующее видео
        let video = videoWrapper.querySelector('.bg-video');
        
        if (!video) {
            video = document.createElement('video');
            video.className = 'bg-video';
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            videoWrapper.insertBefore(video, videoWrapper.firstChild);
        }
        
        // Меняем src только если нужно
        const currentSrc = video.querySelector('source')?.src || video.src;
        if (currentSrc.includes(videoSrc)) return;
        
        // Меняем видео
        const wasPlaying = !video.paused;
        video.pause();
        
        const source = document.createElement('source');
        source.src = videoSrc;
        source.type = 'video/mp4';
        
        // Очищаем старые source
        while (video.firstChild) {
            video.removeChild(video.firstChild);
        }
        video.appendChild(source);
        
        video.load();
        video.play().catch(e => console.log('Автовоспроизведение заблокировано:', e));
    }
    
    // Запускаем при загрузке
    setVideoForScreen();
    
    // Запускаем при изменении размера экрана
    window.addEventListener('resize', setVideoForScreen);
}

// Запускаем после загрузки страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileVideo);
} else {
    initMobileVideo();
}

// ===== VERUM SHORT ВИДЕО =====
function initShortVideos() {
    const shortCards = document.querySelectorAll('.short-card');
    
    // Проверяем, есть ли видео карточки на странице
    if (shortCards.length === 0) return;

   // Создаём модальное окно только если есть карточки
    let modal = document.querySelector('.short-video-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'short-video-modal';
        modal.innerHTML = `
            <div class="short-video-modal-content">
                <video controls>
                    <source src="" type="video/mp4">
                </video>
            </div>
            <div class="short-video-modal-close">&times;</div>
        `;
        document.body.appendChild(modal);
    }
    
    const modalVideo = modal.querySelector('video');
    const closeBtn = modal.querySelector('.short-video-modal-close');
    
    // Открытие видео при клике
    shortCards.forEach(card => {
        const wrapper = card.querySelector('.short-video-wrapper');
        const video = card.querySelector('.short-video');
        if (!video) return;
        
        const videoSrc = video.querySelector('source')?.src || video.src;
        
        const openModal = (e) => {
            e.stopPropagation();
            if (modalVideo && videoSrc) {
                modalVideo.querySelector('source').src = videoSrc;
                modalVideo.load();
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        };
        
        if (wrapper) wrapper.addEventListener('click', openModal);
    });
    
    // Закрытие модального окна
    const closeModal = () => {
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Модальное окно поиска
function initMobileSearchModal() {
    const searchIcon = document.getElementById('searchIconMobile');
    const modal = document.getElementById('mobileSearchModal');
    const closeBtn = document.getElementById('mobileSearchModalClose');
    const searchInput = document.getElementById('mobileSearchInput');
    const searchResults = document.getElementById('mobileSearchResults');
    
    if (!searchIcon || !modal) return;
    
    searchIcon.addEventListener('click', () => {
        modal.classList.add('active');
        if (searchInput) searchInput.focus();
    });
    
    const closeModal = () => {
        modal.classList.remove('active');
        if (searchResults) searchResults.innerHTML = '';
        if (searchInput) searchInput.value = '';
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (!query) {
                if (searchResults) searchResults.innerHTML = '';
                return;
            }
            const results = allProducts.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                (p.desc && p.desc.toLowerCase().includes(query.toLowerCase()))
            );
            if (!searchResults) return;
            if (results.length === 0) {
                searchResults.innerHTML = '<div style="padding:15px;text-align:center;">Ничего не найдено</div>';
                return;
            }
            searchResults.innerHTML = results.slice(0, 10).map(p => `
                <a href="product-detail.html?id=${p.id}" class="search-result-item" style="display:flex;gap:12px;padding:12px;border-bottom:1px solid #e8ddd7;text-decoration:none;align-items:center;">
                    <img src="${p.image}" onerror="this.style.display='none'" style="width:45px;height:45px;object-fit:contain">
                    <div><strong>${escapeHtml(p.name)}</strong><br>${p.price.toLocaleString()} ₽</div>
                </a>
            `).join('');
        });
    }
}

function initMobileBurgerMenuNew() {
    const burgerBtn = document.getElementById('burgerMenuBtnMobile');
    if (!burgerBtn) return;
    
    const oldOverlay = document.querySelector('.mobile-burger-overlay-new');
    if (oldOverlay) oldOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'mobile-burger-overlay-new';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1040;display:none;';
    
    const menu = document.createElement('div');
    menu.className = 'mobile-burger-menu-new';
    menu.style.cssText = 'position:fixed;top:0;right:-100%;width:100%;height:100%;background:white;z-index:1050;transition:right 0.3s ease;display:flex;flex-direction:column;overflow-y:auto;';
    
    const isAuth = !!currentUser;
    
    menu.innerHTML = `
        <div style="padding:20px 25px;text-align:right;">
            <button class="mobile-burger-close-new" style="background:none;border:none;font-size:32px;cursor:pointer;color:#000;">&times;</button>
        </div>
        
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:20px 40px;">
            <div style="margin-bottom:25px;border-bottom:1px solid #e8ddd7;">
                <div class="burger-nav-title-new" data-dropdown="products" style="font-size:22px;font-weight:600;padding:15px 0;cursor:pointer;display:flex;justify-content:center;align-items:center;color:#000;">
                    Продукты <i class="fas fa-chevron-down" style="font-size:14px;"></i>
                </div>
                <div class="burger-submenu-new" data-submenu="products" style="display:none;padding-left:20px;margin-bottom:10px;">
                    <a href="health.html" style="display:block;padding:12px 0;color:#333;text-decoration:none;font-size:16px;">Здоровье</a>
                    <a href="beauty.html" style="display:block;padding:12px 0;color:#333;text-decoration:none;font-size:16px;">Красота</a>
                    <a href="devices.html" style="display:block;padding:12px 0;color:#333;text-decoration:none;font-size:16px;">Приборы/Аксессуары</a>
                    <a href="all-products.html" style="display:block;padding:12px 0;color:#333;text-decoration:none;font-size:16px;">Смотреть всё</a>
                    <a href="new-items.html" style="display:block;padding:12px 0;color:#333;text-decoration:none;font-size:16px;">Новинки</a>
                </div>
            </div>
            
            <div style="margin-bottom:25px;border-bottom:1px solid #e8ddd7;">
                <div class="burger-nav-title-new" data-dropdown="about" style="font-size:22px;font-weight:600;padding:15px 0;cursor:pointer;display:flex;justify-content:center;align-items:center;color:#000;">
                    О нас <i class="fas fa-chevron-down" style="font-size:14px;"></i>
                </div>
                <div class="burger-submenu-new" data-submenu="about" style="display:none;padding-left:20px;margin-bottom:10px;">
                    <a href="history.html" style="display:block;padding:12px 0;color:#333;text-decoration:none;font-size:16px;">История</a>
                    <a href="channels.html" style="display:block;padding:12px 0;color:#333;text-decoration:none;font-size:16px;">Наши каналы</a>
                    <a href="presentations.html" style="display:block;padding:12px 0;color:#333;text-decoration:none;font-size:16px;">Презентации</a>
                </div>
            </div>
            
            <div style="margin-bottom:25px;border-bottom:1px solid #e8ddd7;">
                <div class="burger-nav-title-new" data-dropdown="info" style="font-size:22px;font-weight:600;padding:15px 0;cursor:pointer;display:flex;justify-content:center;align-items:center;color:#000;">
                    Информация <i class="fas fa-chevron-down" style="font-size:14px;"></i>
                </div>
                <div class="burger-submenu-new" data-submenu="info" style="display:none;padding-left:20px;margin-bottom:10px;">
                    <a href="articles.html" style="display:block;padding:12px 0;color:#333;text-decoration:none;font-size:16px;">Статьи</a>
                    <a href="reviews.html" style="display:block;padding:12px 0;color:#333;text-decoration:none;font-size:16px;">Отзывы</a>
                    <a href="delivery.html" style="display:block;padding:12px 0;color:#333;text-decoration:none;font-size:16px;">Оплата и доставка</a>
                </div>
            </div>
            
            <div style="margin-bottom:25px;border-bottom:1px solid #e8ddd7;">
                <a href="faq.html" style="display:block;font-size:22px;font-weight:600;padding:15px 0;color:#000;text-decoration:none;text-align:center;">FAQ</a>
            </div>
        </div>
        
                        <div style="margin-top:auto;padding:0 40px 40px 40px;">
            <div style="height:2px;background:#000;margin-bottom: 10px;"></div>
            
            <!-- Личный кабинет (только для авторизованных) -->
            ${isAuth ? `
            <div style="margin-bottom:-10px;text-align:center;">
                <a href="profile.html" style="display:inline-block;font-size:18px;font-weight:500;color:#000;text-decoration:none;padding:10px 0px;">
                    Личный кабинет
                </a>
            </div>
            ` : `
            <div style="margin-bottom:-10px;text-align:center;">
                <a href="login.html" style="display:inline-block;font-size:18px;font-weight:500;color:#000;text-decoration:none;padding:10px 20px;">
                    Вход / Регистрация
                </a>
            </div>
            `}
            
            <!-- Соцсети (без верхней линии) -->
            <div style="display:flex;justify-content:center;gap:10px;margin-top:10px;margin-bottom:-30px;">
                <a href="https://t.me/formula_health07" target="_blank" style="color:#333;font-size:26px;"><i class="fab fa-telegram"></i></a>
                <a href="https://chat.whatsapp.com/JUMvATnb4BB221ohTk8vKt" target="_blank" style="color:#333;font-size:26px;"><i class="fab fa-whatsapp"></i></a>
                <a href="https://www.instagram.com/formula_health" target="_blank" style="color:#333;font-size:26px;"><i class="fab fa-instagram"></i></a>
                <a href="https://rutube.ru/video/741d2f5cacf5f7442516a02d371053a7/" target="_blank" style="color:#333;font-size:26px;"><i class="fas fa-play-circle"></i></a>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(menu);
    
    const closeBtn = menu.querySelector('.mobile-burger-close-new');
    
    const openMenu = () => {
        overlay.style.display = 'block';
        menu.style.right = '0';
        document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
        overlay.style.display = 'none';
        menu.style.right = '-100%';
        document.body.style.overflow = '';
    };
    
    burgerBtn.addEventListener('click', openMenu);
    overlay.addEventListener('click', closeMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    
    const titles = menu.querySelectorAll('.burger-nav-title-new');
    titles.forEach(title => {
        title.addEventListener('click', (e) => {
            e.stopPropagation();
            const submenu = title.parentElement.querySelector('.burger-submenu-new');
            if (submenu) {
                const isOpen = submenu.style.display === 'block';
                submenu.style.display = isOpen ? 'none' : 'block';
                const icon = title.querySelector('i');
                if (icon) icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });
    });
    
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

// Профильное бургер-меню (для авторизованных)
function initMobileProfileBurgerMenu() {
    const profileBtn = document.getElementById('mobileProfileAvatarBtn');
    if (!profileBtn) return;
    
    const oldOverlay = document.querySelector('.mobile-profile-overlay');
    if (oldOverlay) oldOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'mobile-profile-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1040;display:none;';
    
            const menu = document.createElement('div');
    menu.className = 'mobile-profile-menu';
    menu.style.cssText = 'position:fixed;top:-100%;right:20px;width:calc(100% - 40px);max-width:250px;background:white;z-index:1050;transition:top 0.3s ease;display:flex;flex-direction:column;overflow-y:auto;border-radius:20px;box-shadow:0 4px 15px rgba(0,0,0,0.1);';
    
    const userAvatar = currentUser?.avatar || 'images/default-avatar.png';
    const userName = currentUser?.name || 'Пользователь';
    
        menu.innerHTML = `
        <div style="padding:10px 20px;text-align:right;">
            <button class="mobile-profile-close" style="background:none;border:none;font-size:24px;cursor:pointer;color:#000;">&times;</button>
        </div>
        
        <div style="text-align:center;margin-bottom:15px;">
            <img src="${userAvatar}" alt="avatar" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid #64b61a;margin-bottom:5px;">
            <div style="font-size:16px;font-weight:600;color:#000;">${escapeHtml(userName)}</div>
            <div style="font-size:11px;color:#64b61a;">${currentUser?.email || ''}</div>
        </div>
        
        <div style="padding:0 15px;">
            <a href="profile.html" style="display:block;font-size:16px;font-weight:500;color:#000;text-decoration:none;padding:10px 0;text-align:center;border-bottom:1px solid #e8ddd7;">
                Мой профиль
            </a>
            <a href="favorites.html" style="display:block;font-size:16px;font-weight:500;color:#000;text-decoration:none;padding:10px 0;text-align:center;border-bottom:1px solid #e8ddd7;">
                Избранное <span id="profileBurgerFavCount" style="font-size:13px;color:#64b61a;">${favorites.length > 0 ? `(${favorites.length})` : ''}</span>
            </a>
            <a href="cart.html" style="display:block;font-size:16px;font-weight:500;color:#000;text-decoration:none;padding:10px 0;text-align:center;border-bottom:1px solid #e8ddd7;">
                Корзина <span id="profileBurgerCartCount" style="font-size:13px;color:#64b61a;">${cart.length > 0 ? `(${cart.length})` : ''}</span>
            </a>
        </div>
        
        <div style="margin-top:auto;padding:15px;">
            <div style="height:1px;background:#e8ddd7;margin-bottom:15px;"></div>
            <a href="#" id="profileBurgerLogout" style="display:block;font-size:15px;font-weight:500;color:#e74c3c;text-decoration:none;text-align:center;">
                Выйти
            </a>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(menu);
    
    const closeBtn = menu.querySelector('.mobile-profile-close');
    
        const openMenu = () => {
        overlay.style.display = 'block';
        menu.style.top = '60px'; 
        document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
        overlay.style.display = 'none';
        menu.style.top = '-100%';
        document.body.style.overflow = '';
    };
    
    profileBtn.addEventListener('click', openMenu);
    overlay.addEventListener('click', closeMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    
    menu.querySelectorAll('a').forEach(link => {
        if (link.id !== 'profileBurgerLogout') {
            link.addEventListener('click', closeMenu);
        }
    });
    
    const logoutBtn = document.getElementById('profileBurgerLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// ========== ПОКАЗАТЬ БОЛЬШЕ ДЛЯ О НАС НА МОБИЛЬНЫХ ==========
function initShowMoreAbout() {
    // Проверяем, что это мобильное устройство
    if (window.innerWidth > 768) return;
    
    const aboutTextBlock = document.querySelector('#aboutus + section .col-md-6');
    if (!aboutTextBlock) return;
    
    // Находим первый абзац
    const firstParagraph = aboutTextBlock.querySelector('p');
    if (!firstParagraph) return;
    const firstParagraphText = firstParagraph.outerHTML;
    
    // Находим блок с ключевыми словами
    const keywordsBlock = aboutTextBlock.querySelector('.keywords-buttons');
    const keywordsHTML = keywordsBlock ? keywordsBlock.outerHTML : '';
    
    // Находим все остальные абзацы (кроме первого)
    const allParagraphs = aboutTextBlock.querySelectorAll('p');
    let remainingContent = '';
    let foundFirst = false;
    
    allParagraphs.forEach(p => {
        if (!foundFirst) {
            foundFirst = true;
            return;
        }
        remainingContent += p.outerHTML;
    });
    
    // Пересобираем блок: первый абзац + кнопка + скрытый остальной текст + ключевые слова (всегда видны)
    aboutTextBlock.innerHTML = `
        ${firstParagraphText}
        <button id="showMoreBtn" style="margin-top: 10px; margin-bottom: 10px; background: transparent !important; color: #000000 !important; border: none !important; padding: 8px 0; font-size: 14px; cursor: pointer; text-decoration: underline; text-underline-offset: 3px;">
            Показать больше
        </button>
        <div id="moreAboutText" style="display: none;">
            ${remainingContent}
        </div>
        ${keywordsHTML}
    `;
    
    const moreText = document.getElementById('moreAboutText');
    const showMoreBtn = document.getElementById('showMoreBtn');
    
    if (showMoreBtn && moreText) {
        showMoreBtn.addEventListener('click', () => {
            if (moreText.style.display === 'none') {
                moreText.style.display = 'block';
                showMoreBtn.textContent = 'Скрыть';
            } else {
                moreText.style.display = 'none';
                showMoreBtn.textContent = 'Показать больше';
            }
        });
    }
}

// Запускаем после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    initShowMoreAbout();
});

// Также запускаем при изменении размера окна (если стало мобильным)
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && !document.getElementById('showMoreBtn')) {
        initShowMoreAbout();
    } else if (window.innerWidth > 768 && document.getElementById('showMoreBtn')) {
        // Если стало десктопом, показываем весь текст
        const aboutTextBlock = document.querySelector('#aboutus + section .col-md-6');
        if (aboutTextBlock) {
            const moreText = document.getElementById('moreAboutText');
            const showMoreBtn = document.getElementById('showMoreBtn');
            if (moreText && showMoreBtn) {
                moreText.style.display = 'block';
                showMoreBtn.style.display = 'none';
            }
        }
    }
});

// ========== COOKIE CONSENT (УВЕДОМЛЕНИЕ О COOKIES) ==========
function initCookieConsent() {
    // Проверяем, давал ли пользователь согласие
    const cookieConsentGiven = localStorage.getItem('cookie_consent');
    
    if (cookieConsentGiven === 'accepted' || cookieConsentGiven === 'declined') {
        return; // Если уже ответил, не показываем
    }
    
    // Создаём блок уведомления
    const consentDiv = document.createElement('div');
    consentDiv.className = 'cookie-consent';
    consentDiv.innerHTML = `
        <div class="cookie-text">
            Данный веб-сайт использует cookie-файлы в целях предоставления вам лучшего пользовательского опыта на нашем сайте. Продолжая использовать данный сайт, вы соглашаетесь с использованием нами cookie-файлов. Для получения дополнительной информации см.
            <a href="privacy.html">Политика Cookie.</a>.
        </div>
        <div class="cookie-buttons">
            <button class="cookie-accept">Принять</button>
    `;
    
    document.body.appendChild(consentDiv);
    
    // Обработчики кнопок
    const acceptBtn = consentDiv.querySelector('.cookie-accept');
    const declineBtn = consentDiv.querySelector('.cookie-decline');
    
    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'accepted');
        consentDiv.remove();
        // Здесь можно включить аналитические скрипты (Яндекс.Метрика, Google Analytics)
        console.log('Cookies приняты');
    });
    
    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            localStorage.setItem('cookie_consent', 'declined');
            consentDiv.remove();
        });
    }
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initCookieConsent();
});

// ========== ЧАТ ПОДДЕРЖКИ (АВТОМАТИЧЕСКИ НА ВСЕХ СТРАНИЦАХ) ==========
function initSupportChat() {
    // Проверяем, есть ли уже чат на странице
    if (document.querySelector('.support-chat')) return;
    
    // Создаём HTML чата
    const chatHTML = `
        <div class="support-chat">
            <div class="chat-icon" id="chatIcon">
                <i class="fas fa-comment-dots"></i>
            </div>
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <span><i class="fas fa-headset"></i> Поддержка</span>
                    <button id="chatCloseBtn">&times;</button>
                </div>
                <div class="chat-messages" id="chatMessages"></div>
                <div class="chat-input">
                    <input type="text" id="chatInput" placeholder="Введите сообщение...">
                    <button id="chatSendBtn"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatHTML);
    
    const chatIcon = document.getElementById('chatIcon');
    const chatWindow = document.getElementById('chatWindow');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatMessages = document.getElementById('chatMessages');
    
    // Данные пользователя
    let userName = 'Гость';
    if (typeof currentUser !== 'undefined' && currentUser) {
        if (currentUser.name) userName = currentUser.name;
        else if (currentUser.email) userName = currentUser.email.split('@')[0];
    }
    
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    function getCurrentDate() {
        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        return `${day}.${month}`;
    }
    
    function addMessage(sender, text, isBot = true, botName = 'Екатерина') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isBot ? 'bot' : 'user'}`;
        
        const timeString = getCurrentTime();
        const dateString = getCurrentDate();
        const senderName = isBot ? botName : userName;
        const senderIcon = isBot ? '🤖' : '👤';
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-info">
                    <span class="message-name">${senderIcon} ${escapeHtml(senderName)}</span>
                    <span class="message-time">${dateString} ${timeString}</span>
                </div>
                <div class="message-text">${escapeHtml(text)}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function addWelcomeMessage() {
        if (chatMessages.children.length === 0) {
            const welcomeText = `Здравствуйте${userName !== 'Гость' ? ', ' + escapeHtml(userName) : ''}! Чем я могу вам помочь?`;
            addMessage('Екатерина', welcomeText, true, 'Екатерина');
        }
    }
    
    if (chatIcon) {
        chatIcon.addEventListener('click', () => {
            chatWindow.style.display = 'flex';
            addWelcomeMessage();
        });
    }
    
    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', () => {
            chatWindow.style.display = 'none';
        });
    }
    
    document.addEventListener('click', (e) => {
        if (chatWindow && chatWindow.style.display === 'flex') {
            if (!chatWindow.contains(e.target) && !chatIcon.contains(e.target)) {
                chatWindow.style.display = 'none';
            }
        }
    });
    
    // Счётчик для последовательных ответов бота
    let botMessageIndex = 0;
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;
        
        addMessage(userName, message, false);
        chatInput.value = '';
        
        setTimeout(() => {
            const botResponses = [
                'Спасибо за ваше сообщение! Оставьте свои контакты, наш специалист свяжется с вами.',
                'Благодарю! Ожидайте.',
            ];
            
            const response = botResponses[botMessageIndex % botResponses.length];
            addMessage('Екатерина', response, true, 'Екатерина');
            botMessageIndex++;
        }, 800);
    }
    
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
    
    // Функция для отслеживания скролла и поднятия чата над подвалом
    function adjustChatPosition() {
        const footer = document.querySelector('.footer-new');
        const chat = document.querySelector('.support-chat');
        
        if (!footer || !chat) return;
        
        const footerRect = footer.getBoundingClientRect();
        
        if (footerRect.top < window.innerHeight) {
            chat.classList.add('near-footer');
        } else {
            chat.classList.remove('near-footer');
        }
    }
    
    window.addEventListener('scroll', adjustChatPosition);
    window.addEventListener('resize', adjustChatPosition);
    setTimeout(adjustChatPosition, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    initSupportChat();
});
