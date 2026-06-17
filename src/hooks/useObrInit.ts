import { useEffect } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { useStore } from "../store/useStore";

export function useObrInit() {
  const setIdentity = useStore((state) => state.setIdentity);

  useEffect(() => {
    let isMounted = true;

    const initializeObr = async () => {
      try {
        if (OBR.isAvailable) {
          OBR.onReady(async () => {
            if (!isMounted) return;

            const userRole = await OBR.player.getRole();
            const userId = await OBR.player.getId();

            // The SDK returns "GM" or "PLAYER", which perfectly matches our IdentityState types
            setIdentity(userId, userRole);
          });
        } else {
          console.warn(
            "Owlbear Rodeo SDK is not available. Are you running this outside of the OBR room?"
          );
        }
      } catch (error) {
        console.error("Failed to initialize Owlbear Rodeo connection:", error);
      }
    };

    initializeObr();

    return () => {
      isMounted = false;
    };
  }, [setIdentity]);
}
