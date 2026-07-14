import axios, { type AxiosResponse } from "axios";

export type Result<T, E> =
  { ok: true, data: T } |
  { ok: false, error: E };

export async function axios_call_to_result<T>(f: () => Promise<AxiosResponse<T>>): Promise<Result<T, string>> {
  try {
    const response = await f();

    return { ok: true, data: response.data };
  } catch (error) {
    // DEBUG MODE
    if (import.meta.env.DEV) {
      console.warn(error);
    }

    // FIXME: THIS
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      const detail = data && typeof data === 'object' && 'detail' in data ? (data as Record<string, unknown>).detail : undefined;
      const message = detail || error.message || "Error de red o conexión con el servidor";

      return {
        ok: false,
        error: "(Que backend retorne buenos errores mrd) " + message
      };
    }

    if (error instanceof Error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return {
      ok: false,
      error: `¿Por qué chotas Javascript permite como error cualquier cosa? Ves esto es lo que provoca, ni idea como tratarlo. Toma tu huevada: ${String(error)}`,
    };
  }
}
