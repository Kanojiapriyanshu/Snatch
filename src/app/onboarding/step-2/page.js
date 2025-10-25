// src/app/onboarding/step-2/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "../context";
import MultiSelectInput from "@/components/MultiSelectInput";
import MoneyInput from "@/components/MoneyInput";
import InfoNormalMultiSelect from "@/components/InfoNormalMultiSelect";
import PricingGuideModal from "@/components/PricingGuideModal";
import { industryList } from "@/data/portfolio/industry";
import CurrencyDropdown from "@/components/CurrencyDropdown";

export default function Step2() {
  const { formData, updateFormData, isSaving } = useFormContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState({
    code: "",
    symbol: "",
    flag: "",
  });
  // Add state to track form completion
  const [isFormComplete, setIsFormComplete] = useState(false);

  // Check if essential fields are filled
  useEffect(() => {
    const checkFormCompletion = () => {
      const requiredFields = {
        industry: formData.industry?.length > 0,
        languages: formData.languages?.length > 0,
        compensation: formData.compensation?.length > 0,
      };
      
      setIsFormComplete(Object.values(requiredFields).every(Boolean));
    };

    checkFormCompletion();
  }, [formData]);

  useEffect(() => {
    setSelectedCurrency({
      code: formData.currencyCode || "",
      symbol: formData.currencySymbol || "",
      flag: formData.currencyFlag || "",
    });
  }, [formData.currencyCode, formData.currencySymbol, formData.currencyFlag]);

  const handleAddValue = (field, value) => {
    if (!formData[field]?.includes(value)) {
      updateFormData({
        [field]: [...(formData[field] || []), value],
      });
    }
  };
  
  const handleRemoveValue = (field, value) => {
    updateFormData({
      [field]: formData[field].filter((item) => item !== value),
    });
  };

  // Show loading transition when submitting
  if (isSubmitting) {
    router.push('/onboarding/loading');
  }

  return (
    <div>
      <h2 className="text-3xl mt-10 font-qimano">And we&apos;re almost there!</h2>
      <form className=" w-[45dvw] 2xl:w-[70dvw] 2xl:max-w-[760px] h-[80vh] overflow-y-scroll space-y-6 font-apfel-grotezk-regular mt-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

        <MultiSelectInput
          label="What industries do you create content for?* (Max 5)"
          data={industryList}
          selectedValues={formData.industry || []}
          onAddValue={(value) => handleAddValue("industry", value)}
          onRemoveValue={(value) => handleRemoveValue("industry", value)}
           allowCustom={true}
        />

        <MultiSelectInput
          label="Choose Languages* (Max 5)"
          data={[
            "English", "Spanish", "French", "German", "Mandarin", "Hindi", "Japanese", "Marathi", "Gujarati", "Tamil", "Telugu", "Bengali", "Portuguese", "Italian", "Russian", "Arabic", "Korean", "Vietnamese", "Indonesian", "Turkish", "Urdu", "Chinese", "Punjabi", "Malayalam", "Kannada", "Odia", "Assamese", "Maithili", "Santali", "Bhojpuri", "Nepali", "Dogri", "Manipuri", "Kashmiri", "Konkani", "Sindhi", "Tulu", "Bodo", "Santhali", "Meitei", "Khasi", "Garo", "Mizo", "Lepcha", "Sikkimese", "Bhutia"
          ]}
          selectedValues={formData.languages || []}
          onAddValue={(value) => handleAddValue("languages", value)}
          onRemoveValue={(value) => handleRemoveValue("languages", value)}
        />

        <InfoNormalMultiSelect
          label="Choose Compensation*"
          options={["Gifting", "Sponsorships", "Affiliate", "Hosted", "Collaboration"]}
          selectedValues={formData.compensation || []}
          onAddValue={(value) => handleAddValue("compensation", value)}
          onRemoveValue={(value) => handleRemoveValue("compensation", value)}
        />

      <div>
      <div className="flex items-center justify-between w-[76%]">
        <h4 className="">Add pricing for your services*</h4>
        <CurrencyDropdown
        value={selectedCurrency}
        onChange={(currency) => {
        updateFormData({
          currencyCode: currency.code,
          currencySymbol: currency.symbol,
          currencyFlag: currency.flag,
        });
         setSelectedCurrency({
          code: currency.code,
          symbol: currency.symbol,
          flag: currency.flag,
        });
      }}

      />
      </div>

      <div className="flex flex-row gap-3 mt-4">
        <MoneyInput
          title="Post"
          placeholder="Enter amount"
          value={formData.post}
          currencySymbol={selectedCurrency?.symbol || ""}
          onChange={(value) => updateFormData({ post: value })}
        />
        <MoneyInput
          title="Story"
          placeholder="Enter amount"
          value={formData.story}
          currencySymbol={selectedCurrency?.symbol || ""}
          onChange={(value) => updateFormData({ story: value })}
        />
        <MoneyInput
          title="Reel"
          placeholder="Enter amount"
          value={formData.reels}
          currencySymbol={selectedCurrency?.symbol || ""}
          onChange={(value) => updateFormData({ reels: value })}
        />
      </div>
      <div className="mt-3 text-sm text-graphite">
            Not sure what to charge?{' '}
            <a
              onClick={() => setIsPricingModalOpen(true)}
              className="group inline-flex items-center gap-1 text-electric-blue hover:text-dark-electric-blue underline underline-offset-2 transition-colors cursor-pointer"
            >
              <span>Check our pricing guide</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4 transition-colors"
              >
                <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
    </div>

        <div className="bg-transparent w-full h-24"></div>
      </form>
      <PricingGuideModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} />
    </div>
  );
}