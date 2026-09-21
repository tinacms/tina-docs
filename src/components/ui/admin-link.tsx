"use client";

import { TinaIcon } from "@/components/icons/tina-icon";
import { useEffect, useState } from "react";
import { useEditState } from "tinacms/dist/react";

const hasTinaSession = () => {
  const raw = window.localStorage.getItem("tinacms-auth");
  if (!raw) return false;
  try {
    const auth: unknown = JSON.parse(raw);
    return (
      typeof auth === "object" &&
      auth !== null &&
      "access_token" in auth &&
      Boolean(auth.access_token)
    );
  } catch {
    return false;
  }
};

const AdminLink = () => {
  const { edit } = useEditState();
  const [showAdminLink, setShowAdminLink] = useState(false);

  useEffect(() => {
    setShowAdminLink(!edit && hasTinaSession());
  }, [edit]);

  if (!showAdminLink) return null;

  return (
    <a
      href={`/admin/index.html#/~${window.location.pathname}`}
      className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#EC4815] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#D13F13]"
    >
      <TinaIcon className="h-5 w-auto" />
      Edit ✏️
    </a>
  );
};

export default AdminLink;
