# Архитектура системы логики BDUI

## Общая схема работы

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Пользователь   │    │   Интерфейс     │    │   Состояние     │
│                 │    │                 │    │                 │
│ 1. Клик/Ввод    │───▶│ 2. Событие      │───▶│ 3. Обновление   │
│                 │    │                 │    │                 │
│ 4. Реакция      │◀───│ 5. Перерисовка  │◀───│ 6. Изменения    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Компоненты системы

### 1. Управление состоянием

```
App State (Глобальное)
├── user: { name, email, isLoggedIn }
├── theme: 'light' | 'dark'
└── settings: { language, notifications }

Screen State (Экран)
├── cart: Array<Item>
├── total: number
├── isLoading: boolean
└── form: { email, password, errors }

Widget State (Локальное)
├── count: number
├── isExpanded: boolean
└── selectedItem: string
```

### 2. Система событий

```
Триггеры событий:
├── on_click        → Клик по элементу
├── on_change       → Изменение ввода
├── on_load         → Загрузка экрана
├── on_init         → Инициализация
└── custom_event    → Пользовательское событие

Условия:
├── screen.cart.length > 0
├── app.user.isLoggedIn
└── screen.form.email.includes('@')

Действия:
├── state_update    → Обновить состояние
├── navigation      → Переход
├── api_call        → API запрос
├── emit_event      → Отправить событие
└── toast           → Уведомление
```

### 3. Привязки данных

```
UI Элемент ←→ Переменная состояния
     │              │
     ▼              ▼
┌─────────────┐ ┌─────────────┐
│   Кнопка    │ │ screen.cart │
│   Текст     │ │ app.user    │
│   Изображение│ │ screen.form │
└─────────────┘ └─────────────┘
     │              │
     ▼              ▼
┌─────────────┐ ┌─────────────┐
│ Привязки:   │ │ Выражения:  │
│ • Текст     │ │ {screen.cart.total} │
│ • Видимость │ │ {app.user.name}     │
│ • Стили     │ │ {screen.isLoading}  │
└─────────────┘ └─────────────┘
```

## Поток выполнения

### 1. Инициализация
```
1. Загрузка экрана
2. Инициализация переменных состояния
3. Применение привязок к элементам
4. Запуск событий on_init
```

### 2. Взаимодействие пользователя
```
1. Пользователь кликает/вводит
2. Система определяет триггер
3. Проверка условий события
4. Выполнение последовательности действий
5. Обновление состояния
6. Перерисовка интерфейса
```

### 3. Обработка данных
```
1. Получение данных с сервера (api_call)
2. Обновление состояния (state_update)
3. Пересчет зависимых значений (recalculate)
4. Уведомление пользователя (toast)
5. Навигация (navigation)
```

## Примеры архитектуры

### E-commerce корзина

```
Состояние:
├── screen.cart: Array<{id, name, price, quantity}>
├── screen.total: number
├── screen.discount: number
└── screen.shipping: number

События:
├── onItemAdd → cart.push(item) + recalculate()
├── onItemRemove → cart.splice(index, 1) + recalculate()
├── onQuantityChange → item.quantity = newValue + recalculate()
└── onCheckout → validate() + navigate('payment')

Привязки:
├── Текст "Корзина ({cart.length})" ← {screen.cart.length}
├── Текст "Итого: {total}₽" ← {screen.cart.total}
├── Кнопка "Оформить" ← {screen.cart.length > 0}
└── Скидка ← {screen.total >= 1000 ? 10% : 0%}
```

### Форма входа

```
Состояние:
├── screen.form: {email, password, errors}
├── screen.isLoading: boolean
├── screen.isValid: boolean
└── app.user: {name, email, isLoggedIn}

События:
├── onEmailChange → validateEmail() + updateErrors()
├── onPasswordChange → validatePassword() + updateErrors()
├── onSubmit → validateForm() + login() + navigate()
└── onLoginSuccess → updateUser() + navigate('dashboard')

Привязки:
├── Поле email ← {screen.form.email}
├── Ошибка email ← {screen.form.errors.email}
├── Кнопка "Войти" ← {screen.isValid && !screen.isLoading}
└── Спиннер ← {screen.isLoading}
```

## Безопасность и производительность

### Валидация выражений
```
Разрешенные операции:
├── Арифметика: +, -, *, /, %
├── Сравнения: ==, !=, <, >, <=, >=
├── Логика: &&, ||, !
├── Массивы: .length, .map(), .filter()
└── Объекты: .property, .method()

Запрещенные операции:
├── eval()
├── Function()
├── setTimeout()
└── Внешние API без разрешения
```

### Оптимизация
```
1. Ленивая загрузка переменных
2. Кэширование вычислений
3. Батчинг обновлений состояния
4. Дебаунсинг пользовательского ввода
5. Мемоизация сложных выражений
```

## Интеграция с внешними системами

### API интеграция
```
1. Настройка endpoints в apiConfig
2. Создание действий api_call
3. Обработка ответов и ошибок
4. Обновление состояния результатами
5. Показ уведомлений пользователю
```

### Навигация
```
1. Определение маршрутов
2. Создание действий navigation
3. Передача параметров между экранами
4. Обработка истории браузера
5. Защита маршрутов (авторизация)
```

---

Эта архитектура обеспечивает гибкость, производительность и безопасность при создании сложных интерактивных интерфейсов.
