# API Документація для n8n ендпоінтів

Base URL: `https://n8n.romanstudi0.pp.ua/webhook`

## Аутентифікація

### POST /auth/register
Реєстрація нового користувача

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "student@example.com",
      "role": "student",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "jwt-token-here"
  }
}
```

### POST /auth/login
Вхід користувача

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "student@example.com",
      "role": "student",
      "vark_type": "visual",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "jwt-token-here"
  }
}
```

---

## VARK Тест

### GET /vark/questions
Отримання питань для VARK тесту

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "q1",
      "text": "Коли вам потрібно навчитися користуватися новим додатком, ви:",
      "options": [
        {
          "id": "a",
          "text": "Дивитеся демонстраційне відео",
          "type": "visual"
        },
        {
          "id": "b",
          "text": "Слухаєте пояснення від друга",
          "type": "auditory"
        },
        {
          "id": "c",
          "text": "Читаєте інструкцію",
          "type": "read_write"
        },
        {
          "id": "d",
          "text": "Одразу починаєте користуватися і експериментуєте",
          "type": "kinesthetic"
        }
      ]
    }
  ]
}
```

**Примітка:** Має повертати 16 питань з 4 варіантами відповідей кожне.

### POST /vark/submit
Відправка результатів VARK тесту

**Request Body:**
```json
{
  "email": "student@example.com",
  "visual": 25,
  "auditory": 18,
  "read_write": 31,
  "kinesthetic": 26
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vark_type": "read_write"
  },
  "message": "Результати VARK тесту збережено"
}
```

**Логіка:**
- Приймає email та відсотки для кожного типу
- Визначає домінуючий тип (найбільше значення)
- Зберігає в БД або оновлює існуючий запис
- Повертає визначений тип

### GET /vark/user-result
Отримання збереженого результату користувача

**Query Parameters:**
- `email` - email користувача

**Response:**
```json
{
  "success": true,
  "data": {
    "visual": 25,
    "auditory": 18,
    "read_write": 31,
    "kinesthetic": 26,
    "vark_type": "read_write"
  }
}
```

**Response (якщо результатів немає):**
```json
{
  "success": false,
  "error": "VARK результатів не знайдено"
}
```

---

## Адаптивне тестування

### GET /test/subjects
Отримання списку доступних предметів для тестування

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "math-01",
      "name": "Математика",
      "description": "Алгебра та геометрія",
      "questions_count": 45
    },
    {
      "id": "physics-01",
      "name": "Фізика",
      "description": "Механіка та термодинаміка",
      "questions_count": 38
    },
    {
      "id": "history-01",
      "name": "Історія України",
      "description": "Новітня історія",
      "questions_count": 52
    }
  ]
}
```

### POST /test/start
Початок нового тесту з обраного предмету

**Request Body:**
```json
{
  "email": "student@example.com",
  "subject_id": "math-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "session-uuid",
    "question": {
      "id": "q-123",
      "text": "Яке значення має вираз 2 + 3 × 4?",
      "options": ["14", "20", "10", "24"],
      "correct_answer": 0,
      "difficulty": "medium",
      "subject": "Математика"
    }
  }
}
```

**Логіка:**
- Створює новий session для користувача
- Повертає перше питання середньої складності
- Зберігає початковий час та параметри сесії

### POST /test/submit-answer
Відправка відповіді на питання

**Request Body:**
```json
{
  "email": "student@example.com",
  "session_id": "session-uuid",
  "question_id": "q-123",
  "answer": 0,
  "time_spent": 15430
}
```

**Response (наступне питання):**
```json
{
  "success": true,
  "data": {
    "is_correct": true,
    "next_question": {
      "id": "q-124",
      "text": "Розв'яжіть рівняння: 2x + 5 = 15",
      "options": ["5", "10", "7.5", "2.5"],
      "correct_answer": 0,
      "difficulty": "hard",
      "subject": "Математика"
    },
    "completed": false
  }
}
```

**Response (тест завершено):**
```json
{
  "success": true,
  "data": {
    "is_correct": false,
    "completed": true,
    "final_score": 75,
    "questions_answered": 10,
    "correct_answers": 7
  }
}
```

**Логіка адаптивності:**
- Якщо відповідь правильна - наступне питання складніше
- Якщо неправильна - наступне питання легше
- Тест завершується після 10-15 питань або коли система визначила рівень знань
- Зберігає всі відповіді в історію

### GET /results
Отримання статистики користувача

**Query Parameters:**
- `email` - email користувача

**Response:**
```json
{
  "success": true,
  "data": {
    "tests_completed": 5,
    "average_score": 78,
    "correct_answers": 42,
    "total_questions": 54,
    "test_history": [
      {
        "subject": "Математика",
        "score": 85,
        "questions_answered": 12,
        "completed_at": "2024-01-15T14:30:00Z"
      },
      {
        "subject": "Фізика",
        "score": 70,
        "questions_answered": 10,
        "completed_at": "2024-01-14T10:15:00Z"
      }
    ]
  }
}
```

---

## Кабінет викладача

### POST /teacher/questions
Створення нового питання (тільки для викладачів)

**Request Body:**
```json
{
  "text": "Яка формула площі кола?",
  "options": ["πr²", "2πr", "πd", "r²"],
  "correct_answer": 0,
  "difficulty": "easy",
  "subject": "Математика"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "q-new-456"
  },
  "message": "Питання успішно створено"
}
```

### PUT /teacher/questions/:questionId
Редагування існуючого питання

**Request Body:**
```json
{
  "text": "Яка формула площі кола? (оновлено)",
  "options": ["πr²", "2πr", "πd", "r²"],
  "correct_answer": 0,
  "difficulty": "medium",
  "subject": "Математика"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Питання успішно оновлено"
}
```

### GET /teacher/questions
Отримання всіх питань (з можливістю фільтрації)

**Query Parameters:**
- `subject` (optional) - фільтр по предмету

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "q-123",
      "text": "Яке значення має вираз 2 + 3 × 4?",
      "options": ["14", "20", "10", "24"],
      "correct_answer": 0,
      "difficulty": "medium",
      "subject": "Математика",
      "created_at": "2024-01-01T00:00:00Z",
      "times_used": 45,
      "success_rate": 68
    }
  ]
}
```

### DELETE /teacher/questions/:questionId
Видалення питання

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Питання успішно видалено"
}
```

### GET /teacher/students
Отримання статистики по всім студентам

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "email": "student1@example.com",
      "name": "Іван Петренко",
      "vark_type": "visual",
      "tests_completed": 8,
      "average_score": 82,
      "last_test_date": "2024-01-15T14:30:00Z"
    },
    {
      "email": "student2@example.com",
      "name": "Марія Коваленко",
      "vark_type": "kinesthetic",
      "tests_completed": 12,
      "average_score": 91,
      "last_test_date": "2024-01-16T10:15:00Z"
    }
  ]
}
```

---

## Обробка помилок

Всі ендпоінти повинні повертати помилки у такому форматі:

```json
{
  "success": false,
  "error": "Опис помилки"
}
```

**HTTP статус коди:**
- 200 - Успішно
- 400 - Невірний запит (validation error)
- 401 - Не авторизований (для ендпоінтів викладача)
- 404 - Не знайдено
- 500 - Серверна помилка

---

## Структура бази даних (рекомендована)

### Таблиця: users
```sql
id (UUID, PK)
email (VARCHAR, UNIQUE)
password_hash (VARCHAR)
role (ENUM: 'student', 'teacher')
name (VARCHAR, nullable)
vark_type (ENUM: 'visual', 'auditory', 'read_write', 'kinesthetic', nullable)
created_at (TIMESTAMP)
```

### Таблиця: vark_results
```sql
id (UUID, PK)
email (VARCHAR, FK -> users.email)
visual (INTEGER)
auditory (INTEGER)
read_write (INTEGER)
kinesthetic (INTEGER)
vark_type (ENUM)
completed_at (TIMESTAMP)
```

### Таблиця: subjects
```sql
id (VARCHAR, PK)
name (VARCHAR)
description (TEXT, nullable)
```

### Таблиця: questions
```sql
id (VARCHAR, PK)
text (TEXT)
options (JSON) -- array of strings
correct_answer (INTEGER)
difficulty (ENUM: 'easy', 'medium', 'hard')
subject (VARCHAR, FK -> subjects.id)
created_at (TIMESTAMP)
```

### Таблиця: test_sessions
```sql
id (UUID, PK)
email (VARCHAR, FK -> users.email)
subject_id (VARCHAR, FK -> subjects.id)
started_at (TIMESTAMP)
completed_at (TIMESTAMP, nullable)
score (INTEGER, nullable)
questions_answered (INTEGER)
```

### Таблиця: answers
```sql
id (UUID, PK)
session_id (UUID, FK -> test_sessions.id)
question_id (VARCHAR, FK -> questions.id)
answer (INTEGER)
is_correct (BOOLEAN)
time_spent (INTEGER) -- milliseconds
answered_at (TIMESTAMP)
```

---

## Вигадані дані, яких не вистачало:

1. **Структура відповіді для GET /test/subjects** - додано поля `id`, `name`, `description`, `questions_count`
2. **Session ID** - додано у відповідь POST /test/start для відстеження сесії
3. **Поле `completed`** у відповіді POST /test/submit-answer - для визначення завершення тесту
4. **Поля статистики** в GET /teacher/questions - `times_used`, `success_rate`
5. **Поле `name`** у GET /teacher/students - ім'я студента
6. **Ендпоінт GET /vark/user-result** - для перевірки чи користувач вже проходив VARK тест

---

## Не реалізований функціонал:

1. **Відновлення паролю** - немає ендпоінтів для reset password
2. **Профіль користувача** - немає можливості редагувати дані профілю (ім'я, аватар тощо)
3. **Детальна аналітика для викладача** - графіки, тренди, порівняння студентів
4. **Експорт даних** - експорт результатів у CSV/Excel
5. **Нотифікації** - повідомлення про нові тести, результати тощо
6. **Тайм-ліміти для тестів** - обмеження часу на проходження
7. **Категорії складності питань** - більш детальна градація складності
8. **Мультимедіа в питаннях** - зображення, відео, аудіо у питаннях
9. **Командні/групові тести** - можливість створювати тести для груп
10. **Рейтингова система** - таблиця лідерів, досягнення, бейджі
11. **API для bulk операцій** - масове завантаження питань
12. **Версіонування питань** - історія змін питань
13. **Коментарі до питань** - можливість залишати відгуки
14. **A/B тестування** - тестування різних версій питань
15. **Інтеграція з LMS** - експорт/імпорт в SCORM, xAPI тощо
