const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL;

export const signupUser = async (
  name: string,
  email: string,
  password: string,
  college: string,
  branch: string,
  year: number,
  section: string
) => {
  const res = await fetch(`${AUTH_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      college,
      branch,
      year,
      section,
    }),
  });

  return res.json();
};

export const loginUser = async (email: string, password: string) => {
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

export const getMe = async () => {

  const token = localStorage.getItem("token");

  const res = await fetch(`${AUTH_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};