const http = require('http');
const url = require('url');

// ===== ДАНІ =====
const todos = [
  {
    id: 'f6021b16-853f-4a60-8630-ca8d0b18901b',
    title: 'Додати функціонал сповіщень',
    description: 'Додати або вебсокети, або SSE',
    priority: 'high',
    status: 'pending',
    deadline: '2026-06-01T00:00:00.000Z',
    createdAt: '2026-05-10T10:10:25.029Z',
    tagIds: ['83eb60fe-9b76-4649-a341-63550e814c22'],
    assigneeIds: ['e8d38637-72e5-475d-aa6e-7855710b2473'],
  },
  {
    id: '9930acc0-bfc8-440e-ac81-2530cad8c1de',
    title: 'ggdgd',
    description: 'gfdgfdgdfgd',
    priority: 'medium',
    status: 'pending',
    deadline: '2026-06-15T00:00:00.000Z',
    createdAt: '2026-05-10T10:11:10.035Z',
    tagIds: ['83eb60fe-9b76-4649-a341-63550e814c22'],
    assigneeIds: ['e8d38637-72e5-475d-aa6e-7855710b2473'],
  },
  {
    id: '2e624c47-00e7-4958-aa75-1bcd427120d7',
    title: 'hghgfhgfh',
    description: '',
    priority: 'low',
    status: 'pending',
    deadline: '2026-07-01T00:00:00.000Z',
    createdAt: '2026-05-13T09:41:40.574Z',
    tagIds: ['83eb60fe-9b76-4649-a341-63550e814c22'],
    assigneeIds: ['e8d38637-72e5-475d-aa6e-7855710b2473'],
  },
];

const tags = [
  { id: '83eb60fe-9b76-4649-a341-63550e814c22', name: 'API', color: 'bg-violet-500' },
];

const users = [
  { id: 'e8d38637-72e5-475d-aa6e-7855710b2473', username: 'hermaeusmora', avatarUrl: 'https://avatars.githubusercontent.com/u/227030869?v=4' },
];

// ===== GraphQL обробка =====
function executeTodos({ projectId }) {
  return todos.map(t => ({
    ...t,
    tags: tags.filter(tag => t.tagIds.includes(tag.id)),
    assignees: users.filter(u => t.assigneeIds.includes(u.id)),
  }));
}

function executeGetTodoById({ id }) {
  const t = todos.find(t => t.id === id);
  if (!t) return null;
  return { ...t, tags: tags.filter(tag => t.tagIds.includes(tag.id)), assignees: users.filter(u => t.assigneeIds.includes(u.id)) };
}

function executeCreateTodo({ projectId, dto }) {
  const newTodo = {
    id: Math.random().toString(36).slice(2),
    title: dto.title,
    description: dto.description || '',
    priority: dto.priority || 'low',
    status: dto.status || 'pending',
    deadline: dto.deadline,
    createdAt: new Date().toISOString(),
    tagIds: [],
    assigneeIds: [],
  };
  todos.push(newTodo);
  return { ...newTodo, tags: [], assignees: [] };
}

function executeDeleteTodo({ id }) {
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return null;
  const [deleted] = todos.splice(index, 1);
  return { ...deleted, tags: [], assignees: [] };
}

// ===== GraphQL виконання =====
const { graphql, buildSchema } = require('graphql');

const schema = buildSchema(`
  enum Priority { low medium high }
  enum TodoStatus { pending in_progress done }

  type Tag { id: String! name: String! color: String! }
  type User { id: String! username: String! avatarUrl: String }
  type Todo {
    id: String! title: String! description: String
    priority: Priority! status: TodoStatus!
    deadline: String! createdAt: String!
    tags: [Tag!]! assignees: [User!]!
  }
  input CreateTodoInput {
    title: String! description: String
    priority: Priority status: TodoStatus deadline: String!
  }
  type Query {
    todos(projectId: String!): [Todo!]!
    getTodoById(id: String!): Todo
  }
  type Mutation {
    createTodo(projectId: String!, dto: CreateTodoInput!): Todo!
    deleteTodo(id: String!): Todo
  }
`);

const root = {
  todos: ({ projectId }) => executeTodos({ projectId }),
  getTodoById: ({ id }) => executeGetTodoById({ id }),
  createTodo: ({ projectId, dto }) => executeCreateTodo({ projectId, dto }),
  deleteTodo: ({ id }) => executeDeleteTodo({ id }),
};

// ===== Playground HTML =====
const playgroundHTML = `<!DOCTYPE html>
<html>
<head>
  <title>GraphQL Playground — ЛР №5</title>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; background: #1a1a2e; color: #e0e0e0; height: 100vh; display: flex; flex-direction: column; }
    h1 { background: #16213e; padding: 12px 20px; font-size: 16px; color: #00d4ff; border-bottom: 1px solid #0f3460; }
    .container { display: flex; flex: 1; overflow: hidden; }
    .panel { display: flex; flex-direction: column; flex: 1; padding: 12px; gap: 8px; }
    label { font-size: 12px; color: #888; }
    textarea { background: #0d1117; color: #c9d1d9; border: 1px solid #30363d; border-radius: 6px; padding: 10px; font-family: monospace; font-size: 13px; resize: vertical; flex: 1; }
    #variables { height: 100px; flex: none; }
    button { background: #00d4ff; color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; }
    button:hover { background: #00b8d9; }
    #result { background: #0d1117; color: #c9d1d9; border: 1px solid #30363d; border-radius: 6px; padding: 10px; font-family: monospace; font-size: 13px; flex: 1; overflow: auto; white-space: pre; }
    .divider { width: 4px; background: #30363d; cursor: col-resize; }
  </style>
</head>
<body>
  <h1>🚀 GraphQL Playground — Лабораторна робота №5</h1>
  <div class="container">
    <div class="panel">
      <label>Запит (Query / Mutation)</label>
      <textarea id="query">query Todos($projectId: String!) {
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
}</textarea>
      <label>Змінні (Variables)</label>
      <textarea id="variables">{
  "projectId": "test-project"
}</textarea>
      <button onclick="runQuery()">▶ Виконати запит</button>
    </div>
    <div class="divider"></div>
    <div class="panel">
      <label>Результат</label>
      <div id="result">Натисни "Виконати запит" щоб побачити результат...</div>
    </div>
  </div>
  <script>
    async function runQuery() {
      const query = document.getElementById('query').value;
      const varsText = document.getElementById('variables').value.trim();
      let variables = {};
      try { if (varsText) variables = JSON.parse(varsText); } catch(e) { document.getElementById('result').textContent = 'Помилка в JSON змінних: ' + e.message; return; }
      document.getElementById('result').textContent = 'Завантаження...';
      try {
        const res = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables })
        });
        const data = await res.json();
        document.getElementById('result').textContent = JSON.stringify(data, null, 2);
      } catch(e) {
        document.getElementById('result').textContent = 'Помилка: ' + e.message;
      }
    }
  </script>
</body>
</html>`;

// ===== HTTP СЕРВЕР =====
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // Playground
  if (req.method === 'GET' && (parsedUrl.pathname === '/' || parsedUrl.pathname === '/graphql')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(playgroundHTML);
    return;
  }

  // GraphQL endpoint
  if (req.method === 'POST' && parsedUrl.pathname === '/graphql') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { query, variables } = JSON.parse(body);
        const result = await graphql({ schema, source: query, rootValue: root, variableValues: variables });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch(e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ errors: [{ message: e.message }] }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(4000, () => {
  console.log('');
  console.log('✅ GraphQL сервер запущено!');
  console.log('🚀 Відкрий браузер: http://localhost:4000/');
  console.log('');
});
