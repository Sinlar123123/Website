/** Обрывает зависший fetch к API (например Supabase), чтобы UI не висел бесконечно. */
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(
        new Error(
          `${label}: нет ответа за ${Math.round(ms / 1000)} с. Проверьте интернет или VPN, блокировки к supabase.co.`,
        ),
      );
    }, ms);

    promise.then(
      (v) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        resolve(v);
      },
      (e: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        reject(e);
      },
    );
  });
}
