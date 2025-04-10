"use client";

import React from "react";
import { useEffect } from "react";
import { useEditState } from "tinacms/dist/react";
import { RxCross1 } from "react-icons/rx";

const AdminLink = () => {
  const { edit } = useEditState();
  const [showAdminLink, setShowAdminLink] = React.useState(false);

  useEffect(() => {
    setShowAdminLink(
      !edit &&
        JSON.parse((window.localStorage.getItem("tinacms-auth") as any) || "{}")
          ?.access_token,
    );
  }, [edit]);

  const handleDismiss = () => {
    setShowAdminLink(false);
  };

  return (
    <>
      {showAdminLink && (
        <div className="fixed right-4 top-4 z-50 flex items-center justify-between rounded-full bg-blue-500 px-3 py-1 text-white">
          <a
            href={`/admin/index.html#/~${window.location.pathname}`}
            className="text-xs"
          >
            Edit This Page
          </a>
          <button onClick={handleDismiss} className="ml-2 text-sm">
            <RxCross1 />
          </button>
        </div>
      )}
    </>
  );
};

export default AdminLink;
