# Лабораторна робота №5 — GraphQL

## Запуск

```bash
npm install
npm start
```

Потім відкрий браузер: http://localhost:4000/

## Приклад запиту

```graphql
query Todos($projectId: String!) {
  todos(projectId: $projectId) {
    id
    title
    description
    priority
    status
    tags {
      id
      name
      color
    }
    assignees {
      id
      username
      avatarUrl
    }
    createdAt
  }
}
```

Змінні:
```json
{
  "projectId": "test-project"
}
```

## Мутація — створити Todo

```graphql
mutation CreateTodo($projectId: String!, $dto: CreateTodoInput!) {
  createTodo(projectId: $projectId, dto: $dto) {
    id
    title
    priority
    status
    createdAt
  }
}
```

Змінні:
```json
{
  "projectId": "test-project",
  "dto": {
    "title": "Нове завдання",
    "description": "Опис",
    "priority": "high",
    "deadline": "2026-07-01T00:00:00.000Z"
  }
}
```
