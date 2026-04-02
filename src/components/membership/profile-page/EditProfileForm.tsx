import { useMemo, useState } from "react";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { toast } from "sonner";
import { Card } from "../../../../components/ui/card";

interface EditProfileFormProps {
  user: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    jobTitle?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    skills?: string[];
    hobbies?: string[];
  };
  onSave: (user: unknown) => Promise<void>
  onCancel: () => void;
  isSaving: boolean;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidUrlMaybe(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const EditProfileForm = ({ user, onSave, onCancel, isSaving }: EditProfileFormProps) => {
  const [updatedUser, setUpdatedUser] = useState<Record<string, unknown> & {
    email?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
    jobTitle?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    skillsText?: string;
    hobbiesText?: string;
    id?: string;
  }>({
    ...user,
    skillsText: ((user.skills ?? []) as string[]).join(", "),
    hobbiesText: ((user.hobbies ?? []) as string[]).join(", "),
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({}); // track touch event

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!updatedUser.email?.trim()) e.email = "Email is required.";
    else if (!isValidEmail(updatedUser.email)) e.email = "Please enter a valid email.";
    if (updatedUser.website && !isValidUrlMaybe(updatedUser.website))
      e.website = "Website must be a valid URL starting with http(s)://";
    if (updatedUser.github && !isValidUrlMaybe(updatedUser.github))
      e.github = "GitHub must be a valid URL starting with http(s)://";
    if (updatedUser.linkedin && !isValidUrlMaybe(updatedUser.linkedin))
      e.linkedin = "LinkedIn must be a valid URL starting with http(s)://";
    if (updatedUser.twitter && !isValidUrlMaybe(updatedUser.twitter))
      e.twitter = "Twitter must be a valid URL starting with http(s)://";

    return e;
  }, [updatedUser]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdatedUser({ ...updatedUser, [name]: value });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    const loadingToast = toast.loading("Uploading avatar...");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const url = data?.urls?.[0];
      if (!url) throw new Error("Invalid upload response");

      setUpdatedUser((u) => ({ ...u, avatarUrl: url }));
      toast.success("Avatar uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Avatar upload failed");
    } finally {
      setUploadingAvatar(false);
      toast.dismiss(loadingToast);
    }
  };
  //make clean array format
  const buildPayload = () => {
    const toTags = (text: string) =>
      text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    return {
      id: String(updatedUser.id ?? ""),
      firstName: String(updatedUser.firstName ?? ""),
      lastName: String(updatedUser.lastName ?? ""),
      email: String(updatedUser.email ?? ""),
      avatarUrl: String(updatedUser.avatarUrl ?? ""),
      bio: String(updatedUser.bio ?? ""),
      jobTitle: String(updatedUser.jobTitle ?? ""),
      company: String(updatedUser.company ?? ""),
      phone: String(updatedUser.phone ?? ""),
      location: String(updatedUser.location ?? ""),
      website: String(updatedUser.website ?? ""),
      github: String(updatedUser.github ?? ""),
      linkedin: String(updatedUser.linkedin ?? ""),
      twitter: String(updatedUser.twitter ?? ""),
      skills: toTags(String(updatedUser.skillsText ?? "")),
      hobbies: toTags(String(updatedUser.hobbiesText ?? "")),
    };
  };

  const handleSave = async () => {
    if (!isValid) {
      toast.error("Please fix the errors in the form!");
      return;
    }
    try {
      await onSave(buildPayload());
      // Toast handled by parent (edit page)
    } catch (err) {
      toast.error("Failed to save profile");
    }
  };

  return (
    <Card className="p-6 bg-white backdrop-blur-lg shadow-lg rounded-lg border-4 border-gray-100 dark:bg-zinc-900/80 dark:border-zinc-700/50">
      <div className="flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-semibold text-black dark:text-white">Profile picture</label>
          <div className="flex items-center gap-3 border-2 rounded-md dark:border-gray-600 hover:border-blue-500 transition-colors duration-200">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleAvatarUpload(file);
              }}
              disabled={isSaving || uploadingAvatar}
              className="border-zinc-900/30" />
            {updatedUser.avatarUrl && (
              <a href={updatedUser.avatarUrl} target="_blank" rel="noreferrer"
                className="text-sm underline underline-offset-2 text-black">
                Preview
              </a>
            )}
          </div>
          {uploadingAvatar && <p className="text-xs text-gray-200">Uploading...</p>}
        </div>

        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white ">First Name *</label>
            <Input
              type="text"
              name="firstName"
              value={updatedUser.firstName ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="First name"
              className=" text-l border-zinc-900/30 placeholder:text-slate-700 placeholder:opacity-60 dark:text-gray-400  rounded-md dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white">Last Name *</label>
            <Input
              type="text"
              name="lastName"
              value={updatedUser.lastName ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Last name"
              className="border-zinc-900/30 placeholder:text-slate-600 dark:text-gray-400  rounded-md dark:border-gray-600" />
          </div>
        </div>

        {/* Job & Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white ">Job title </label>
            <Input
              type="text"
              name="jobTitle"
              value={updatedUser.jobTitle ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Senior Product Designer"
              className="border-zinc-900/30 placeholder:text-slate-600 dark:text-white rounded-md dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white">Company</label>
            <Input
              type="text"
              name="company"
              value={updatedUser.company ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Acme Inc."
              className="border-zinc-900/30 placeholder:text-slate-600 rounded-md dark:border-gray-600" />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-black dark:text-white">Short bio *</label>
          <Textarea
            name="bio"
            value={updatedUser.bio ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Tell people a bit about you..."
            rows={1}
            className="resize-none border-zinc-900/30 placeholder:text-slate-600 rounded-md dark:border-gray-600" />
        </div>

        {/* Contact + location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white">Email *</label>
            <Input
              type="email"
              name="email"
              value={updatedUser.email ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="name@example.com"
              className="border-zinc-900/30 placeholder:text-slate-600 rounded-md dark:border-gray-600" />
            {touched.email && errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white ">Phone *</label>
            <Input
              type="tel"
              name="phone"
              value={updatedUser.phone ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="+92..."
              className="border-zinc-900/30 placeholder:text-slate-600 rounded-md dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white">Location </label>
            <Input
              type="text"
              name="location"
              value={updatedUser.location ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="City, Country"
              className="border-zinc-900/30 placeholder:text-slate-600 rounded-md dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white">Website </label>
            <Input
              type="url"
              name="website"
              value={updatedUser.website ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://..."
              className="border-zinc-900/30 placeholder:text-slate-600 rounded-md dark:border-gray-600" />
            {touched.website && errors.website && (
              <p className="text-xs text-red-600 mt-1">{errors.website}</p>
            )}
          </div>
        </div>

        {/* Social links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white">GitHub </label>
            <Input
              type="url"
              name="github"
              value={updatedUser.github ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://github.com/username"
              className="border-zinc-900/30 placeholder:text-slate-600 rounded-md dark:border-gray-600" />
            {touched.github && errors.github && (
              <p className="text-xs mt-1 text-gray-200">{errors.github}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white">LinkedIn </label>
            <Input
              type="url"
              name="linkedin"
              value={updatedUser.linkedin ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://linkedin.com/in/username"
              className="border-zinc-900/30 placeholder:text-slate-600 rounded-md dark:border-gray-600" />
            {touched.linkedin && errors.linkedin && (
              <p className="text-xs text-red-600 mt-1">{errors.linkedin}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white">Twitter/X </label>
            <Input
              type="url"
              name="twitter"
              value={updatedUser.twitter ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://x.com/username"
              className="border-zinc-900/30 placeholder:text-slate-600 rounded-md dark:border-gray-600" />
            {touched.twitter && errors.twitter && (
              <p className="text-xs text-red-600 mt-1">{errors.twitter}</p>
            )}
          </div>
        </div>

        {/* Skills / Hobbies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white">Skills </label>
            <Input
              type="text"
              name="skillsText"
              value={updatedUser.skillsText ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="React, Next.js, SQL"
              className="border-zinc-900/30 placeholder:text-slate-600 rounded-md dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white">Hobbies </label>
            <Input
              type="text"
              name="hobbiesText"
              value={updatedUser.hobbiesText ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Cricket, Reading"
              className="border-zinc-900/30 placeholder:text-slate-600 rounded-md dark:border-gray-600" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving || uploadingAvatar}
            className="transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md">
            Cancel
          </Button>
          <Button
            className="transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
            type="button"
            onClick={handleSave}
            disabled={!isValid || isSaving || uploadingAvatar}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EditProfileForm;