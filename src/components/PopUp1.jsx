"use client";

export default function InstagramPopup({ isOpen = true, onClose }) {

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Dark background overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={onClose}
          ></div>

          {/* Popup */}
          <div className="relative bg-white rounded-lg shadow-lg p-8 max-w-md w-full z-10 text-center">
            <h2 className="text-2xl font-qimano mb-2 text-graphite text-left">You made it!</h2>
            <hr className="my-1 border-gray-300" />
            <p className="text-graphite mt-2 font-apfel-grotezk-regular text-left">
              Congratulations! You successfully linked your Instagram to snatch.
              You will now be able to see and add your posts and stats to your
              press kit with just a click!
            </p>

            <button
              className="bg-electric-blue text-white py-3 px-6 rounded-xl text-sm font-medium font-apfel-grotezk-regular mt-5"
              onClick={onClose}
            >
              Start selecting Instagram posts for your press kit →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
