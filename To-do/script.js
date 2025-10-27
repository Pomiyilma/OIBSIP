document.addEventListener('DOMContentLoaded', () => {

  const taskInput = document.getElementById('task-input');
  const addTaskButton = document.getElementById('add-task-button');
  const taskList = document.getElementById('task-list');
  const emptyImage = document.querySelector('.empty-image');
  const todosContainer = document.querySelector('.todos-container');

  const toggleEmptyState = () => {
    const isEmptyList = taskList.children.length === 0;

    emptyImage.style.display = isEmptyList ? 'block' : 'none';
    todosContainer.style.width = isEmptyList ? '50%' : '100%';
    todosContainer.style.margin = isEmptyList ? '0 auto' : '0';

    // todosContainer.style.display = isEmptyList ? 'flex' : 'block';
    // todosContainer.style.justifyContent = isEmptyList ? 'center' : 'initial';
    // todosContainer.style.alignItems = isEmptyList ? 'center' : 'initial';
  };

  const addTask = (text, completed = false) => {
    const taskText = text || taskInput.value.trim();
    if (!taskText) {
      return;
    }
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''} />
      <span>${taskText}</span>
      <div class="task-buttons">
        <button class="edit-button"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-button"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    const checkbox = li.querySelector('.checkbox');
    const editButton = li.querySelector('.edit-button');
    const taskSpan = li.querySelector('span');

    if (completed) {
      li.classList.add('completed');
      editButton.disabled = true;
      editButton.style.opacity = '0.5';
      editButton.style.pointerEvents = 'none';
    }

    checkbox.addEventListener('change', () => {
      const isChecked = checkbox.checked;
      li.classList.toggle('completed', isChecked);
      editButton.disabled = isChecked;
      editButton.style.opacity = isChecked ? '0.5' : '1';
      editButton.style.pointerEvents = isChecked ? 'none' : 'auto';
    });

    editButton.addEventListener('click', () => {
      if (!checkbox.checked) {
        taskInput.value = li.querySelector('span').textContent;
        li.remove();
        toggleEmptyState();
      }
    })

    li.querySelector('.delete-button').addEventListener('click', () => {
      li.remove();
      toggleEmptyState();
    })

    taskList.appendChild(li);
    taskInput.value = '';

    toggleEmptyState();
  };

  addTaskButton.addEventListener('click', () =>  addTask());
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  })
});
