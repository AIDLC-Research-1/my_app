'use strict';

/*
 * In-memory TODO store. Each store instance owns its own list and id counter,
 * so a freshly-created store starts empty with ids beginning at 1. Ids are
 * never reused, even after a todo is removed.
 */
function createTodoStore() {
  let todos = [];
  let nextId = 1;

  return {
    list() {
      return todos;
    },
    add(task) {
      const todo = { id: nextId++, task };
      todos.push(todo);
      return todo;
    },
    remove(id) {
      const index = todos.findIndex((todo) => todo.id === id);
      if (index === -1) {
        return false;
      }
      todos.splice(index, 1);
      return true;
    },
  };
}

module.exports = { createTodoStore };
