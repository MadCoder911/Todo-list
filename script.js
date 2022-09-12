"use strict";

////////////////////////////////////////////////////
// HTML SELECTORS
const username = document.querySelector(".name");
const inputContent = document.querySelector(".content");
const todoList = document.querySelector(".insertionList");
const list = document.querySelector(".todo-list");
const addBtn = document.querySelector(".button");
const title = document.querySelector(".title");
const mainApp = document.querySelector(".app");
const businessBubble = document.getElementById("category1");
const personalBubble = document.getElementById("category2");
const nameInput = document.querySelector("#name");
const modal = document.querySelector(".box-modal");
const overlay = document.querySelector(".overlay");
////////////////////////////////////////////////////
// Todo object
class Todo {
  id = (Date.now() + "").slice(-9);

  constructor(inputValue, isChecked, isEditable, type) {
    this.inputValue = inputValue;
    this.isChecked = isChecked;
    this.isEditable = isEditable;
    this.type = type;
  }
}

////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
class App {
  #todos = [];

  constructor() {
    // Load username from local storage
    this._setUserName();
    // Load todos from local storage
    this._getLocalStorage();
    // Resetting editability of object on reloading page
    this._resetObjectsState();
    // Attaching event handlers
    addBtn.addEventListener("click", this._newTodo.bind(this));
    list.addEventListener("click", this._dashed.bind(this));
    list.addEventListener("click", this._deleteTodo.bind(this));
    list.addEventListener("click", this._editTodo.bind(this));
    username.addEventListener("input", this._getUsername.bind(this));
    overlay.addEventListener("click", this._closeModal.bind(this));
    modal.addEventListener("click", this._closeModal.bind(this));
  }
  //////////////////////////////////////////////////
  // METHODS
  _newTodo() {
    let isEditable = "false";
    let isChecked = "false";
    let content;
    let todo;
    let type;
    // Content input validation
    if (inputContent.value === "") {
      return this._displayErrormsg();
    } else content = inputContent.value;
    // Checking type
    if (businessBubble.checked) {
      type = "business";
    } else if (personalBubble.checked) {
      type = "personal";
    } else {
      return this._displayErrormsg();
    }

    todo = new Todo(content, isChecked, isEditable, type);
    //Saving to local storage
    this._setLocalStorage();
    // Resetting input fields
    this._resetInputFields();
    //adding todo to todos arrray
    this.#todos.push(todo);
    //Pushing the todo on the page
    this._pushTodo(todo);
    //Updating storage
    this._setLocalStorage();
  }

  // Pushing todos from array into HTML lists
  _pushTodo(todo) {
    let html = `<div class="todo-item ${
      todo.isChecked === "true" ? "done" : ""
    }"  id="tod" data-id="${todo.id}">
    <label>
      <input type="checkbox" ${
        todo.isChecked === "true" ? "checked" : ""
      } id="${todo.id}" class="bubbleSelect" />
      <span class="bubble ${todo.type}"></span>
    </label>
    <div class="todo-content">
      <input type="text" class="editValue"value="${todo.inputValue}" id="${
      todo.id
    }" readonly />
    </div>
    <div class="actions">
      <button class="edit" data-id="${todo.id}">Edit</button>
      <button class="delete" data-id="${todo.id}">Delete</button>
    </div>
  </div>`;
    todoList.insertAdjacentHTML("afterend", html);
  }

  // Deleting a todo
  _deleteTodo(e) {
    const delBtn = e.target.closest(".delete"); // Getting the delete button
    const todoItem = e.target.closest(".todo-item"); // The item we want to delete
    if (!delBtn) return;
    const todo = this.#todos.find((e) => e.id === delBtn.dataset.id); // The object
    const todoIndex = this.#todos.findIndex((e) => e.id === todo.id); // Object index

    todoItem.style.dsplay = "none";
    this.#todos.splice(todoIndex, 1); // Removing it from #todos array
    this._setLocalStorage(); // Refreshing local storage
    location.reload(); // Reloading the page
  }

  // Setting local storage
  _setLocalStorage() {
    localStorage.setItem("todos", JSON.stringify(this.#todos));
  }

  // Resetting input fields after adding a new todo
  _resetInputFields() {
    inputContent.value = "";
    if (businessBubble.checked || personalBubble.checked) {
      businessBubble.checked = false;
      personalBubble.checked = false;
    }
  }

  // Putting lines through todo when it's selected
  _dashed(e) {
    const bubble = e.target.closest(".bubbleSelect");
    if (!bubble) return;
    const todoItem = e.target.closest("#tod");
    let dashedTodo = this.#todos.find((x) => x.id === bubble.id);
    if (!dashedTodo) return;

    if (bubble.checked) {
      todoItem.classList.add("done");
      dashedTodo.isChecked = "true";
    } else {
      todoItem.classList.remove("done");
      dashedTodo.isChecked = "false";
    }
    this._setLocalStorage();
  }

  // Getting data from local storage
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("todos"));

    if (!data) return;
    this.#todos = data;
    this.#todos.forEach((todo) => {
      this._pushTodo(todo);
    });
  }

  // Edit todo
  _editTodo(e) {
    let editBtn = e.target.closest(".edit"); // The btn
    if (!editBtn) return;
    let inputField =
      editBtn.parentElement.parentElement.querySelector(".editValue");
    let todoItem = e.target.closest(".todo-item"); // The whole item HTML code
    let editableTodo = this.#todos.findIndex(
      (e) => e.id === todoItem.dataset.id
    ); //The object

    if (this.#todos[editableTodo].isEditable === "false") {
      this.#todos[editableTodo].isEditable = "true";
      // Setting attributes of edit button when edit is true
      inputField.removeAttribute("readonly");
      editBtn.style.backgroundColor = "#0DCA00";
      editBtn.textContent = "Save";
      inputField.focus();
    } else if (this.#todos[editableTodo].isEditable === "true") {
      this.#todos[editableTodo].isEditable = "false";
      // Setting attributes of edit button when edit is false
      inputField.setAttribute("readonly", true);
      editBtn.style.backgroundColor = "#ff9100";
      editBtn.textContent = "Edit";
      // Changing the value to the new one after clicking save
      this.#todos[editableTodo].inputValue = inputField.value;
    }
    this._setLocalStorage();
  }

  // Getting username from the user, and saving it to local storage
  _getUsername(e) {
    let username = e.target.closest(".name").value;
    localStorage.setItem("username", JSON.stringify(username));
  }

  // Setting username from local storage
  _setUserName() {
    let username = JSON.parse(localStorage.getItem("username"));
    if (username === null) return;
    document.querySelector(".name").setAttribute("value", `${username}`);
  }

  // Resetting editability of object on reloading page
  _resetObjectsState() {
    this.#todos.forEach((object) => {
      object.isEditable = "false";
    });
    this._setLocalStorage();
  }

  // Error message
  _displayErrormsg() {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }

  // Closing error modal
  _closeModal() {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
  }

  // Resetting storage
  reset() {
    localStorage.removeItem("todos");
    location.reload();
  }
}

const app = new App();
