//src/component/memebership/profile-page/profilecontent
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Shield, Key, Trash2 } from "lucide-react";
import { Separator } from "../../../../components/ui/separator";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
import { Badge } from "../../../../components/ui/badge";
import { toast } from "sonner";
import EditProfileForm from "./EditProfileForm";

/** Props: user data, save/cancel handlers, saving state */
interface ProfileContentProps {
  user: any;
  onSave: (user: unknown) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  onUpdate: (updated: any) => void;
}

/** Tabbed profile editor: Personal (form), Account, Security, Notifications (UI placeholders) */
export default function ProfileContent({ user, onSave, onCancel, isSaving, onUpdate }: ProfileContentProps) {
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [loginNotif, setLoginNotif] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  const handleAccountAction = (msg: string) => {
    console.log("[ProfileContent]", msg);
    toast.info(msg);
  };

  return (
    <Tabs defaultValue="personal" className="space-y-12">
      <TabsList className="bg-transparent border-b border-zinc-200 dark:border-zinc-800 w-full justify-start h-auto p-0 gap-8 rounded-none">
        <TabsTrigger 
          value="personal" 
          className="bg-transparent px-0 py-4 border-b-2 border-transparent data-[state=active]:border-[#FF7E5F] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-xs font-bold uppercase tracking-widest text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white transition-all"
        >
          General
        </TabsTrigger>
        <TabsTrigger 
          value="account" 
          className="bg-transparent px-0 py-4 border-b-2 border-transparent data-[state=active]:border-[#FF7E5F] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-xs font-bold uppercase tracking-widest text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white transition-all"
        >
          Account
        </TabsTrigger>
        <TabsTrigger 
          value="security" 
          className="bg-transparent px-0 py-4 border-b-2 border-transparent data-[state=active]:border-[#FF7E5F] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-xs font-bold uppercase tracking-widest text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white transition-all"
        >
          Security
        </TabsTrigger>
        <TabsTrigger 
          value="notifications" 
          className="bg-transparent px-0 py-4 border-b-2 border-transparent data-[state=active]:border-[#FF7E5F] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-xs font-bold uppercase tracking-widest text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white transition-all"
        >
          Notifications
        </TabsTrigger>
      </TabsList>

      {/* Personal: editable form */}
      <TabsContent value="personal" className="mt-0">
        <EditProfileForm 
          user={user} 
          onSave={onSave} 
          onCancel={onCancel} 
          isSaving={isSaving} 
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* Account Settings */}
      <TabsContent value="account" className="space-y-6 mt-0">
        <Card className="border-none bg-white dark:bg-zinc-900/50 shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-xl font-bold">Account Settings</CardTitle>
            <CardDescription>Manage your primary account identity and visibility.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-6">
            <div className="flex items-center justify-between py-4">
              <div className="space-y-1">
                <Label className="text-sm font-bold uppercase tracking-wider">Status</Label>
                <p className="text-muted-foreground text-xs font-medium">Your account is safe and active.</p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Protected
              </Badge>
            </div>
            <Separator className="bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex items-center justify-between py-4">
              <div className="space-y-1">
                <Label className="text-sm font-bold uppercase tracking-wider">Visibility</Label>
                <p className="text-muted-foreground text-xs font-medium">Allow others to see your collections.</p>
              </div>
              <Switch checked={profileVisible} onCheckedChange={setProfileVisible} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Security: UI only */}
      <TabsContent value="security" className="space-y-6 mt-0">
        <Card className="border-none bg-white dark:bg-zinc-900/50 shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-xl font-bold">Security & Access</CardTitle>
            <CardDescription>Secure your presence with advanced protection.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="flex items-center justify-between py-4">
              <div className="space-y-1">
                <Label className="text-sm font-bold uppercase tracking-wider">Passkey</Label>
                <p className="text-muted-foreground text-xs font-medium">Last synced 5 days ago.</p>
              </div>
              <Button size="sm" variant="outline" className="rounded-xl font-bold text-[10px] uppercase tracking-widest border-accent-foreground" onClick={() => handleAccountAction("Auth sync requested")}>
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Notifications: toggles (local state) */}
      <TabsContent value="notifications" className="space-y-6 mt-0">
        <Card className="border-none bg-white dark:bg-zinc-900/50 shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-xl font-bold">Inbox Pulse</CardTitle>
            <CardDescription>Fine-tune how and when you receive updates.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-4">
            {[ 
              { id: 'email', label: 'Email Logs', desc: 'Detailed updates via primary inbox', state: emailNotif, set: setEmailNotif },
              { id: 'marketing', label: 'Beta Invites', desc: 'Early access to upcoming features', state: marketingEmails, set: setMarketingEmails }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">{item.label}</Label>
                  <p className="text-muted-foreground text-[11px] font-medium opacity-70">{item.desc}</p>
                </div>
                <Switch checked={item.state} onCheckedChange={item.set} />
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}