// ---------- Pure validation functions (no document/window access) ----------

function isValidStudentNumber(value) {
  if (typeof value !== "string") return false;
  return /^\d{2}-\d{4}-\d{3}$/.test(value.trim());
}

// Returns a list of password rules that are NOT met (empty list = valid)
function getPasswordProblems(value) {
  const problems = [];
  if (typeof value !== "string") value = "";
  if (value.length < 8) problems.push("at least 8 characters");
  if (!/[A-Z]/.test(value)) problems.push("one uppercase letter");
  if (!/\d/.test(value)) problems.push("one digit");
  if (!/[@$!]/.test(value)) problems.push("one of @, $, or !");
  if (/\s/.test(value)) problems.push("no spaces");
  return problems;
}

function isValidPassword(value) {
  return getPasswordProblems(value).length === 0;
}

// ---------- Other regular expressions ----------

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobilePattern = /^(09|\+639)\d{9}$/;

// ---------- Browser code (only runs when a document exists) ----------

if (typeof document !== "undefined") {
  const form = document.getElementById("registrationForm");
  const fullName = document.getElementById("fullName");
  const studentNumber = document.getElementById("studentNumber");
  const email = document.getElementById("email");
  const mobileNumber = document.getElementById("mobileNumber");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const course = document.getElementById("course");
  const terms = document.getElementById("terms");
  const passwordFeedback = document.getElementById("passwordFeedback");
  const successMessage = document.getElementById("successMessage");
  const summary = document.getElementById("registrationSummary");

  // Show or clear an error message for one field
  function setError(field, message) {
    const errorBox = document.getElementById(field.id + "Error");
    errorBox.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    return message === "";
  }

  // Each validate function returns true when the field is valid
  function validateName() {
    const ok = fullName.value.trim().length >= 2;
    return setError(fullName, ok ? "" : "Enter your full name (at least 2 characters).");
  }

  function validateStudentNumber() {
    const ok = isValidStudentNumber(studentNumber.value);
    return setError(studentNumber, ok ? "" : "Enter a student number in the format 24-1234-123.");
  }

  function validateEmail() {
    const ok = emailPattern.test(email.value.trim());
    return setError(email, ok ? "" : "Enter a valid email address, such as name@example.com.");
  }

  function validateMobile() {
    const ok = mobilePattern.test(mobileNumber.value.trim());
    return setError(mobileNumber, ok ? "" : "Enter a mobile number like 09123456789 or +639123456789 (no spaces or hyphens).");
  }

  function validatePassword() {
    const problems = getPasswordProblems(password.value);
    const message = problems.length ? "Password needs: " + problems.join(", ") + "." : "";
    return setError(password, message);
  }

  function validateConfirmPassword() {
    const ok = confirmPassword.value !== "" && confirmPassword.value === password.value;
    return setError(confirmPassword, ok ? "" : "Passwords do not match.");
  }

  function validateCourse() {
    const ok = course.value === "BSIT" || course.value === "BSCS";
    return setError(course, ok ? "" : "Select BSIT or BSCS.");
  }

  function validateTerms() {
    return setError(terms, terms.checked ? "" : "You must agree to the terms and conditions.");
  }

  function clearOutput() {
    successMessage.textContent = "";
    summary.hidden = true;
    ["summaryName", "summaryStudentNumber", "summaryEmail", "summaryMobileNumber", "summaryCourse"]
      .forEach(function (id) { document.getElementById(id).textContent = ""; });
  }

  // Submit event: check every field, then show the summary only if all pass
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const results = [
      validateName(),
      validateStudentNumber(),
      validateEmail(),
      validateMobile(),
      validatePassword(),
      validateConfirmPassword(),
      validateCourse(),
      validateTerms()
    ];

    if (results.includes(false)) {
      clearOutput();
      return;
    }

    document.getElementById("summaryName").textContent = fullName.value.trim();
    document.getElementById("summaryStudentNumber").textContent = studentNumber.value.trim();
    document.getElementById("summaryEmail").textContent = email.value.trim();
    document.getElementById("summaryMobileNumber").textContent = mobileNumber.value.trim();
    document.getElementById("summaryCourse").textContent = course.value;
    successMessage.textContent = "Registration details validated successfully!";
    summary.hidden = false;
  });

  // Input event: live password feedback
  password.addEventListener("input", function () {
    const problems = getPasswordProblems(password.value);
    if (problems.length === 0) {
      passwordFeedback.textContent = "Password meets all requirements.";
      passwordFeedback.className = "feedback ok";
    } else {
      passwordFeedback.textContent = "Password still needs: " + problems.join(", ") + ".";
      passwordFeedback.className = "feedback";
    }
    if (password.getAttribute("aria-invalid") === "true") validatePassword();
  });

  // Blur event: full name
  fullName.addEventListener("blur", validateName);

  // Change event: course and terms
  course.addEventListener("change", validateCourse);
  terms.addEventListener("change", validateTerms);

  // Once a field shows an error, re-check it as the user corrects it
  const recheck = [
    [studentNumber, validateStudentNumber],
    [email, validateEmail],
    [mobileNumber, validateMobile],
    [confirmPassword, validateConfirmPassword],
    [fullName, validateName]
  ];
  recheck.forEach(function (pair) {
    pair[0].addEventListener("input", function () {
      if (pair[0].getAttribute("aria-invalid") === "true") pair[1]();
    });
  });

  // Reset event: clear all messages and output (the browser restores the values)
  form.addEventListener("reset", function () {
    [fullName, studentNumber, email, mobileNumber, password, confirmPassword, course, terms]
      .forEach(function (field) { setError(field, ""); });
    passwordFeedback.textContent = "";
    passwordFeedback.className = "feedback";
    clearOutput();
  });
}

// ---------- Export for Node (autograder) ----------

if (typeof module !== "undefined" && module.exports) {
  module.exports = { isValidStudentNumber, isValidPassword };
}
