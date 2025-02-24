import { fetchSession } from "@/actions/auth";
import { useEffect, useState } from "react";

export const useSession = () => {
  const [session, setSession] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const playerId = await fetchSession();
      setSession(playerId);
    })();
  }, []);

  return session;
};
