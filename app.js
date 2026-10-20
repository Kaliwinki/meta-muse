import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Éléments de la page
const messageBox = document.getElementById("message");
const authZone = document.getElementById("auth-zone");
const memberZone = document.getElementById("member-zone");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const userEmail = document.getElementById("user-email");
const userUid = document.getElementById("user-uid");
const logoutBtn = document.getElementById("logout-btn");

function showMessage(text, kind = "info") {
  messageBox.textContent = text;
  messageBox.className = `message ${kind}`;
}

function hideMessage() {
  messageBox.className = "message hidden";
}

// Si la config n'est pas encore remplie, on affiche un message de maintenance
// au lieu d'essayer d'initialiser Firebase.
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "A_REMPLIR") {
  showMessage(
    "Le site est en cours de configuration : l'authentification sera activée très bientôt.",
    "info"
  );
} else {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // Traduction des erreurs Firebase en français clair
  function authErrorMessage(code) {
    switch (code) {
      case "auth/email-already-in-use":
        return "Cette adresse e-mail est déjà utilisée par un compte.";
      case "auth/invalid-email":
        return "L'adresse e-mail n'est pas valide.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Adresse e-mail ou mot de passe incorrect.";
      case "auth/weak-password":
        return "Le mot de passe doit contenir au moins 6 caractères.";
      case "auth/operation-not-allowed":
        return "La connexion par e-mail n'est pas activée sur ce projet.";
      case "auth/too-many-requests":
        return "Trop de tentatives. Réessaie dans quelques minutes.";
      case "auth/network-request-failed":
        return "Problème de connexion réseau. Vérifie ta connexion internet.";
      default:
        return `Une erreur est survenue (${code}). Réessaie.`;
    }
  }

  // Onglets Connexion / Inscription
  tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    hideMessage();
  });

  tabSignup.addEventListener("click", () => {
    tabSignup.classList.add("active");
    tabLogin.classList.remove("active");
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    hideMessage();
  });

  // Connexion
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessage();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      showMessage(authErrorMessage(err.code), "error");
    }
  });

  // Inscription
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessage();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showMessage("Compte créé avec succès. Bienvenue !", "success");
    } catch (err) {
      showMessage(authErrorMessage(err.code), "error");
    }
  });

  // Déconnexion
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (err) {
      showMessage(authErrorMessage(err.code), "error");
    }
  });

  // Réagit aux changements d'état de connexion
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userEmail.textContent = user.email ?? "(adresse inconnue)";
      userUid.textContent = user.uid;
      authZone.classList.add("hidden");
      memberZone.classList.remove("hidden");
      hideMessage();
    } else {
      authZone.classList.remove("hidden");
      memberZone.classList.add("hidden");
    }
  });
}
