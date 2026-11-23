// Barangay Pet Finder - beginner-friendly JavaScript using localStorage
const STORAGE_KEY = "barangayPetReports";
const USERS_STORAGE_KEY = "barangayPetUsers";
const SESSION_KEY = "barangayPetSession";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

const loginScreen = document.getElementById("loginScreen");
const authForm = document.getElementById("authForm");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");
const accountName = document.getElementById("accountName");
const residentAccountsSection = document.getElementById("accounts");
const residentAccountsLink = document.getElementById("residentAccountsLink");
let authMode = "user";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getSession() {
  return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
}

function showWebsite() {
  loginScreen.style.display = "none";
  document.body.classList.add("authenticated");
  const session = getSession();
  accountName.textContent = session
    ? `${session.fullName || session.username} (${session.role})`
    : "";
  const isAdmin = session && session.role === "admin";
  residentAccountsSection.hidden = !isAdmin;
  residentAccountsLink.hidden = !isAdmin;
  if (isAdmin) renderResidentAccounts();
}

function showLogin() {
  loginScreen.style.display = "flex";
  document.body.classList.remove("authenticated");
  accountName.textContent = "";
  residentAccountsSection.hidden = true;
  residentAccountsLink.hidden = true;
  setAuthMode("user");
}

function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll("[data-auth-tab]").forEach(tab => {
    const active = tab.dataset.authTab === mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  const createFields = document.getElementById("createAccountFields");
  const fullName = document.getElementById("fullName");
  const createUsername = document.getElementById("createUsername");
  const authUsername = document.getElementById("authUsername");
  const authPassword = document.getElementById("authPassword");
  const usernameLabel = document.getElementById("usernameLabel");
  const submit = document.getElementById("authSubmit");
  const description = document.getElementById("authDescription");

  loginMessage.textContent = "";
  fullName.value = "";
  createUsername.value = "";
  authUsername.value = "";
  authPassword.value = "";

  if (mode === "create") {
    createFields.hidden = false;
    fullName.required = true;
    createUsername.required = true;
    authUsername.hidden = true;
    usernameLabel.hidden = true;
    authUsername.required = false;
    authPassword.required = true;
    authPassword.minLength = 6;
    submit.textContent = "Create Account";
    description.textContent = "Register as a barangay pet report user.";
  } else {
    createFields.hidden = true;
    fullName.required = false;
    createUsername.required = false;
    authUsername.hidden = false;
    usernameLabel.hidden = false;
    authUsername.required = true;
    authPassword.required = true;
    usernameLabel.textContent = "Username";
    submit.textContent = "Log In";
    description.textContent = mode === "admin"
      ? "Log in with administrator credentials."
      : "Log in with your registered user account.";
  }
  (mode === "create" ? fullName : authUsername).focus();
}

document.querySelectorAll("[data-auth-tab]").forEach(tab => {
  tab.addEventListener("click", () => setAuthMode(tab.dataset.authTab));
});

authForm.addEventListener("submit", event => {
  event.preventDefault();

  if (authMode === "create") {
    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("createUsername").value.trim().toLowerCase();
    const password = document.getElementById("authPassword").value;

    if (!fullName || !username || password.length < 6) {
      loginMessage.textContent = "Complete all fields. Password must have at least 6 characters.";
      return;
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      loginMessage.textContent = "Username may only contain letters, numbers, and underscores.";
      return;
    }

    const users = getUsers();
    if (username === ADMIN_USERNAME || users.some(user => user.username === username)) {
      loginMessage.textContent = "That username is already taken.";
      return;
    }

    users.push({ username, password, fullName, role: "user" });
    saveUsers(users);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username, fullName, role: "user" }));
    showWebsite();
    return;
  }

  const username = document.getElementById("authUsername").value.trim().toLowerCase();
  const password = document.getElementById("authPassword").value;

  if (authMode === "admin") {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        username: "admin",
        fullName: "Administrator",
        role: "admin"
      }));
      showWebsite();
    } else {
      loginMessage.textContent = "Incorrect admin username or password.";
    }
    return;
  }

  const user = getUsers().find(account =>
    account.username === username && account.password === password
  );
  if (user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      username: user.username,
      fullName: user.fullName,
      role: "user"
    }));
    showWebsite();
  } else {
    loginMessage.textContent = "Incorrect username or password.";
  }
});

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
});

const residentCreateForm = document.getElementById("residentCreateForm");
const residentCreateMessage = document.getElementById("residentCreateMessage");
const residentAccountList = document.getElementById("residentAccountList");
const noResidentAccounts = document.getElementById("noResidentAccounts");

function renderResidentAccounts() {
  if (!getSession() || getSession().role !== "admin") return;

  const users = getUsers();
  residentAccountList.innerHTML = "";
  noResidentAccounts.style.display = users.length ? "none" : "block";

  users.slice().reverse().forEach(user => {
    const row = document.createElement("div");
    row.className = "resident-account-row";

    const details = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = user.fullName;
    const username = document.createElement("span");
    username.textContent = `Username: ${user.username}`;
    details.append(name, username);

    const remove = document.createElement("button");
    remove.className = "delete-account-btn";
    remove.type = "button";
    remove.textContent = "Delete Account";
    remove.addEventListener("click", () => {
      if (!confirm(`Delete the account for ${user.fullName}?`)) return;

      saveUsers(getUsers().filter(account => account.username !== user.username));
      residentCreateMessage.textContent = "";
      renderResidentAccounts();
    });

    row.append(details, remove);
    residentAccountList.appendChild(row);
  });
}

residentCreateForm.addEventListener("submit", event => {
  event.preventDefault();

  const session = getSession();
  if (!session || session.role !== "admin") {
    residentCreateMessage.textContent = "Only an administrator can create resident accounts.";
    return;
  }

  const fullName = document.getElementById("residentFullName").value.trim();
  const username = document.getElementById("residentUsername").value.trim().toLowerCase();
  const password = document.getElementById("residentPassword").value;

  if (!fullName || !username || password.length < 6) {
    residentCreateMessage.textContent = "Complete all fields. Password must have at least 6 characters.";
    return;
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    residentCreateMessage.textContent = "Username may only contain letters, numbers, and underscores.";
    return;
  }

  const users = getUsers();
  if (username === ADMIN_USERNAME || users.some(user => user.username === username)) {
    residentCreateMessage.textContent = "That username is already taken.";
    return;
  }

  users.push({ username, password, fullName, role: "user" });
  saveUsers(users);
  residentCreateForm.reset();
  residentCreateMessage.textContent = `Account created. Username: ${username} | Password: ${password}`;
  renderResidentAccounts();
});

if (getSession()) {
  showWebsite();
} else {
  showLogin();
}

const form = document.getElementById("petForm");
const petList = document.getElementById("petList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");

function getReports() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function renderReports() {
  const reports = getReports();
  const search = searchInput.value.toLowerCase();
  const type = filterType.value;

  document.getElementById("totalCount").textContent = reports.length;
  document.getElementById("lostCount").textContent = reports.filter(p => p.type === "Lost").length;
  document.getElementById("foundCount").textContent = reports.filter(p => p.type === "Found").length;

  const filtered = reports.filter(p => {
    const matchesType = type === "All" || p.type === type;
    const searchable = `${p.name} ${p.animal} ${p.color} ${p.location} ${p.breed}`.toLowerCase();
    return matchesType && searchable.includes(search);
  });

  petList.innerHTML = "";
  emptyState.style.display = filtered.length ? "none" : "block";

  filtered.slice().reverse().forEach(pet => {
    const card = document.createElement("article");
    card.className = "pet-card";

    // textContent is used for user-submitted values to avoid inserting HTML.
    const top = document.createElement("div");
    top.className = "pet-card-top";
    const heading = document.createElement("h3");
    heading.textContent = `${pet.animal} · ${pet.name || "Unnamed pet"}`;
    const tag = document.createElement("span");
    tag.className = `tag ${pet.type === "Found" ? "found" : ""}`;
    tag.textContent = `${pet.type} Pet`;
    top.append(heading, tag);

    const description = document.createElement("p");
    description.textContent = `${pet.breed || "No breed provided"} · ${pet.color} · ${pet.date}`;
    const place = document.createElement("p");
    place.textContent = `📍 ${pet.location}`;
    const details = document.createElement("p");
    details.textContent = pet.details || "No additional details.";
    const contact = document.createElement("p");
    contact.className = "contact";
    contact.textContent = `Contact: ${pet.contact}`;

    const remove = document.createElement("button");
    const session = getSession();
    if (session && session.role === "admin") {
      remove.className = "delete-btn";
      remove.textContent = "Delete this report";
      remove.type = "button";
      remove.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this report?")) {
          saveReports(getReports().filter(item => item.id !== pet.id));
          renderReports();
        }
      });
    }

    card.append(top, description, place, details, contact);
    if (session && session.role === "admin") {
      card.appendChild(remove);
    }
    petList.appendChild(card);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const report = {
    id: Date.now(),
    submittedBy: getSession() ? getSession().fullName : "Unknown",
    type: document.getElementById("reportType").value,
    name: document.getElementById("petName").value.trim(),
    animal: document.getElementById("animal").value,
    breed: document.getElementById("breed").value.trim(),
    color: document.getElementById("color").value.trim(),
    location: document.getElementById("location").value.trim(),
    date: document.getElementById("date").value,
    contact: document.getElementById("contact").value.trim(),
    details: document.getElementById("details").value.trim()
  };

  const reports = getReports();
  reports.push(report);
  saveReports(reports);
  form.reset();
  document.getElementById("formMessage").textContent = "Your pet report has been posted successfully!";
  renderReports();
});

searchInput.addEventListener("input", renderReports);
filterType.addEventListener("change", renderReports);

// Display previously saved reports when the page opens.
renderReports();
