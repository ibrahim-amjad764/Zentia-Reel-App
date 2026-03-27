"use client";
import { useState } from "react";
import { Shield, Key, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Separator } from "../../../../components/ui/separator";
import { Switch } from "../../../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Badge } from "../../../../components/ui/badge";
import { toast } from "sonner";
import EditProfileForm from "./EditProfileForm";
/** Tabbed profile editor: Personal (form), Account, Security, Notifications (UI placeholders) */
export default function ProfileContent({ user, onSave, onCancel, isSaving }) {
    const [emailNotif, setEmailNotif] = useState(true);
    const [pushNotif, setPushNotif] = useState(false);
    const [marketingEmails, setMarketingEmails] = useState(true);
    const [weeklySummary, setWeeklySummary] = useState(true);
    const [loginNotif, setLoginNotif] = useState(true);
    const [profileVisible, setProfileVisible] = useState(true);
    const handleAccountAction = (msg) => {
        console.log("[ProfileContent]", msg);
        toast.info(msg);
    };
    return (<Tabs defaultValue="personal" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      {/* Personal: editable form */}
      <TabsContent value="personal" className="space-y-6">
        <EditProfileForm user={user} onSave={onSave} onCancel={onCancel} isSaving={isSaving}/>
      </TabsContent>

      {/* Account: UI only, toasts on action */}
      <TabsContent value="account" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Account Status</Label>
                <p className="text-muted-foreground text-sm">Your account is currently active</p>
              </div>
              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                Active
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Account Visibility</Label>
                <p className="text-muted-foreground text-sm">Make your profile visible to other users</p>
              </div>
              <Switch checked={profileVisible} onCheckedChange={setProfileVisible}/>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Data Export</Label>
                <p className="text-muted-foreground text-sm">Download a copy of your data</p>
              </div>
              <Button variant="outline" onClick={() => handleAccountAction("Data export requested")}>
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Delete Account</Label>
                <p className="text-muted-foreground text-sm">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" onClick={() => {
            console.warn("[ProfileContent] Delete account clicked");
            toast.error("Delete account is not implemented");
        }}>
                <Trash2 className="mr-2 h-4 w-4"/>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security: UI only */}
      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Password</Label>
                <p className="text-muted-foreground text-sm">Last changed 3 months ago</p>
              </div>
              <Button variant="outline" onClick={() => handleAccountAction("Change password requested")}>
                <Key className="mr-2 h-4 w-4"/>
                Change Password
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Login Notifications</Label>
                <p className="text-muted-foreground text-sm">Get notified when someone logs into your account</p>
              </div>
              <Switch checked={loginNotif} onCheckedChange={setLoginNotif}/>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Active Sessions</Label>
                <p className="text-muted-foreground text-sm">Manage devices logged into your account</p>
              </div>
              <Button variant="outline" onClick={() => handleAccountAction("View sessions requested")}>
                <Shield className="mr-2 h-4 w-4"/>
                View Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Notifications: toggles (local state) */}
      <TabsContent value="notifications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose what notifications you want to receive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-muted-foreground text-sm">Receive notifications via email</p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif}/>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Push Notifications</Label>
                <p className="text-muted-foreground text-sm">Receive push notifications in your browser</p>
              </div>
              <Switch checked={pushNotif} onCheckedChange={setPushNotif}/>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Marketing Emails</Label>
                <p className="text-muted-foreground text-sm">Receive emails about new features and updates</p>
              </div>
              <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails}/>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Weekly Summary</Label>
                <p className="text-muted-foreground text-sm">Get a weekly summary of your activity</p>
              </div>
              <Switch checked={weeklySummary} onCheckedChange={setWeeklySummary}/>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>);
}
