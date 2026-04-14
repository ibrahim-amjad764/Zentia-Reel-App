import { Upload, Link as LinkIcon, AtSign, Globe, MapPin, Briefcase, Camera, Check, ChevronRight, Twitter, Linkedin, Trophy, Plus, Calendar, Instagram, Facebook, Github,  } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { toast } from "sonner";
import { Card } from "../../../../components/ui/card";

interface EditProfileFormProps {
  user: any;
  onSave: (user: unknown) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  onUpdate: (updated: any) => void;
}

const EditProfileForm = ({ user, onSave, onCancel, isSaving, onUpdate }: EditProfileFormProps) => {
  console.log("[EditProfileForm] Initializing with user data:", {
    email: user.email,
    website: user.website,
    social: user.social
  });

  const [updatedUser, setUpdatedUser] = useState<any>({
    ...user,
    ...(user.social || {}),
    ...(user.profile || {}),
    skillsText: (user.skills || []).join(", "),
    hobbiesText: (user.hobbies || []).join(", "),
  });

  console.log("[EditProfileForm] Initial updatedUser state:", {
    website: updatedUser.website,
    social: updatedUser.social
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Achievement form state
  const [achievementTitle, setAchievementTitle] = useState("");
  const [achievementDescription, setAchievementDescription] = useState("");
  const [achievementDate, setAchievementDate] = useState("");
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [isSyncingLocation, setIsSyncingLocation] = useState(false);

  // Sync with preview on every state change
  useEffect(() => {
    onUpdate(updatedUser);
  }, [updatedUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`[EditProfileForm] Field update: ${name} = "${value}"`);
    setUpdatedUser((prev: any) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle achievement submission
   * Purpose: Save achievement to database via API
   * Features: Form validation, API call, error handling, success feedback
   * Best Practices: Modern async/await, proper error boundaries, user feedback
   */
  const handleAddAchievement = async () => {
    console.log("[EditProfileForm] Adding achievement:", {
      title: achievementTitle,
      hasDescription: !!achievementDescription,
      hasDate: !!achievementDate
    });

    // Validation
    if (!achievementTitle.trim()) {
      toast.error("Achievement title is required");
      return;
    }

    try {
      setIsAddingAchievement(true);

      const achievementData = {
        title: achievementTitle.trim(),
        description: achievementDescription.trim() || undefined,
        date: achievementDate || undefined
      };

      console.log("[EditProfileForm] Sending achievement data:", achievementData);

      const response = await fetch("/api/achievements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include auth cookies
        body: JSON.stringify(achievementData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[EditProfileForm] Achievement API error:", errorText);
        throw new Error(`Failed to add achievement: ${response.status}`);
      }

      const result = await response.json();
      console.log("[EditProfileForm] Achievement added successfully:", result);

      // CRITICAL: Update local state to reflect the new achievement immediately
      // This ensures the preview syncs and the list is updated
      const newAchievement = result.achievement;
      setUpdatedUser((prev: any) => {
        const currentAchievements = Array.isArray(prev.achievements) ? prev.achievements : [];
        return {
          ...prev,
          achievements: [...currentAchievements, newAchievement]
        };
      });

      // Reset form
      setAchievementTitle("");
      setAchievementDescription("");
      setAchievementDate("");
      setShowAchievementForm(false);

      // Show success message
      toast.success("Achievement added successfully!", {
        description: "Your digital trophy has been saved.",
        icon: "🏆"
      });

      console.log("[EditProfileForm] Local state synchronized with backend");

    } catch (err) {
      console.error("[EditProfileForm] Error adding achievement:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to add achievement: ${errorMessage}`);
    } finally {
      setIsAddingAchievement(false);
    }
  };

  /**
   * Sync Profile with My Location
   * Purpose: Capture current GPS coordinates and save geocoded address to database
   * Fallback: If geocoding fails, coordinates are still saved to the database.
   */
  const getCurrentLocation = async () => {
    console.log("[Geolocation] Requesting current position...");
    const toastId = toast.loading("Getting your location...");
    
    if (!navigator.geolocation) {
      toast.error("GPS not supported on this device.", { id: toastId });
      return;
    }
    setIsSyncingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log(`[Geolocation] Lat: ${latitude}, Lng: ${longitude}`);
        
        try {
          // Save location to database via API
          const response = await fetch('/api/user/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude })
          });

          if (!response.ok) throw new Error(`Failed to save location: ${response.status}`);

          const result = await response.json();
          console.log("[Geolocation] Sync Success:", result);
          
          if (result.success && result.data) {
            const { city, country, latitude, longitude } = result.data;
            
            // Update local state with all geocoded details
            setUpdatedUser((prev: any) => ({
              ...prev,
              lat: latitude,
              lng: longitude,
              city: city,
              country: country,
              // Fallback for input field: show coords if city/country missing
              location: [city, country].filter(Boolean).join(", ") || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }));
            
            const displayLocation = [city, country].filter(Boolean).join(", ") || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
            toast.success(`Location synced: ${displayLocation}`, { id: toastId });
          }
        } catch (err) {
          console.error("[Geolocation] Database save failed:", err);
          toast.error("Failed to save location.", { id: toastId });
        } finally {
          setIsSyncingLocation(false);
        }
      },
      (error) => {
        setIsSyncingLocation(false);
        console.error("[Geolocation] Error:", error);
        toast.error("Location access denied.", { id: toastId });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
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

    console.log("[EditProfileForm] Final payload prepared:", {
      email: payload.email,
      website: payload.website,
      social: payload.social,
      instagram: payload.instagram,
      facebook: payload.facebook,
      twitter: payload.twitter,
      linkedin: payload.linkedin,
      github: payload.github
    });
    
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  value={typeof updatedUser.location === 'object' && updatedUser.location 
                    ? ([updatedUser.location.city, updatedUser.location.country].filter(Boolean).join(", ") || "")
                    : (updatedUser.location || "")}
                  onChange={handleChange}
                  placeholder="San Francisco, CA"
                  className={inputClasses + " pl-12 pr-12 transition-all group-hover:ring-orange-200 dark:group-hover:ring-orange-900"}
                />
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-orange-50 dark:hover:bg-orange-950/30 text-gray-400 hover:text-[#FF7E5F] transition-colors"
                  onClick={getCurrentLocation}
                >
                  <MapPin size={18} />
                </Button>
              </div>

              {/* GPS COORDINATES & LOCATION STATUS (AUTO-UPDATE) */}
              {(updatedUser.lat || updatedUser.lng || isSyncingLocation) ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter ml-2">GPS Coordinates</span>
                    <div className={`h-10 flex items-center px-4 rounded-xl border transition-colors duration-500 ${
                      isSyncingLocation ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    } text-green-700 dark:text-green-400 text-[10px] font-mono overflow-hidden truncate`}>
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={isSyncingLocation ? 'sync' : 'saved'}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-1"
                        >
                          <div className={`w-2 h-2 rounded-full ${isSyncingLocation ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`} />
                          <span className="font-bold">
                            {isSyncingLocation ? "Synchronizing..." : `${Number(updatedUser.lat || 0).toFixed(6)}, ${Number(updatedUser.lng || 0).toFixed(6)}`}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter ml-2">Location Status</span>
                    <div className={`h-10 flex items-center px-4 rounded-xl border transition-colors duration-500 ${
                      isSyncingLocation ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200' : 'bg-[#FF7E5F]/10 border-[#FF7E5F]/30'
                    } text-[#FF7E5F] text-[10px] font-bold truncate`}>
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={isSyncingLocation ? 'sync' : 'saved'}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-1"
                        >
                          <MapPin size={12} className={isSyncingLocation ? "animate-bounce" : "text-[#FF7E5F]"} />
                          <span>
                            {isSyncingLocation ? "Checking API..." : (updatedUser.city ? `${updatedUser.city}, ${updatedUser.country}` : "Coordinates Only (Fallback)")}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="p-4 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center justify-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Globe size={12} className="opacity-50" />
                    No location data synced
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 ">
            <label className={labelClasses}>Instagram Profile</label>
            <div className="relative">
              <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                name="instagram"
                value={updatedUser.instagram || ""}
                onChange={handleChange}
                placeholder="instagram.com/username"
                className={inputClasses + " pl-12"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Facebook Profile</label>
            <div className="relative">
              <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                name="facebook"
                value={updatedUser.facebook || ""}
                onChange={handleChange}
                placeholder="facebook.com/username"
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

      {/* ACHIEVEMENTS SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF7E5F] to-[#FEB47B] rounded-xl flex items-center justify-center text-white shadow-lg">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Achievements</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-500">Add your accomplishments</p>
            </div>
          </div>
          
          {!showAchievementForm && (
            <Button
              onClick={() => setShowAchievementForm(true)}
              variant="outline"
              className="border-[#FF7E5F]/30 text-[#ff6741] hover:bg-[#FF7E5F]/10 hover:border-[#FF7E5F]/50 transition-all duration-300 group"
            >
              <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" />
              Add Achievement
            </Button>
          )}
        </div>

        {/* Achievement Form */}
        <AnimatePresence>
          {showAchievementForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="p-6  border border-[#FF7E5F]/20 rounded-3xl">
                <div className="space-y-4">
                  {/* Achievement Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                      Achievement Title *
                    </label>
                    <Input
                      value={achievementTitle}
                      onChange={(e) => setAchievementTitle(e.target.value)}
                      placeholder="e.g., Completed JavaScript Course"
                      className="border-[#FF7E5F]/20 focus:border-[#FF7E5F]/50 bg-white/50 dark:bg-zinc-800/50"
                    />
                  </div>

                  {/* Achievement Description */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                      Description (Optional)
                    </label>
                    <Textarea
                      value={achievementDescription}
                      onChange={(e) => setAchievementDescription(e.target.value)}
                      placeholder="Describe your achievement..."
                      rows={3}
                      className="border-[#FF7E5F]/20 focus:border-[#FF7E5F]/50 bg-white/50 dark:bg-zinc-800/50 resize-none"
                    />
                  </div>

                  {/* Achievement Date */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                      Date (Optional)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="date"
                        value={achievementDate}
                        onChange={(e) => setAchievementDate(e.target.value)}
                        className="pl-10 border-[#FF7E5F]/20 focus:border-[#FF7E5F]/50 bg-white/50 dark:bg-zinc-800/50"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={handleAddAchievement}
                      disabled={isAddingAchievement || !achievementTitle.trim()}
                      className="flex-1 bg-gradient-to-br from-[#ff613a] to-[#ff8324] text-white font-bold shadow-gold-soft hover:shadow-gold-heavy transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingAchievement ? (
                        <>
                          <div className="w-4 h-4 bg-white/30 rounded-full animate-pulse mr-2" />
                          Adding Achievement...
                        </>
                      ) : (
                        <>
                          <Trophy size={16} className="mr-2" />
                          Add Achievement
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setShowAchievementForm(false);
                        setAchievementTitle("");
                        setAchievementDescription("");
                        setAchievementDate("");
                      }}
                      variant="outline"
                      className=" hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
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
              className="flex-1 md:flex-none h-12 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-800"
            >
              Discard
            </Button>
            <Button
              id="primary-save-btn"

              onClick={handleSave}
              disabled={isSaving || uploadingAvatar}
              className="flex-[2] md:flex-none h-12 px-12 rounded-2xl bg-gradient-to-tr from-[#ff552a] to-[#ff8d36] text-white font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all group"
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
