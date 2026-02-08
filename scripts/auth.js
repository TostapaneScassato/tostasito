async function login(username, password) {
   const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ username, password})
   });

   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Login fallito");
   return data.success;
}

async function logout() {
   const res = await fetch("/api/logout", {method: "POST"});
   return res.ok;
}

async function register(username, password) {
   const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ username, password})
   });

   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Login fallito");
   return data.success;
}

async function confirmPassword(password) {
   const res = await fetch("/api/confirm-password", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ password})
   });

   if (!res.ok) return false;

   const data = await res.json();
   return data.valid === true;
}

async function modifyAccount(data) {
   const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(data)
   })

   const text = await res.text();

   let json;
   try {
      json = JSON.parse(text);
   } catch {
      throw new Error("Server response is not JSON: " + text);
   }

   if (!res.ok) throw new Error(json.error || "Errore");
   return json;
}

const loginForm = document.querySelector(".loginForm");

if (loginForm) {
   loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(loginForm);
      const usernameOrEmail = formData.get("user_email");
      const password = formData.get("user_password");

      try {
         const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
               usernameOrEmail: usernameOrEmail,
               password: password
            })
         });

         const data = await res.json();

         if (!res.ok) {
            alert(data.error || "Login error");
            return;
         }

         window.location.href = "/";
      } catch (err) {
         console.error(err);
         alert("Network error");
      }
   });
}

const registerForm = document.querySelector(".registerForm");

if (registerForm) {
   registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(registerForm);
      const username = formData.get("user_new_name");
      const email = formData.get("user_new_email");
      const password = formData.get("user_new_password");
      const confPassword = formData.get("user_confirm_password");

      if (password != confPassword) {
         alert("The two passwords must be eqal!");
         return;
      }

      try {
         const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
               username: username,
               email: email,
               password: password
            })
         });

         const data = await res.json();

         if (!res.ok) {
            alert(data.error || "Registering error");
            return;
         }

         window.location.href = "/";
      } catch (err) {
         console.error(err);
         alert("Network error");
      }
   });
}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) logoutButton.addEventListener("click", () => {
   logout();
   
   window.location.href = "/home";
})

const modifyAccountForm = document.querySelector("#change-account-form");
if (modifyAccountForm) {
   modifyAccountForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(modifyAccountForm);
      const currentPassword = formData.get("confirmPassword");
      const newUsername = formData.get("newUsername");
      const newEmail = formData.get("newEmail");
      const newPassword = formData.get("newPassword");

      try {
         const procede = await confirmPassword(currentPassword);

         if (!procede) { 
            alert("Password errata!");
            return;
         }

         const updates = {};
         if (newUsername) updates.username = newUsername;
         if (newEmail)    updates.email    = newEmail;
         if (newPassword) updates.password = newPassword;

         if (Object.keys(updates).length === 0) {
            alert("Inserisci almeno l'username o la password");
            return;
         } 

         await modifyAccount(updates);

         modifyAccountForm.reset();

         modifyAccountOverlay.classList.add("hidden");

         window.location.reload();
      } catch (err) {
         console.error(err);
         alert(err.message || "Errore nella modifica dell'account")
      }
   });
}

const modifyAccountOverlay = document.getElementById("changeAccountInfo");

document.getElementById("modifyAccountButton")?.addEventListener("click", e => {
   e.preventDefault();
   modifyAccountOverlay.classList.remove("hidden");
})

document.getElementById("cancelAccountInfo")?.addEventListener("click", e => {
   e.preventDefault();

   document.getElementById("changeConfirmPassword").value = "";
   document.getElementById("changeAccountName").value = "";
   document.getElementById("changeAccountEmail").valid = "";
   document.getElementById("changePassword").value = "";

   modifyAccountOverlay.classList.add("hidden");
})
/*
document.getElementById("saveAccountInfo")?.addEventListener("click", e => {
   e.preventDefault();

   document.getElementById("changeConfirmPassword").value = "";
   document.getElementById("changeAccountName").value = "";
   document.getElementById("changePassword").value = "";

   modifyAccountOverlay.classList.add("hidden");
})*/