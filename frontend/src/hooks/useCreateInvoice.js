// src/hooks/useCreateInvoice.js
import { useState } from "react";
import invoiceApi from "../api/invoiceApi";

const useCreateInvoice = () => {
  const [creating, setCreating] = useState(false);

  const createInvoice = async (payload) => {
    try {
      setCreating(true);

      const res = await invoiceApi.createInvoice(payload);

      return res;
    } catch (err) {
      console.error("Create invoice error:", err);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  return { createInvoice, creating };
};

export default useCreateInvoice;
