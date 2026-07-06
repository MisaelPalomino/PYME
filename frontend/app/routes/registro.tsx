import { useState } from "react";
import { useNavigate } from "react-router";
import api from "~/api/api";
import { Button } from "~/components/ui/button";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    nombre: "",
    password: "",
    password2: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/usuarios/", {
        ...form,
        rol: "Comprador" // IMPORTANTE: fijo desde backend también lo reforzaste
      });

      alert("Cuenta creada correctamente");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
        "Error al crear la cuenta"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Crear cuenta
        </h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-2 rounded mb-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            name="nombre"
            placeholder="Nombre completo"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />

          <input
            name="username"
            placeholder="Usuario"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Correo"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />

          <input
            name="password2"
            type="password"
            placeholder="Confirmar contraseña"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          />

          <Button className="w-full" disabled={loading}>
            {loading ? "Creando..." : "Crear cuenta"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate("/")}
          >
            Ya tengo cuenta
          </Button>

        </form>
      </div>
    </div>
  );
}