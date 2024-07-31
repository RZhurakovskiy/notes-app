const addButton = document.getElementById("add");
const notification = document.getElementById('notification');
const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];

const showNotification = (message) => {
  notification.textContent = message;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
};

const updateLocalStorage = () => {
  const noteElements = document.querySelectorAll(".note");
  const notes = [];

  noteElements.forEach((note) => {
    const textArea = note.querySelector("textarea");
    const { left, top, width, height } = note.style;
    notes.push({
      text: textArea.value,
      left: left || "0px",
      top: top || "0px",
      width: width || "200px",
      height: height || "150px"
    });
  });

  localStorage.setItem("notes", JSON.stringify(notes));
};

const addNewNote = (text = "", left = "0px", top = "0px", width = "200px", height = "150px") => {
  const note = document.createElement("div");
  note.classList.add("note");
  note.style.position = 'absolute';
  note.style.left = left;
  note.style.top = top;
  note.style.width = width;
  note.style.height = height;

  note.innerHTML = `
    <div class="tools">
      <button class="edit"><i class="fas fa-edit"></i></button>
      <button class="delete"><i class="fas fa-trash-alt"></i></button>
      <button class="save"><i class="fas fa-save"></i></button>
      <button class="maximize"><i class="fas fa-expand"></i></button>
    </div>
    <div class="main ${text ? "" : "hidden"}"></div>
    <textarea class="${text ? "hidden" : ""}"></textarea>
    <div class="resize-handle"></div>`;

  const editButton = note.querySelector(".edit");
  const deleteButton = note.querySelector(".delete");
  const saveButton = note.querySelector(".save");
  const maximizeButton = note.querySelector(".maximize");
  const main = note.querySelector(".main");
  const textArea = note.querySelector("textarea");
  textArea.value = text;
  main.innerHTML = marked(text);

  deleteButton.addEventListener("click", () => {
    note.remove();
    updateLocalStorage();
    showNotification('Заметка удалена');
  });

  editButton.addEventListener("click", () => {
    main.classList.toggle("hidden");
    textArea.classList.toggle("hidden");
  });

  saveButton.addEventListener("click", () => {
    main.innerHTML = marked(textArea.value);
    main.classList.remove("hidden");
    textArea.classList.add("hidden");
    updateLocalStorage();
    showNotification('Заметка сохранена');
  });

  let isMaximized = false;
  const originalSize = { width, height, left, top };

  maximizeButton.addEventListener("click", () => {
    if (isMaximized) {
      note.style.width = originalSize.width;
      note.style.height = originalSize.height;
      note.style.left = originalSize.left;
      note.style.top = originalSize.top;
      maximizeButton.innerHTML = '<i class="fas fa-expand"></i>';
    } else {
      originalSize.width = note.style.width;
      originalSize.height = note.style.height;
      originalSize.left = note.style.left;
      originalSize.top = note.style.top;
      note.style.width = '100%';
      note.style.height = '100%';
      note.style.left = '0px';
      note.style.top = '0px';
      maximizeButton.innerHTML = '<i class="fas fa-compress"></i>';
    }
    isMaximized = !isMaximized;
    updateLocalStorage();
  });

  note.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('resize-handle')) return;
    const rect = note.getBoundingClientRect();
    const shiftX = e.clientX - rect.left;
	 
    const shiftY = e.clientY - rect.top;

    const onMouseMove = (event) => {
      note.style.left = event.clientX - shiftX + "px";
      note.style.top = event.clientY - shiftY + "px";
    };

    document.addEventListener('mousemove', onMouseMove);

    note.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', onMouseMove);
      updateLocalStorage();
    }, { once: true });
  });

  const resizeHandle = note.querySelector('.resize-handle');

  resizeHandle.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = parseInt(document.defaultView.getComputedStyle(note).width, 10);
    const startHeight = parseInt(document.defaultView.getComputedStyle(note).height, 10);

    const onMouseMove = (event) => {
      note.style.width = startWidth + event.clientX - startX + 'px';
      note.style.height = startHeight + event.clientY - startY + 'px';
    };

    document.addEventListener('mousemove', onMouseMove);

    note.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', onMouseMove);
      updateLocalStorage();
    }, { once: true });
  });

  note.addEventListener('dragstart', () => false);

  document.body.appendChild(note);
};

addButton.addEventListener("click", () => addNewNote());

if (savedNotes) {
  savedNotes.forEach(({ text, left, top, width, height }) => addNewNote(text, left, top, width, height));
}
