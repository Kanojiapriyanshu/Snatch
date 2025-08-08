import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <div className="fixed top-0 w-full bg-electric-blue py-1 px-4 z-50 rounded-b-3xl shadow-md">
      <div className="grid grid-cols-9 items-center justify-items-center w-full">
        <Link href="/home">
          <Image
            src="/assets/icons/settings/Header/People1.svg"
            alt="Home"
            width={28}
            height={28}
            className="w-12 h-12 object-contain"
          />
        </Link>
        <Link href="/dashboard">
          <Image
            src="/assets/icons/settings/Header/People2.svg"
            alt="Dashboard"
            width={28}
            height={28}
            className="w-12 h-12 object-contain"
          />
        </Link>
        <Link href="/explore">
          <Image
            src="/assets/icons/settings/Header/People3.svg"
            alt="Explore"
            width={28}
            height={28}
            className="w-12 h-12 object-contain"
          />
        </Link>
        <Link href="/profile">
          <Image
            src="/assets/icons/settings/Header/People4.svg"
            alt="Profile"
            width={28}
            height={28}
            className="w-12 h-12 object-contain"
          />
        </Link>
        <Link href="/settings">
          <Image
            src="/assets/icons/settings/Header/People5.svg"
            alt="Settings"
            width={28}
            height={28}
            className="w-12 h-12 object-contain"
          />
        </Link>
        <Link href="/notifications">
          <Image
            src="/assets/icons/settings/Header/People6.svg"
            alt="Notifications"
            width={28}
            height={28}
            className="w-12 h-12 object-contain"
          />
        </Link>
        <Link href="/messages">
          <Image
            src="/assets/icons/settings/Header/People7.svg"
            alt="Messages"
            width={28}
            height={28}
            className="w-12 h-12 object-contain"
          />
        </Link>
        <Link href="/support">
          <Image
            src="/assets/icons/settings/Header/People8.svg"
            alt="Support"
            width={28}
            height={28}
            className="w-12 h-12 object-contain"
          />
        </Link>
        <Link href="/logout">
          <Image
            src="/assets/icons/settings/Header/People9.svg"
            alt="Logout"
            width={28}
            height={28}
            className="w-12 h-12 object-contain"
          />
        </Link>
      </div>
    </div>
  );
}
