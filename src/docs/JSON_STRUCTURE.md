# JSON Структура Экрана

## Обзор

Новая JSON структура поддерживает формат экрана с иерархической структурой контента, состоянием и параметрами.

## Основная структура

```json
{
  "type": "screen",
  "baseParams": {},
  "typeParams": {
    "state": [...],
    "content": {...}
  }
}
```

### Поля верхнего уровня

- `type`: Тип структуры (всегда "screen")
- `baseParams`: Базовые параметры экрана
- `typeParams`: Параметры типа экрана

## Состояние (State)

```json
"state": [
  {
    "key": "title",
    "type": "string", 
    "value": "Шапка экрана"
  }
]
```

### Поля состояния

- `key`: Ключ переменной
- `type`: Тип данных (string, number, boolean, etc.)
- `value`: Значение по умолчанию

## Контент (Content)

### Структура экрана

```json
"content": {
  "type": "screen",
  "header": {...},
  "content": {...},
  "footer": {...}
}
```

### Типы элементов

#### 1. Контейнер (Container)
```json
{
  "type": "container",
  "direction": "column",
  "alignment": "top-right",
  "padding": 16,
  "margin": { "top": 8, "bottom": 8 },
  "gap": 8,
  "widthMode": "fill",
  "heightMode": "fixed",
  "heightValue": 200,
  "style": {
    "backgroundColor": "rgba(240, 240, 240, 0.3)",
    "border": "1px dashed #ccc",
    "borderRadius": 8
  },
  "content": [...]
}
```

#### 2. Кнопка (Button)
```json
{
  "type": "button",
  "text": "Нажмите здесь",
  "variant": "primary",
  "disabled": false,
  "style": {
    "padding": "12px 24px",
    "backgroundColor": "hsl(142 100% 31%)",
    "color": "white",
    "borderRadius": 8
  }
}
```

#### 3. Текст (Text)
```json
{
  "type": "text",
  "text": "{title}",
  "style": {
    "fontSize": 18,
    "fontWeight": "600"
  }
}
```

#### 4. Иконка (Icon)
```json
{
  "type": "icon",
  "src": { "type": "res", "value": "arrow_left" },
  "actions": [{ "type": "navigation_back" }]
}
```

#### 5. Изображение (Image)
```json
{
  "type": "image",
  "src": { "type": "url", "value": "https://example.com/image.jpg" },
  "style": {
    "width": "200px",
    "height": "150px"
  }
}
```

## Стили (Style)

### Общие свойства

- `fontSize`: Размер шрифта (число)
- `fontWeight`: Толщина шрифта (string | number)
- `backgroundColor`: Цвет фона (string)
- `color`: Цвет текста (string)
- `padding`: Внутренние отступы (string | number)
- `margin`: Внешние отступы (string | object)
- `borderRadius`: Радиус скругления (number)
- `border`: Граница (string)

### Margin объект

```json
"margin": {
  "top": 8,
  "bottom": 8,
  "left": 16,
  "right": 16
}
```

## Действия (Actions)

```json
"actions": [
  {
    "type": "navigation_back"
  },
  {
    "type": "navigation_forward",
    "target": "next_screen"
  }
]
```

## Ресурсы (Resources)

### Типы ресурсов

- `res`: Локальный ресурс
- `url`: Внешний URL

```json
"src": { "type": "res", "value": "arrow_left" }
"src": { "type": "url", "value": "https://example.com/image.jpg" }
```

## Пример полной структуры

```json
{
  "type": "screen",
  "baseParams": {},
  "typeParams": {
    "state": [
      {
        "key": "title",
        "type": "string",
        "value": "Шапка экрана"
      }
    ],
    "content": {
      "type": "screen",
      "header": {
        "type": "row",
        "alignment": "center",
        "padding": 16,
        "gap": 8,
        "content": [
          {
            "type": "icon",
            "src": { "type": "res", "value": "arrow_left" },
            "actions": [{ "type": "navigation_back" }]
          },
          {
            "type": "text",
            "text": "{title}",
            "style": {
              "fontSize": 18,
              "fontWeight": "600"
            }
          }
        ]
      },
      "content": {
        "type": "column_scroll",
        "gap": 16,
        "padding": 16,
        "content": [
          {
            "type": "container",
            "direction": "column",
            "alignment": "top-right",
            "padding": 16,
            "margin": { "top": 8, "bottom": 8 },
            "gap": 8,
            "widthMode": "fill",
            "heightMode": "fixed",
            "heightValue": 200,
            "style": {
              "backgroundColor": "rgba(240, 240, 240, 0.3)",
              "border": "1px dashed #ccc",
              "borderRadius": 8
            },
            "content": [
              {
                "type": "button",
                "text": "Нажмите здесь",
                "variant": "primary",
                "disabled": false,
                "style": {
                  "padding": "12px 24px",
                  "backgroundColor": "hsl(142 100% 31%)",
                  "color": "white",
                  "borderRadius": 8
                }
              }
            ]
          }
        ]
      },
      "footer": {}
    }
  }
}
```

## Совместимость

Система поддерживает:
- ✅ Новую структуру экрана (type: "screen")
- ✅ Старую структуру массива виджетов
- ✅ Автоматическое определение формата при импорте
- ✅ Преобразование между форматами при экспорте/импорте
