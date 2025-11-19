import { useState } from 'react';
import { FaInstagram, FaFacebook, FaWhatsapp, FaTelegram, FaTimes, FaCopy, FaCheck } from 'react-icons/fa';
import Image from 'next/image';

export default function SharePopup({portfolioUrl, onClose}) {

  const [copied, setCopied] = useState(false);
  
  // Replace with your actual URL
//   const shareUrl = portfolioUrl;
  const shareText = "Check this out!";

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
      icon: FaInstagram,
      color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
      action: () => {
        // Instagram doesn't have direct web share, opens Instagram app/profile
        alert('Instagram sharing requires the mobile app. You can copy the link and share it in your Instagram story or post!');
      }
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-sky-500',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portfolioUrl)}`, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-500',
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + portfolioUrl)}`, '_blank');
      }
    },
    {
      //twitter remove telegram
      name: 'Telegram',
      icon: FaTelegram,
      color: 'bg-sky-500',
      action: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(portfolioUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
      }
    }
  ];


  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 transition-all"
        onClick={onClose}
      />
      
      {/* Share Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative  animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-qimano text-electric-blue">Share</h2>
            <button
              onClick={onClose}
              className="text-graphite transition-colors p-2  rounded-full"
            >
              <Image  src="/assets/icons/cross-mark.svg" width={10} height={10} className="w-8 h-8"/>
            </button>
          </div>

          {/* Social Media Grid */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {socialShares.map((social) => {
              const Icon = social.icon;
              return (
                <button
                  key={social.name}
                  onClick={social.action}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className={`${social.color} w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all group-hover:scale-110 group-hover:shadow-xl`}>
                    <Icon size={28} className="text-white" strokeWidth={2} />
                  </div>
                  <span className="text-electric-blue font-apfel-grotezk-regular text-sm font-medium  transition-colors">
                    {social.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Copy Link Section */}
          <div className="space-y-3 text-electric-blue font-apfel-grotezk-regular ">
            <h3 className="font-semibold text-lg ">Copy page link</h3>
            <div className="flex items-center gap-3 rounded-xl p-4 border border-electric-blue">
              <input
                type="text"
                value={portfolioUrl}
                readOnly
                className="flex-1 bg-transparent  outline-none text-sm"
              />
              <button
                onClick={handleCopy}
                className="bg-blue-600 p-3 rounded-lg transition-all hover:scale-105 flex-shrink-0"
              >
                {copied ? <FaCheck size={20} /> : <FaCopy size={20} />}
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