document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const usernameDisplay = document.getElementById("usernameDisplay");
  const logoutButton = document.getElementById("logoutButton");
  const createNoteForm = document.getElementById("createNoteForm");
  const notesContainer = document.getElementById("notesContainer");
  const noteFormErrorP = document.getElementById("noteFormError");

  if (!token || !user) {
    window.location.href = "login.html";
    return;
  }

  if (usernameDisplay) usernameDisplay.textContent = user.username || "User";

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  }

  async function fetchAndDisplayNotes() {
    if (!notesContainer) return;
    notesContainer.innerHTML = "<p>Loading notes...</p>";
    try {
      const notes = await request("/notes", "GET", null, token);
      if (notes && notes.length > 0) {
        notesContainer.innerHTML = "";
        notes.forEach((note) => {
          const noteElement = document.createElement("div");
          noteElement.classList.add("note-item");
          noteElement.innerHTML = `
                        <h3>${escapeHTML(note.title)}</h3>
                        <p>${escapeHTML(note.content || "")}</p>
                        <small>Created: ${new Date(
                          note.created_at
                        ).toLocaleString()}</small>
                        <button class="delete-button" data-note-id="${
                          note.note_id
                        }">Delete</button>
                    `;
          notesContainer.appendChild(noteElement);
        });

        document.querySelectorAll(".delete-button").forEach((button) => {
          button.addEventListener("click", async (e) => {
            const noteId = e.target.dataset.noteId;
            if (confirm("Are you sure you want to delete this note?")) {
              try {
                await request(`/notes/${noteId}`, "DELETE", null, token);
                fetchAndDisplayNotes();
              } catch (error) {
                alert("Failed to delete note: " + error.message);
              }
            }
          });
        });
      } else {
        notesContainer.innerHTML = "<p>No notes found. Create one!</p>";
      }
    } catch (error) {
      notesContainer.innerHTML = `<p class="error-message">Error loading notes: ${error.message}</p>`;
    }
  }

  if (createNoteForm) {
    createNoteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (noteFormErrorP) noteFormErrorP.textContent = "";
      const titleInput = document.getElementById("noteTitle");
      const contentInput = document.getElementById("noteContent");
      const title = titleInput.value;
      const content = contentInput.value;

      if (!title.trim()) {
        if (noteFormErrorP) noteFormErrorP.textContent = "Title is required.";
        return;
      }

      try {
        await request("/notes", "POST", { title, content }, token);
        createNoteForm.reset();
        fetchAndDisplayNotes();
      } catch (error) {
        if (noteFormErrorP)
          noteFormErrorP.textContent =
            "Failed to create note: " + error.message;
      }
    });
  }

  if (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/index.htm")
  ) {
    fetchAndDisplayNotes();
  }
});

function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      }[tag] || tag)
  );
}
