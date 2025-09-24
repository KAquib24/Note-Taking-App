# 📝 Advanced Note-Taking App Plan (REST API + No Redux)

## 1️⃣ Dependencies & DevDependencies

### **Frontend (client) Dependencies**

**Core libraries:**

| Package               | Purpose                             |
|-----------------------|-------------------------------------|
| react                 | UI library                          |
| react-dom             | React DOM renderer                  |
| react-router-dom      | Routing                             |
| axios                 | REST API client                     |
| tailwindcss           | Utility-first CSS framework         |
| postcss               | Required for Tailwind               |
| autoprefixer          | Required for Tailwind               |
| typescript            | TypeScript support                  |
| clsx                  | Optional, for conditional classNames |

**Optional / planned later:**

| Package                   | Purpose                                |
|----------------------------|----------------------------------------|
| react-quill or @tiptap/react | Rich text editor for notes formatting |
| date-fns                   | Date formatting for notes             |
| react-icons                | Icons in the UI                        |
| react-toastify             | Notifications                          |

---

### **Backend (server) Dependencies**

| Package                | Purpose                     |
|------------------------|-----------------------------|
| express                | Web server                  |
| cors                   | Cross-origin requests       |
| mongoose               | MongoDB ODM                 |
| bcryptjs               | Hash passwords              |
| jsonwebtoken           | JWT authentication          |
| dotenv                 | Environment variables       |

**No GraphQL, no Apollo.** REST endpoints will handle all operations.

---

### **Dev Dependencies (Frontend + Backend)**

| Package                     | Purpose                                    |
|------------------------------|--------------------------------------------|
| vite                         | Frontend dev server / build                |
| ts-node                      | Run TS files directly (backend)            |
| nodemon                      | Auto-restart backend server on change     |
| typescript                   | TypeScript compiler                        |
| @types/node                  | Node types for TS                           |
| @types/react                 | React types                                 |
| @types/react-dom             | React DOM types                             |
| @types/react-router-dom      | React Router types                           |
| eslint                        | Linting                                   |
| prettier                      | Code formatting                             |
| eslint-config-prettier        | ESLint + Prettier integration              |
| eslint-plugin-react           | React linting rules                         |
| husky                         | Git hooks for linting/formatting           |

---

## 2️⃣ Features Breakdown

### **Essential Features (MVP – must-have)**

* Create, edit, delete notes (text-based notes) done
* Organize by title and content  done
* Search notes by keywords  done
* Categorization (folders, tags, or labels)  done
* Basic formatting (bold, italic, underline, lists)  done
* Auto-save (avoid losing notes)  done
* Responsive UI (works well on mobile & desktop) done
<!-- * History of Changes future feature -->

---

### **Advanced Features (to stand out)**

* Rich Text Editor: headings, checklists, code blocks, quotes  done(add lowlight alternative later on)
* Attachments: images, PDFs, audio notes  done
<!-- * Voice-to-text notes  future feature  -->
* Reminders & notifications (set deadlines)  done
* Pin important notes to the top done   
* Dark mode / theme customization  done 
* Export notes (PDF, Markdown, TXT)  half done 

---

### **Unique / Next-Level Features**

* Handwriting support (draw/write with a stylus)  done
<!-- * Collaboration: share & edit notes with friends/teams (via REST APIs)  future features  -->
<!-- * Version history: go back to previous edits   future features  -->
* AI-powered features: done 
  * Summarize long notes  
  * Generate action items from meeting notes  
  * Suggest tags automatically 
* Encryption & password protection (for sensitive notes)  done  

---

### **Suggested Development Path**

1. Start with **Essential Features** (MVP) using REST APIs.  
2. Add **Advanced Features** gradually.  
3. Pick 1–2 **Unique Features** to differentiate your app.  

---

**Stack Summary:**  

**Frontend:** React + TypeScript + Tailwind + Axios + React Router  
**Backend:** Express + MongoDB + Mongoose + JWT + Bcrypt  
**State management:** Local state or React Context (no Redux)  
**API style:** REST (no GraphQL, no Apollo)  let start with making login and register 