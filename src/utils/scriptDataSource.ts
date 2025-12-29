import { getCalendarResponse } from "./calendarResponse";
import { createDataSource, type DataSourceUpdate } from "./dataSource";

export function createScriptDataSource() {
  let emitUpdate: DataSourceUpdate | null = null;

  return createDataSource({
    fetchData: () =>
      getCalendarResponse({
        origin: window.location.origin,
        onFresh: (response) => {
          if (response.data && emitUpdate) {
            emitUpdate(response);
          }
        },
      }),
    subscribe: (emit) => {
      emitUpdate = emit;
      return () => {
        emitUpdate = null;
      };
    },
  });
}
