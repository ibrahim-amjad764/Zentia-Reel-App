import { useMemo, useState, useEffect } from "react";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { toast } from "sonner";
import { Card } from "../../../../components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Link as LinkIcon, AtSign, Globe, MapPin, Briefcase, Camera, Check, ChevronRight, Twitter, Linkedin } from "lucide-react";

interface EditProfileFormProps {
  user: any;
  onSave: (user: unknown) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  onUpdate: (updated: any) => void;
}

const EditProfileForm = ({ user, onSave, onCancel, isSaving, onUpdate }: EditProfileFormProps) => {
  const [updatedUser, setUpdatedUser] = useState<any>({
    ...user,
    skillsText: (user.skills || []).join(", "),
    hobbiesText: (user.hobbies || []).join(", "),
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Sync with preview on every state change
  useEffect(() => {
    onUpdate(updatedUser);
  }, [updatedUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`[EditProfileForm] Field update: ${name} = "${value}"`);
    setUpdatedUser((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    const loadingToast = toast.loading("Uploading primary identity...");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const url = data?.urls?.[0];
      if (!url) throw new Error("Invalid upload response");

      setUpdatedUser((u: any) => ({ ...u, avatarUrl: url }));
      toast.success("Avatar updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Avatar upload failed");
    } finally {
      setUploadingAvatar(false);
      toast.dismiss(loadingToast);
    }
  };

  const toTags = (text: string) => text.split(",").map(s => s.trim()).filter(Boolean);

  const handleSave = async () => {
    if (!updatedUser.firstName || !updatedUser.email) {
      toast.error("Essential fields are missing.");
      return;
    }

    const payload = {
      ...updatedUser,
      id: user.id,
      skills: toTags(updatedUser.skillsText || ""),
      hobbies: toTags(updatedUser.hobbiesText || ""),
    };

    console.log("[EditProfileForm] Final payload prepared:", payload.email);
    await onSave(payload);
  };

  const inputClasses = "bg-white dark:bg-zinc-900 border-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-[#FF7E5F] transition-all duration-300 rounded-2xl h-12 px-5 text-sm font-medium";
  const labelClasses = "text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block ml-1";

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-20"
    >
      {/* SECTION: IDENTITY */}
      <motion.section variants={itemVariants} className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-1 w-8 bg-[#FF7E5F] rounded-full" />
          <h3 className="text-xl font-black tracking-tight">Identity</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Avatar Upload */}
          <div className="md:col-span-2 flex items-center gap-8 p-6 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-[#FF7E5F] opacity-10 scale-110 blur-xl hover:opacity-20 transition-opacity" />
              <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border-4 border-white dark:border-zinc-900 relative">
                {updatedUser.avatarUrl ? (
                  <img src={updatedUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-gray-400" />
                )}
                {uploadingAvatar && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /></div>}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Profile Picture</h4>
              <p className="text-xs text-gray-500 max-w-[200px]">At least 400x400px. JPG or PNG preferred.</p>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl h-9 text-xs px-4 border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
                  <span className="relative z-10">Upload New</span>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                  />
                </Button>
                {updatedUser.avatarUrl && (
                  <Button variant="ghost" className="rounded-xl h-9 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => setUpdatedUser((u: any) => ({ ...u, avatarUrl: "" }))}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Full Name</label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                value={updatedUser.firstName || ""}
                onChange={handleChange}
                onFocus={() => setFocusedField("firstName")}
                placeholder="First"
                className={inputClasses}
              />
              <Input
                name="lastName"
                value={updatedUser.lastName || ""}
                onChange={handleChange}
                onFocus={() => setFocusedField("lastName")}
                placeholder="Last"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Professional Title</label>
            <Input
              name="jobTitle"
              value={updatedUser.jobTitle || ""}
              onChange={handleChange}
              placeholder="e.g. Creative Director"
              className={inputClasses}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className={labelClasses}>Biography</label>
            <Textarea
              name="bio"
              value={updatedUser.bio || ""}
              onChange={handleChange}
              placeholder="Tell your story in a few sentences..."
              className="bg-white dark:bg-zinc-900 border-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-[#FF7E5F] transition-all duration-300 rounded-3xl min-h-[120px] p-5 text-sm font-medium resize-none leading-relaxed"
            />
          </div>
        </div>
      </motion.section>

      {/* SECTION: SOCIALS */}
      <motion.section variants={itemVariants} className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-1 w-8 bg-[#FEB47B] rounded-full" />
          <h3 className="text-xl font-black tracking-tight">Connections</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 relative group">
            <label className={labelClasses}>Personal Website</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                name="website"
                value={updatedUser.website || ""}
                onChange={handleChange}
                placeholder="https://youruniverse.com"
                className={inputClasses + " pl-12"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Location Details</label>
            <div className="space-y-4">
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF7E5F]" />
                <Input
                  name="location"
                  value={updatedUser.location || ""}
                  onChange={handleChange}
                  placeholder="San Francisco, CA"
                  className={inputClasses + " pl-12 pr-12 transition-all group-hover:ring-orange-200 dark:group-hover:ring-orange-900"}
                />
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-orange-50 dark:hover:bg-orange-950/30 text-gray-400 hover:text-[#FF7E5F] transition-colors"
                  onClick={async () => {
                    console.log("[Geolocation] Requesting current position...");
                    const toastId = toast.loading("Accessing satellite data...");
                    
                    if (!navigator.geolocation) {
                      toast.error("GPS not supported on this device.", { id: toastId });
                      return;
                    }

                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        console.log(`[Geolocation] Lat: ${latitude}, Lng: ${longitude}`);
                        
                        try {
                          // Using Nominatim (OSM) for demonstration as it's open-source
                          // Specify accept-language=en for consistent naming (can be changed based on user locale)
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
                          const data = await res.json();
                          const addr = data.address || {};
                          console.log("[Geolocation] Comprehensive Geodata:", data);
                          
                          // Extreme robust "City" detection (Municipality, Postal City, and District fallbacks included)
                          // Priority: City > Town > Municipality > Village > Suburb > District > County > State
                          const city = addr.city || 
                                       addr.town || 
                                       addr.municipality || 
                                       addr.postal_city ||
                                       addr.village || 
                                       addr.suburb || 
                                       addr.city_district || 
                                       addr.state_district ||
                                       addr.county || 
                                       addr.region || "";

                          const country = addr.country || "";
                          const state = addr.state || addr.province || "";
                          
                          // If city is still blank, try picking the first segment of display_name
                          const cityFallback = !city && data.display_name ? data.display_name.split(',')[0].trim() : city;
                          
                          // Format: "City, State" if in the same country, or "City, Country"
                          const displayRegion = cityFallback && state ? `${cityFallback}, ${state}` : (cityFallback || state || "Unknown Region");
                          const fullLocation = [displayRegion, country].filter(Boolean).join(", ");
                          
                          console.log(`[Geolocation] Formatted Identity: ${fullLocation}`);
                          setUpdatedUser((prev: any) => ({
                            ...prev,
                            location: fullLocation,
                            lat: latitude,
                            lng: longitude,
                            city: cityFallback || state || "Unknown",
                            country: country
                          }));
                          
                          toast.success(`Identity localized: ${displayRegion}`, { id: toastId });
                        } catch (err) {
                          console.error("[Geolocation] Reverse geocoding failed:", err);
                          toast.error("Failed to resolve city. Please enter manually.", { id: toastId });
                        }
                      },
                      (error) => {
                        console.error("[Geolocation] Error:", error);
                        let msg = "Location access denied.";
                        if (error.code === error.TIMEOUT) msg = "Location request timed out.";
                        toast.error(msg, { id: toastId });
                      },
                      { timeout: 10000, enableHighAccuracy: true }
                    );
                  }}
                >
                  <Globe className="w-4 h-4 animate-pulse-slow" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter ml-2">Lat/Lng Lock</span>
                  <div className="h-10 flex items-center px-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 text-[10px] font-mono text-gray-500 overflow-hidden truncate">
                    {updatedUser.lat ? `${Number(updatedUser.lat).toFixed(4)}, ${Number(updatedUser.lng).toFixed(4)}` : "Not anchored"}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter ml-2">Region</span>
                  <div className="h-10 flex items-center px-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-[#FF7E5F] truncate">
                    {updatedUser.city ? `${updatedUser.city}, ${updatedUser.country}` : "Global"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className={labelClasses}>GitHub Handle</label>
            <div className="relative">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                name="github"
                value={updatedUser.github || ""}
                onChange={handleChange}
                placeholder="github.com/..."
                className={inputClasses + " pl-12"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Twitter Profile</label>
            <div className="relative">
              <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                name="twitter"
                value={updatedUser.twitter || ""}
                onChange={handleChange}
                placeholder="twitter.com/username"
                className={inputClasses + " pl-12"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>LinkedIn Profile</label>
            <div className="relative">
              <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                name="linkedin"
                value={updatedUser.linkedin || ""}
                onChange={handleChange}
                placeholder="linkedin.com/in/username"
                className={inputClasses + " pl-12"}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* FIXED FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-t border-zinc-200/50 dark:border-zinc-800/50 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live Syncing
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 md:flex-none h-12 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-gray-500"
            >
              Discard
            </Button>
            <Button
              id="primary-save-btn"
              onClick={handleSave}
              disabled={isSaving || uploadingAvatar}
              className="flex-[2] md:flex-none h-12 px-12 rounded-2xl bg-gradient-to-tr from-[#FF7E5F] to-[#FEB47B] text-white font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all group"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check size={16} />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EditProfileForm;
