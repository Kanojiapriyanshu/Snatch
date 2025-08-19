//onboarding/step-1/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useFormContext } from "../context";
import { useRouter } from "next/navigation";
import CustomDropdown from "@/components/CustomDropdown";
import InstagramInput from "@/components/InstagramInput";
import SocialLinksDropdown from "@/components/SocialLinksDropdown";
import CustomFileInput from "@/components/CustomFileInput";
import FormInput from "@/components/FormInput";
import { useAuth } from "@clerk/nextjs";
import DateInput from "@/components/DateInput";
import InfoTooltip from '@/components/InfoTooltip';
import LocationInput from "@/components/LocationInput";

export default function Step1() {
  const { formData, updateFormData, isSaving } = useFormContext();
  const router = useRouter();
  const [formState, setFormState] = useState({
    username: "",
    firstName: "",
    lastName: "",
    gender: "",
    location: "",
    links: [],
    instagram: "",
    profilePicture: null,
    backgroundPicture: null,
    dateOfBirth: "",
  });

  const [numLinks, setNumLinks] = useState(formData?.length || 0);

  console.log("saving", isSaving) //undefined

  useEffect(() => {
    // Synchronize formState with formData when formData updates
    setFormState({
      username: formData.username || "",
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      gender: formData.gender || "",
      location: formData.location || "",
      links: formData.links || [],
      instagram: formData.instagram || "",
      profilePicture: formData.profilePicture || null,
      backgroundPicture: formData.backgroundPicture || null,
      dateOfBirth: formData.dateOfBirth || "",
    });
  }, [formData]);

  const updateField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    updateFormData({ [field]: value }); // Update context immediately
  };

  const handleAddSocialLink = () => {
    updateField("links", [...formState.links, { autoOpenDropdown: true }]);
  };

  const handleLinkChange = (index, data) => {
    const updatedLinks = [...formState.links];
    updatedLinks[index] = data;
    updateField("links", updatedLinks);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFormData(formState);
  };

  
  const handleDeleteLink = (index) => {
    const updatedLinks = formState.links.filter((_, i) => i !== index); // Remove the link at the specified index
    updateField("links", updatedLinks); // Update the form state and localStorage
  };

  return (

    <div>
        <h2 className="text-3xl mt-10 font-qimano">Let&apos;s get Started !</h2>

        <div className="">
  <form
    className="mt-6 w-[45dvw] 2xl:w-[70dvw] 2xl:max-w-[760px] h-[80vh] overflow-y-scroll overflow-x-hidden mx-auto  space-y-6 font-apfel-grotezk-regular"
    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    onSubmit={handleSubmit}
  >
    {/* First and Last Name */}
    <div className="flex flex-col md:flex-row gap-6">
      <FormInput
        placeholder="First Name*"
        value={formState.firstName}
        onChange={(e) => {
          const value = e.target.value;
          const capitalized = value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : "";
          updateField("firstName", capitalized);
        }}
        className="w-full md:w-1/2"
      />
      <FormInput
        placeholder="Last Name*"
        value={formState.lastName}
        onChange={(e) => {
          const value = e.target.value;
          const capitalized = value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : "";
          updateField("lastName", capitalized);
        }}
        className="w-full md:w-1/2"
      />
    </div>

    {/* Gender Dropdown and Date of Birth */}
    <div className="flex flex-col md:flex-row gap-0">
      <CustomDropdown
        options={["Male", "Female", "Other", "Prefer not to say"]}
        placeholder="Gender*"
        onSelect={(option) => updateField("gender", option)}
        selected={formState.gender}
        className="w-full md:w-1/2"
      />
      <DateInput
        placeholder="Date of birth*"
        value={formState.dateOfBirth}
        onChange={(value) => updateField("dateOfBirth", value)}
        className="w-full md:w-1/2"
      />
    </div>

    {/* Location */}
    <LocationInput
      placeholder="Which city do you stay in?*"
      value={formState.location}
      onSelectLocation={(loc) => {
        updateField("location", loc.label); 
      }}
      consideration="Please select your city and country"
      className="w-full"
    />

 {/* Upload Picture & Background */}
 <div className="space-y-3">
      <CustomFileInput
        onFileChange={(uploadedUrl, uploadedFileName) => updateFormData({ profilePicture: uploadedUrl, profilePictureName: uploadedFileName, })}
        placeholder="Upload a profile picture from your device*"
        iconSrc="/assets/icons/onboarding/Upload.svg"
        label="Upload picture"
        fileNameKey="profilePictureName"
        className="w-full"
      />


    {/* Social Links */}
    <div>
      <h6 className="font-medium text-graphite">Add social links</h6>
      <div className="mt-3">
        <InstagramInput
          value={formState.instagram}
          onChange={(value) => updateField("instagram", value)}
          className="w-full"
        />
        <div className="flex items-center mt-1 text-sm  font-apfel-grotezk-regular">
        <span className="tracking-wide">
  Must have an Instagram <span className="font-normal">Creator</span> or <span className="font-normal">Business</span> account with at least <span className="font-normal">1,000 followers</span>.
</span>

          <span title="If you have under 1k followers, you will not be able to access snatch features once you've signed up.">
            <img src="/assets/images/info.svg" alt="info" className="w-4 h-4 ml-2 inline" />
          </span>
        </div>
        {formState.links.slice(0, 4).map((link, index) => (
          <SocialLinksDropdown
            key={index}
            initialData={link}
            onChange={(data) => handleLinkChange(index, data)}
            onDelete={() => handleDeleteLink(index)}
            className="w-full"
            autoOpenDropdown={!!link.autoOpenDropdown}
          />
        ))}
        {/* Add More Links styled as input box, always at the bottom */}
        <div
          className={`flex items-center w-full rounded-md border border-stroke px-5 py-4 mt-4 ${formState.links.length >= 4 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer '}`}
          onClick={formState.links.length >= 4 ? undefined : handleAddSocialLink}
        >
          <span className="text-primary">
            <img src="/assets/icons/onboarding/Plusicon.svg" alt="Add" width={20} height={30} />
          </span>
          <div className="w-[1px] h-6 bg-stroke mx-3"></div>
          <span className="text-graphite opacity-60 select-none">Add another social link</span>
        </div>
      </div>
    </div>

   
      <div className="bg-transparent w-full h-24"></div>
    </div>
  </form>
</div>

    </div>

  );
}