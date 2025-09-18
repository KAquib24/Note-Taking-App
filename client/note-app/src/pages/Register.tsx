import { useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (error: any) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h2 className="text-2xl mb-4">Register</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full p-2 mb-2 border rounded"/>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full p-2 mb-2 border rounded"/>
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 mb-2 border rounded"/>
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
    </form>
  );
};

export default Register;
