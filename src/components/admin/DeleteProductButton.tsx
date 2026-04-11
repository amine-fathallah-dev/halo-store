"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/actions/products";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteProduct(productId);
    if (result.error) {
      alert("Erreur lors de la suppression.");
      setDeleting(false);
      setConfirming(false);
    } else {
      router.refresh();
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-dm text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
        >
          {deleting ? "..." : "Confirmer"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="text-xs font-dm text-grege hover:text-noir px-2 py-1 cursor-pointer"
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-grege hover:text-red-500 transition-colors cursor-pointer p-2 flex items-center justify-center"
      aria-label={`Supprimer ${productName}`}
      title="Supprimer"
    >
      <Trash2 size={16} />
    </button>
  );
}
