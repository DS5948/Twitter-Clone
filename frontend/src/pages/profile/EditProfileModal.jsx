'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useEffect, useState } from "react";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";

const EditProfileModal = ({ authUser }) => {
	const [formData, setFormData] = useState({
		fullName: "",
		username: "",
		email: "",
		bio: "",
		link: "",
		newPassword: "",
		currentPassword: "",
    isPrivate: ""
	});

	const { updateProfile, isUpdatingProfile } = useUpdateUserProfile();
	const [open, setOpen] = useState(false)
	const handleInputChange = (e) => {    
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	useEffect(() => {
		if (authUser) {
			setFormData({
				fullName: authUser.fullName,
				username: authUser.username,
				email: authUser.email,
				bio: authUser.bio,
				link: authUser.link,
        isPrivate: authUser.isPrivate
			});
		}
	}, [authUser]);
	const [isPrivate, setIsPrivate] = useState(true);

  const handleTogglePrivate = () => {
    setFormData((prev) => ({
      ...prev,
      isPrivate: !prev.isPrivate, // Toggle the value within formData
    }));
  };
  
  

	return (
		<>
		<button className='inline-flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 sm:ml-3 sm:w-auto' onClick={() => setOpen(true)}>Edit Profile</button>
		<Dialog open={open} onClose={setOpen} className="relative z-10">
  <DialogBackdrop
    transition
    className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
  />

  <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
	<DialogPanel
  transition
  className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
>
  <div className="bg-white px-6 py-5">
    {/* Profile Picture */}
    <div className="flex items-center space-x-4">
      <img
        src={authUser.profileImg || "/avatar-placeholder.png"}
        alt="Profile"
        className="h-24 w-24 rounded-full object-cover"
      />
      <div className="text-left">
        <h2 className="text-lg font-semibold">{authUser.fullName}</h2>
        <p className="text-sm text-gray-500">{authUser.email}</p>
      </div>
    </div>

    {/* Form */}
    <form
	onSubmit={(e) => {
		e.preventDefault();
		updateProfile(formData);
	}}
	className="mt-6 space-y-4">
      {/* Name */}
      <div className="flex gap-4">
        <div className="w-1/2">
          <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="full-name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            placeholder={authUser.fullName}
			value={formData.fullName}
			name='fullName'
			onChange={handleInputChange}
          />
        </div>
        <div className="w-1/2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            placeholder={authUser.username}
			value={formData.username}
			name='username'
			onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          type="email"
          id="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
          placeholder={authUser.email}
		  value={formData.email}
		  name='email'
		  onChange={handleInputChange}
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <input
          type="text"
          id="bio"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
          placeholder={authUser.bio}
		  value={formData.bio}
		  name='bio'
		  onChange={handleInputChange}
        />
      </div>

      {/* Link */}
      <div>
        <label htmlFor="link" className="block text-sm font-medium text-gray-700">
          Link
        </label>
        <input
          type="text"
          id="link"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
          placeholder={authUser.link}
		  value={formData.link}
		  name='link'
		  onChange={handleInputChange}
        />
      </div>

      {/* Private Account Toggle */}
      <div className="flex items-center justify-between">
  <label htmlFor="private-account" className="block text-sm font-medium text-gray-700">
    Private account
  </label>
  <div className="relative">
    <input
      type="checkbox"
      id="private-account"
      className="sr-only"
      checked={formData.isPrivate}
      onChange={handleTogglePrivate}
    />
    <div
      className={`block h-6 w-11 rounded-full cursor-pointer transition ${
        formData.isPrivate ? "bg-zinc-950" : "bg-gray-400"
      }`}
      onClick={handleTogglePrivate}
    >
      <div
        className={`absolute h-6 w-6 transform rounded-full bg-white transition ${
          formData.isPrivate ? "translate-x-5" : "translate-x-0"
        }`}
      ></div>
    </div>
  </div>
</div>

 {/* Footer */}
 <div className="w-full py-3 sm:flex justify-between">
    {/* <button
      type="button"
      onClick={() => alert("Delete User")}
      className="mt-3 inline-flex w-full justify-start rounded-md bg-red-100 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-200 sm:mt-0 sm:w-auto"
    >
      Delete Profile
    </button> */}
    <div>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={() => setOpen(false)}
        className="inline-flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 sm:ml-3 sm:w-auto"
      >
        Save Changes
      </button>
    </div>
  </div>
    </form>
  </div>
</DialogPanel>

    </div>
  </div>
</Dialog>

	</>
	);
};
export default EditProfileModal;
