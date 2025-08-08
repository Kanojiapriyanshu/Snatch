"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export default function SettingsLinks() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const router = useRouter();
  const { signOut } = useClerk();

  const items = [
    {
      label: "Privacy policy",
      icon: "/assets/icons/settings/privacy.svg",
      iconHover: "/assets/icons/settings/privacy1.svg",
      href: "/privacy-policy",
    },
    {
      label: "Terms and Services",
      icon: "/assets/icons/settings/Terms.svg",
      iconHover: "/assets/icons/settings/Terms1.svg",
      href: "/terms-and-services",
    },
    {
      label: "Cookies policy",
      icon: "/assets/icons/settings/Cookies.svg",
      iconHover: "/assets/icons/settings/Cookies1.svg",
      href: "/cookies",
    },
    {
      label: "Disconnect Facebook Account",
      icon: "/assets/images/disconnect.svg",
      href: "#",
    },
    {
      label: "Delete Snatch Account",
      icon: "/assets/icons/settings/Delete.svg",
      iconHover: "/assets/icons/settings/delete1.svg",
      href: "#",
    },
    {
      label: "Logout",
      icon: "/assets/icons/settings/logout.svg",
      iconHover: "/assets/icons/settings/logout1.svg",
      href: "/logout",
    },
  ];

  const handleItemClick = (label, href) => {
    if (label === "Delete Snatch Account") {
      setShowDeleteModal(true);
    }
     else if (label === "Logout") {
      setIsLoggingOut(true);
      signOut(() => {
        router.push("/");
        setIsLoggingOut(false);
      });
    } else {
      router.push(href);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    router.push("/delete-account");
  };

  return (
    <div className="space-y-4 mt-7">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => handleItemClick(item.label, item.href)}
          className="w-full text-left flex items-center justify-between border-b pb-3 hover:bg-gray-100 px-2 rounded transition group"
          disabled={isLoggingOut && item.label === "Logout"}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="flex items-center gap-3">
            <Image
              src={hoveredIndex === index ? item.iconHover : item.icon}
              alt={item.label}
              width={18}
              height={18}
            />
            <span className="text-md text-black group-hover:text-[#0037EB] transition-colors font-apfel-grotezk-regular">
              {item.label}
            </span>
          </div>
          {item.label === "Delete Account" ? (
            <span className="text-gray-400 text-lg"></span>
          ) : item.label === "Logout" && isLoggingOut ? (
            <div className="w-5 h-5 border-2 border-[#0037EB] border-t-transparent rounded-full animate-spin"></div>
          ) : null}
        </button>
      ))}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[320px] sm:w-[500px]">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-md font-qimano font-semibold">Hold on!</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <Image
                  src="/assets/icons/settings/Cross.svg"
                  alt="Close"
                  width={16}
                  height={16}
                />
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-700 font-apfel-grotezk-regular">
              Are you sure you want to delete your account? This action is permanent and all your progress and data will be removed within next 24 hours.
            </p>
            <div className="mt-6 flex justify-center gap-3 font-apfel-grotezk-regular">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="border border-electric-blue text-electric-blue rounded-lg px-4 py-1 hover:bg-blue-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-electric-blue text-white px-4 py-1 rounded-lg hover:bg-electric-blue/30 transition"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
