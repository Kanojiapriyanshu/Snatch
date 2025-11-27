import { useState } from 'react';
import Image from 'next/image';
import { FaCheck } from 'react-icons/fa';

export default function SharePopup({ portfolioUrl, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareText = "Preview my press kit on Snatch →"; 

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const socialShares = [
    {
      name: 'Instagram',
      icon: '/assets/images/instaShare.svg', // ⬅️ your SVG path
      color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
      action: () => {
        alert(
          'Instagram sharing requires the mobile app. You can copy the link and share it in your Instagram story or post!'
        );
      },
    },
    {
      name: 'Facebook',
      icon: '/assets/images/facebookShare.svg', // ⬅️ your SVG path
      color: 'bg-sky-500',
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            portfolioUrl
          )}`,
          '_blank',
          'width=600,height=400'
        );
      },
    },
    {
      name: 'WhatsApp',
      icon: '/assets/images/whatsappShare.svg', // ⬅️ your SVG path
      color: 'bg-green-500',
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            shareText + ' ' + portfolioUrl
          )}`,
          '_blank'
        );
      },
    },
    {
      name: 'Twitter',
      icon: '/assets/images/Xshare.svg', // ⬅️ your SVG path
      color: 'bg-sky-400',
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            portfolioUrl
          )}&text=${encodeURIComponent(shareText)}`,
          '_blank'
        );
      },
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 transition-all"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-qimano text-electric-blue">Share</h2>

            <button
              onClick={onClose}
              className="text-graphite transition-colors p-2 rounded-full"
            >
              <Image
                src="/assets/icons/cross-mark.svg"
                width={20}
                height={20}
                className="w-8 h-8 mb-1"
                alt="Close"
              />
            </button>
          </div>

          {/* Social Grid */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {socialShares.map((social) => (
              <button
                key={social.name}
                onClick={social.action}
                className="flex flex-col items-center gap-3 group"
              >
                <div
                  className='group-hover:scale-110'
                >
                  <Image
                    src={social.icon}
                    width={30}
                    height={30}
                    alt={social.name}
                    className="w-10 h-10"
                  />
                </div>
                <span className="text-graphite font-apfel-grotezk-regular text-md">
                  {social.name}
                </span>
              </button>
            ))}
          </div>

          {/* Copy Link */}
          <div className="space-y-3 text-electric-blue font-apfel-grotezk-regular">
            <h3 className="text-graphite">Copy link</h3>

            <div className="flex items-center gap-3 rounded-xl p-3 border border-[#878787]">
              <input
                type="text"
                value={portfolioUrl}
                readOnly
                className="flex-1 bg-transparent text-[#878787] outline-none text-sm"
              />

              <button
                onClick={handleCopy}
                className="bg-blue-600 p-3 rounded-lg transition-all hover:scale-105 flex-shrink-0"
              >
                 {copied ? <FaCheck size={20} /> : <Image src="/assets/images/copy.svg" width={20} height={20} className='w-7 h-7' />}
              </button>
            </div>

            {copied && (
              <p className="text-green-400 text-sm text-center animate-in fade-in slide-in-from-top-1">
                Link copied to clipboard!
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
