document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const errorMessageP = document.getElementById("errorMessage");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorMessageP) errorMessageP.textContent = "";
      const emailOrUsername = loginForm.emailOrUsername.value;
      const password = loginForm.password.value;

      try {
        const data = await request("/auth/login", "POST", {
          emailOrUsername,
          password,
        });
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem(
            "user",
            JSON.stringify({ username: data.username, userId: data.user_id })
          );
          window.location.href = "index.html";
        }
      } catch (error) {
        if (errorMessageP)
          errorMessageP.textContent = error.message || "Login failed.";
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorMessageP) errorMessageP.textContent = "";
      const username = registerForm.username.value;
      const email = registerForm.email.value;
      const password = registerForm.password.value;

      try {
        const data = await request("/auth/register", "POST", {
          username,
          email,
          password,
        });
        if (data.token) {
          alert("Registration successful! Please log in.");
          window.location.href = "login.html";
        }
      } catch (error) {
        if (errorMessageP)
          errorMessageP.textContent = error.message || "Registration failed.";
      }
    });
  }
});
