"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";

export default function SettingsLinks() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  const items = [
    {
      label: "Privacy policy",
      icon: "/assets/icons/settings/privacy.svg",
      href: "/privacy-policy",
    },
    {
      label: "Terms and Services",
      icon: "/assets/icons/settings/Terms.svg",
      href: "/terms-and-services",
    },
    {
      label: "Cookies policy",
      icon: "/assets/icons/settings/Cookies.svg",
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
      href: "#",
    },
    {
      label: "Logout",
      icon: "/assets/icons/settings/logout.svg",
      href: "/logout",
    },
  ];

  const handleItemClick = (label, href) => {
    if (label === "Delete Snatch Account") {
      setShowDeleteModal(true);
    } else if (label === "Logout") {
      signOut(() => router.push("/"));
    }else if (label === "Disconnect Facebook Account") {
      setExpandedItem(expandedItem === label ? null : label);
    } else {
      router.push(href);
    }
  };

const handleDelete = async () => {
  setShowDeleteModal(false);
  try {
    const res = await fetch("/api/requestDelete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id,
        email: user?.emailAddresses?.[0]?.emailAddress,
      }),
    });

    if (res.ok) {
      alert("✅ Your deletion request has been submitted.");
    } else {
      alert("❌ Failed to submit deletion request. Please try again later or email our support team.");
    }
  } catch (err) {
    console.error("Failed to notify server of account deletion", err);
    alert("❌ An unexpected error occurred. Please contact support.");
  }
};


  return (
    <div className="space-y-2 mt-10">
   {items.map((item, index) => (
        <div key={index}>
          <button
            onClick={() => handleItemClick(item.label, item.href)}
            className="w-full text-left flex items-center justify-between border-b pb-3 hover:bg-gray-100 px-2 rounded transition group"
          >
            <div className="flex items-center gap-3">
              <Image src={item.icon} alt={item.label} width={18} height={18} />
              <span className="text-md text-black group-hover:text-[#0037EB] transition-colors font-apfel-grotezk-regular">
                {item.label}
              </span>
            </div>
          
            {item.label === "Disconnect Facebook Account" && (
            <Image
              src={
                expandedItem === "Disconnect Facebook Account"
                  ? "/assets/images/accordion.svg"
                  : "/assets/images/accordion-up.svg"
              }
              alt="Toggle"
              width={16}
              height={16}
              className="ml-2"
            />
          )}

          </button>

          {expandedItem === "Disconnect Facebook Account" && item.label === "Disconnect Facebook Account" && (
            <div className="pl-10 pr-4 py-2 text-sm text-graphite">
              <p className="mt-2">
                Go to your Facebook account settings → Settings & Privacy → Settings → Business Integrations →
                Find Snatch → Click Remove → Confirm
              </p>
              <button className="mt-2 text-electric-blue underline text-sm text-right">Disconnect account</button>
            </div>
          )}
        </div>
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
