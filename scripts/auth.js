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


const loginForm = document.querySelector(".loginForm");

if (loginForm) {
   loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(loginForm);
      const username = formData.get("user_email");
      const password = formData.get("user_password");

      try {
         const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
               username: username,
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
      const username = formData.get("user_new_email");
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
   
   setTimeout(window.location.href = "/login", 200);
})