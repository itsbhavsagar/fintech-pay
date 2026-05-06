import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useRetryTransaction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to retry transaction");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Transaction retried successfully");
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
