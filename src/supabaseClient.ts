import { createClient } from '@supabase/supabase-js';

const baseSupabase = createClient(
  "https://qsqqolvsndvkwegvcfqv.supabase.co",
  "sb_publishable_srMG0yYK9V0lH1ipf9C4Hw_ae0_eCe5"
);

function wrapThenable(originalBuilder: any, isWriteAction = false): any {
  return new Proxy(originalBuilder, {
    get(target, prop, receiver) {
      if (prop === 'then') {
        return async function(onfulfilled?: any, onrejected?: any) {
          try {
            // 2. Before any authenticated API call, check if user session exists:
            if (isWriteAction) {
              const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('isAdminLoggedIn') === 'true';
              if (!isAdmin) {
                const { data } = await baseSupabase.auth.getSession().catch(() => ({ data: { session: null } }));
                // Support both { data: session } and { data: { session } }
                const session = data && ('session' in data ? (data as any).session : data);
                if (!session) {
                  console.warn("Supabase session check: No active session for authenticated call.");
                  const res = { data: null, error: { message: "No active session available for this authenticated request", code: "NO_SESSION" } };
                  if (onfulfilled) return onfulfilled(res);
                  return res;
                }
              }
            }

            // Execute original .then
            const promise = new Promise((resolve, reject) => {
              target.then(resolve, reject);
            });

            const result: any = await promise;

            // 3. Add a global error handler for Supabase responses:
            if (result && result.error) {
              const err = result.error;
              const isNoRowSingle = err.code === 'PGRST116' || (err.message && err.message.includes('coerce'));
              if (isNoRowSingle) {
                console.log("Supabase info: No row returned for .single() query (PGRST116). This is expected if the record does not exist.");
              } else {
                console.error("Supabase Error response caught globally:", err.message || err);
              }
              // Don't crash the app - returning the result allows individual handlers to read it, but we log it
            }

            if (onfulfilled) {
              return onfulfilled(result);
            }
            return result;
          } catch (error: any) {
            // 1. Wrap all supabase.from() calls in try/catch blocks.
            console.error("Supabase query execution caught exception:", error?.message || error);
            const errResult = { data: null, error: { message: error?.message || String(error), code: "EXCEPTION_CAUGHT" } };
            if (onfulfilled) {
              return onfulfilled(errResult);
            }
            return errResult;
          }
        };
      }

      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        return function(this: any, ...args: any[]) {
          const propStr = String(prop);
          const isWrite = isWriteAction || ['insert', 'update', 'delete', 'upsert'].includes(propStr);

          try {
            const result = value.apply(this === receiver ? target : this, args);
            if (result && typeof result === 'object' && typeof result.then === 'function') {
              return wrapThenable(result, isWrite);
            }
            return result;
          } catch (error: any) {
            console.error(`Supabase method builder ${propStr} threw error:`, error);
            // Return a mock thenable with error to satisfy then signature
            return wrapThenable({
              then(onfulfilled: any) {
                const res = { data: null, error: { message: error?.message || String(error), code: "BUILDER_EXCEPTION" } };
                if (onfulfilled) onfulfilled(res);
                return Promise.resolve(res);
              }
            }, isWrite);
          }
        };
      }
      return value;
    }
  });
}

export const supabase = new Proxy(baseSupabase, {
  get(target, prop, receiver) {
    if (prop === 'from') {
      return function(table: string) {
        try {
          const builder = baseSupabase.from(table);
          return wrapThenable(builder);
        } catch (error: any) {
          console.error(`Supabase from() for table "${table}" threw initialization error:`, error);
          return wrapThenable({
            then(onfulfilled: any) {
              const res = { data: null, error: { message: error?.message || String(error), code: "FROM_INIT_EXCEPTION" } };
              if (onfulfilled) onfulfilled(res);
              return Promise.resolve(res);
            }
          });
        }
      };
    }
    return Reflect.get(target, prop, receiver);
  }
}) as typeof baseSupabase;
