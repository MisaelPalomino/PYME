import { z } from "zod";

export const UsuarioSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z.string().email("El correo electrónico no es válido"),
  nombre: z.string().min(3, "El nombre completo es requerido"),
  rol: z.enum(['Administrador', 'Gerente', 'Almacenero', 'Comprador'], {
    errorMap: () => ({ message: "Selecciona un rol válido" })
  }),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  password2: z.string().min(6, "Debe confirmar la contraseña"),
}).refine(data => data.password === data.password2, {
  message: "Las contraseñas no coinciden",
  path: ["password2"]
});

export const UsuarioEditSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z.string().email("El correo electrónico no es válido"),
  nombre: z.string().min(3, "El nombre completo es requerido"),
  rol: z.enum(['Administrador', 'Gerente', 'Almacenero', 'Comprador'], {
    errorMap: () => ({ message: "Selecciona un rol válido" })
  }),
});
