import { useState, useEffect } from "react";
import useAuth from '@/hooks/useAuth';
import { useForums } from '@/hooks/useForum';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Users } from 'lucide-react';

import api from '@/services/axios'

const BASE_URL = import.meta.env.VITE_API_URL;


const ORGANIZATION_TYPES = {
    NGO: "NGO",
    GOVERNMENT: "GOVERNMENT",
    PRIVATE: "PRIVATE",
    INTERNATIONAL: "INTERNATIONAL",
    OTHER: "OTHER",
};

const InputField = ({ label, name, type = "text", disabled, options, form, handleChange }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>

        {options ? (
            <select
                name={name}
                value={form[name] || ""}
                onChange={handleChange}
                disabled={disabled}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        ) : (
            <input
                type={type}
                name={name}
                value={form[name] || ""}
                onChange={handleChange}
                disabled={disabled}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
        )}
    </div>
);

const DisplayField = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
        <span className="text-sm font-medium">{value || "—"}</span>
    </div>
);


export default function ContentContributorProfile() {
    const { user, status } = useAuth();
    const navigate = useNavigate();
    const { forums, getAllForums, isLoading: forumsLoading } = useForums();

    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [creating, setCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [userForums, setUserForums] = useState([]);

    const emptyForm = {
        organizationName: "",
        organizationType: ORGANIZATION_TYPES.NGO,
        contactPerson: "",
        phoneNumber: "",
        country: "",
    };

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        if (status !== "authenticated") return;
        fetchProfile();
    }, [status]);

    useEffect(() => {
        // Fetch all forums for display
        getAllForums();
    }, []);

    useEffect(() => {
        // Filter forums created by the current user
        if (user && forums.length > 0) {
            const userId = user._id?.toString() || user.id?.toString() || '';
            
            const myForums = forums.filter(forum => {
                // createdBy might be:
                // 1. An object with _id property: { _id: "...", email, role }
                // 2. A string ID
                // 3. An ObjectId
                
                const creatorId = forum.createdBy?._id?.toString() || forum.createdBy?.toString() || '';
                return creatorId === userId;
            });

            console.log('Content Contributor Forums Debug:', {
                userId: user._id,
                userIdString: userId,
                totalForums: forums.length,
                foundForums: myForums.length,
                forumDetails: forums.map(f => ({
                    id: f._id,
                    name: f.name,
                    createdBy: f.createdBy,
                    createdByType: typeof f.createdBy,
                    createdById: f.createdBy?._id || f.createdBy,
                    matches: (f.createdBy?._id?.toString() || f.createdBy?.toString() || '') === userId
                }))
            });

            setUserForums(myForums);
        } else {
            console.warn('Waiting for user or forums data', { hasUser: !!user, forumsLength: forums.length });
        }
    }, [forums, user]);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`${BASE_URL}/profile/get`);
            setProfile(res.data.content);
            setForm({
                organizationName: res.data.content.organizationName || "",
                organizationType: res.data.content.organizationType || ORGANIZATION_TYPES.NGO,
                contactPerson: res.data.content.contactPerson || "",
                phoneNumber: res.data.content.phoneNumber || "",
                country: res.data.content.country || "",
            });
        } catch (err) {
            if (err.response?.status === 404) {
                setCreating(true);
            } else {
                setError("Failed to load profile.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const res = await api.post(`${BASE_URL}/profile/create-contributor`, form);
            setProfile(res.data.content);
            setCreating(false);
            showSuccess("Profile created successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const res = await api.patch(`${BASE_URL}/api/profile/update`, form);
            setProfile(res.data.content);
            setEditing(false);
            showSuccess("Profile updated successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const cancelEdit = () => {
        setEditing(false);
        setForm({
            organizationName: profile.organizationName || "",
            organizationType: profile.organizationType || ORGANIZATION_TYPES.NGO,
            contactPerson: profile.contactPerson || "",
            phoneNumber: profile.phoneNumber || "",
            country: profile.country || "",
        });
    };

    // ─── Field helpers ───────────────────────────────────────────────────────────




    // ─── Loading ─────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    const orgTypeOptions = Object.values(ORGANIZATION_TYPES).map((v) => ({
        value: v,
        label: v.charAt(0) + v.slice(1).toLowerCase(),
    }));

    const isFormMode = creating || editing;

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your Profile Details</p>
                </div>
                {profile && !editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Alerts */}
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="rounded-md border border-brand-blue/30 bg-brand-blue/10 px-4 py-3 text-sm text-brand-blue-deep">
                    {successMsg}
                </div>
            )}

            {/* Card */}
            <div className="rounded-xl border border-border bg-card shadow-sm">
                {/* Avatar bar */}
                <div className="flex items-center gap-4 border-b border-border px-6 py-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold select-none">
                        {(form.organizationName || form.contactPerson || user?.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-lg">
                            {profile?.organizationName || "New Organization"}
                        </p>
                        <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Content Contributor
              </span>
                            {profile?.verified ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-medium text-brand-blue-deep">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Verified
                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                  Pending Verification
                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    {isFormMode ? (
                        <form onSubmit={creating ? handleCreate : handleUpdate} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <InputField
                                    label="Organization Name *"
                                    name="organizationName"
                                    form={form}
                                    handleChange={handleChange}
                                    disabled={saving}
                                />
                                <InputField
                                    label="Organization Type *"
                                    name="organizationType"
                                    form={form}
                                    handleChange={handleChange}
                                    options={orgTypeOptions}
                                    disabled={saving}
                                />
                                <InputField label="Contact Person *" name="contactPerson" form={form}
                                            handleChange={handleChange} disabled={saving} />
                                <InputField label="Phone Number *" name="phoneNumber" type="tel" form={form}
                                            handleChange={handleChange} disabled={saving} />
                                <InputField label="Country *" name="country" form={form}
                                            handleChange={handleChange} disabled={saving} />
                            </div>

                            {creating && (
                                <p className="text-xs text-muted-foreground">
                                    Your organization will be reviewed for verification after profile creation.
                                </p>
                            )}

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
                                >
                                    {saving && (
                                        <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                                    )}
                                    {creating ? "Create Profile" : "Save Changes"}
                                </button>
                                {editing && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        disabled={saving}
                                        className="rounded-md border border-border px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <DisplayField label="Organization Name" value={profile?.organizationName} />
                            <DisplayField label="Organization Type" value={profile?.organizationType} />
                            <DisplayField label="Contact Person" value={profile?.contactPerson} />
                            <DisplayField label="Phone Number" value={profile?.phoneNumber} />
                            <DisplayField label="Country" value={profile?.country} />
                        </div>
                    )}
                </div>
            </div>

            {/* Forums Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">My Forums</h2>
                        <p className="text-muted-foreground mt-1">Forums you have created</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/forums/create')}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                        Create Forum
                    </button>
                </div>

                {forumsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                ) : userForums.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card px-6 py-8 text-center">
                        <p className="text-muted-foreground">No forums created yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Create your first forum to get started</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {userForums.map(forum => (
                            <div 
                                key={forum._id}
                                className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-foreground">{forum.name}</h3>
                                        <p className="text-muted-foreground mt-1 line-clamp-2">{forum.description}</p>
                                        <div className="flex gap-6 mt-3 text-sm text-muted-foreground">
                                            <span>👥 {forum.memberCount || 0} members</span>
                                            <span>📝 {forum.postCount || 0} posts</span>
                                            <span>📅 {new Date(forum.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => navigate(`/dashboard/forum/${forum._id}`)}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                            title="View Forum"
                                        >
                                            <Users size={18} />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/forums/${forum._id}/edit`)}
                                            className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"
                                            title="Edit Forum"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/forums/${forum._id}/members`)}
                                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                                            title="Manage Members"
                                        >
                                            <Users size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}