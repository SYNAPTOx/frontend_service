const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL;


// ================= SIGNUP =================

export const signupUser = async (data: {
  name: string;
  email: string;
  password: string;
  college: string;
  branch: string;
  year: number;
  section: string;
}) => {

  const res = await fetch(`${AUTH_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};


// ================= LOGIN =================

export const loginUser = async (
  email: string,
  password: string
) => {

  const res = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return res.json();
};


// ================= GET ME =================

export const getMe = async () => {

  const token = localStorage.getItem("token");

  const res = await fetch(`${AUTH_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};


// ================= FORGOT PASSWORD =================

export const forgotPassword = async (email: string) => {

  const res = await fetch(`${AUTH_URL}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return res.json();
};


// ================= RESET PASSWORD =================

export const resetPassword = async (
  token: string,
  password: string
) => {

  const res = await fetch(
    `${AUTH_URL}/reset-password/${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    }
  );

  return res.json();
};


// ================= VERIFY EMAIL =================

export const verifyEmail = async (token: string) => {

  const res = await fetch(
    `${AUTH_URL}/verify/${token}`
  );

  return res.json();
};


// ================= GOOGLE LOGIN =================

export const googleLogin = async (idToken: string) => {

  const res = await fetch(
    `${AUTH_URL}/google`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    }
  );

  return res.json();
};