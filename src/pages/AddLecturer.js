import { useState } from "react";
import axios from "../api/axios";

export const AddLecturer = () => {
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("users/", {
        ...form,
        role: "LECTURER",
      });
      alert("Lecturer created!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" onChange={handleChange} placeholder="Email" />
      <input name="first_name" onChange={handleChange} placeholder="First Name" />
      <input name="last_name" onChange={handleChange} placeholder="Last Name" />
      <input name="phone" onChange={handleChange} placeholder="Phone" />
      <input name="password" onChange={handleChange} placeholder="Password" />
      <button type="submit">Create Lecturer</button>
    </form>
  );
};
