import { CalendarResponse } from "@/types";
import { useEffect, useState } from "preact/hooks";

// Calendar app component
function App(props: { layout: "sidebar" | "default" }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const response = (await browser.runtime.sendMessage(
          {}
        )) as CalendarResponse;

        if (!mounted) return;

        if (response.error) {
          setError(response.error);
          setLoading(false);
          return;
        }

        if (!response.data) {
          setError("No activity data available");
          setLoading(false);
          return;
        }

        setData(response.data);
        setLoading(false);

        // Listen for background refresh
        if (response.isStale) {
          const messageListener = (message: any) => {
            if (
              message.type === "calendar_update" &&
              message.isFresh &&
              message.data &&
              mounted
            ) {
              logger.log("[MA-Grid] Received fresh data, updating calendar");
              setData(message.data);
              browser.runtime.onMessage.removeListener(messageListener);
            }
          };
          browser.runtime.onMessage.addListener(messageListener);
        }
      } catch (err) {
        if (!mounted) return;
        logger.error("[MA-Grid] Failed to load calendar:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load activity data"
        );
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div class="ma-grid__loading">Loading activity...</div>;
  }

  if (error) {
    return <div class="ma-grid__error">{error}</div>;
  }

  return <Calendar data={data} layout={props.layout} />;
}

export default App;
