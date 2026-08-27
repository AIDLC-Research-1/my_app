'use strict';

/*
 * TODO App front-end.
 *
 * A small React application that provides a landing page and forms for
 * exercising the TODO REST API served by this same Express app:
 *
 *   GET    /todos        list todos
 *   POST   /todos        add a todo    ({ "task": "..." })
 *   DELETE /todos/:id    delete a todo
 *
 * React, ReactDOM and htm are loaded as global UMD builds from ./vendor, so no
 * build step is required. htm (https://github.com/developit/htm) binds tagged
 * template literals to React.createElement, giving JSX-like syntax in plain JS.
 */

const { useState, useEffect, useCallback } = React;
const html = htm.bind(React.createElement);

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/todos');
      if (!res.ok) {
        throw new Error('Failed to load todos (' + res.status + ')');
      }
      setTodos(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const addTodo = async (event) => {
    event.preventDefault();
    const trimmed = task.trim();
    if (!trimmed) {
      setError('Please enter a task before adding.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to add todo');
      }
      const created = await res.json();
      setTodos((current) => [...current, created]);
      setTask('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTodo = async (id) => {
    setError('');
    try {
      const res = await fetch('/todos/' + id, { method: 'DELETE' });
      if (res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to delete todo');
      }
      setTodos((current) => current.filter((todo) => todo.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return html`
    <div className="app">
      <header className="hero">
        <h1 className="hero__title">📝 TODO App</h1>
        <p className="hero__subtitle">
          A tiny React interface for the TODO REST API. Add tasks, review your
          list, and remove the ones you have finished.
        </p>
      </header>

      <main className="panel">
        <section aria-labelledby="add-heading">
          <h2 id="add-heading" className="panel__heading">Add a task</h2>
          <form className="todo-form" onSubmit=${addTodo}>
            <label className="visually-hidden" htmlFor="task-input">Task</label>
            <input
              id="task-input"
              className="todo-form__input"
              type="text"
              placeholder="e.g. Buy groceries"
              value=${task}
              onChange=${(event) => setTask(event.target.value)}
              disabled=${submitting}
            />
            <button
              className="todo-form__button"
              type="submit"
              disabled=${submitting}
            >
              ${submitting ? 'Adding…' : 'Add'}
            </button>
          </form>
        </section>

        ${error && html`<p className="alert" role="alert">${error}</p>`}

        <section aria-labelledby="list-heading">
          <div className="panel__list-header">
            <h2 id="list-heading" className="panel__heading">Your tasks</h2>
            <button
              className="link-button"
              type="button"
              onClick=${loadTodos}
              disabled=${loading}
            >
              Refresh
            </button>
          </div>

          ${loading
            ? html`<p className="muted">Loading…</p>`
            : todos.length === 0
              ? html`<p className="muted">No tasks yet. Add your first one above!</p>`
              : html`
                  <ul className="todo-list">
                    ${todos.map(
                      (todo) => html`
                        <li className="todo-list__item" key=${todo.id}>
                          <span className="todo-list__task">${todo.task}</span>
                          <button
                            className="todo-list__delete"
                            type="button"
                            aria-label=${'Delete ' + todo.task}
                            onClick=${() => deleteTodo(todo.id)}
                          >
                            Delete
                          </button>
                        </li>
                      `
                    )}
                  </ul>
                `}
        </section>
      </main>

      <footer className="footer">
        <p>
          Powered by the same Express server that hosts the API —
          <code>GET/POST /todos</code> and <code>DELETE /todos/:id</code>.
        </p>
      </footer>
    </div>
  `;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
