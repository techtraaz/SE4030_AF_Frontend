import { useState, useEffect } from "react";
import useAuth from '@/hooks/useAuth';
import { useForums } from '@/hooks/useForum';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

import api from '@/services/axios'

const BASE_URL = import.meta.env.VITE_API_URL;


const EDUCATION_LEVELS = {
    NONE: "NONE",
    PRIMARY: "PRIMARY",
    SECONDARY: "SECONDARY",
    TERTIARY: "TERTIARY",
    POSTGRADUATE: "POSTGRADUATE",
};

const EDUCATION_OPTIONS = Object.values(EDUCATION_LEVELS).map((v) => ({
    value: v,
    label: v.charAt(0) + v.slice(1).toLowerCase(),
}));

// ─── Extracted field components (outside parent to prevent focus loss) ────────

function InputField({ label, name, type = "text", value, onChange, disabled, options }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">{label}</label>
            {options ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
                />
            )}
        </div>
    );
}

function DisplayField({ label, value }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value || "—"}</span>
        </div>
    );
}

// ─── Onboarding stepper ───────────────────────────────────────────────────────

const ONBOARDING_STEPS = [
    {
        title: "Personal Information",
        description: "Tell us a little about yourself",
        fields: ["fullName", "dateOfBirth", "nic"],
    },
    {
        title: "Location Details",
        description: "Where are you from and where are you now?",
        fields: ["originCountry", "currentCountry", "livingCamp"],
    },
    {
        title: "Preferences",
        description: "Help us personalise your experience",
        fields: ["preferredLanguage", "educationLevel"],
    },
];

const FIELD_CONFIG = {
    fullName:          { label: "Full Name *",        type: "text" },
    dateOfBirth:       { label: "Date of Birth",      type: "date" },
    nic:               { label: "NIC / ID Number",    type: "text" },
    originCountry:     { label: "Origin Country *",   type: "text" },
    currentCountry:    { label: "Current Country *",  type: "text" },
    livingCamp:        { label: "Living Camp",        type: "text" },
    preferredLanguage: { label: "Preferred Language", type: "text" },
    educationLevel:    { label: "Education Level",    options: EDUCATION_OPTIONS },
};

function OnboardingForm({ form, onChange, onComplete, saving, error }) {
    const [step, setStep] = useState(0);
    const current = ONBOARDING_STEPS[step];
    const isLast = step === ONBOARDING_STEPS.length - 1;
    const progress = ((step + 1) / ONBOARDING_STEPS.length) * 100;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
            <div className="w-full max-w-lg space-y-6">
                {/* Header */}
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Welcome! Let's set up your profile</h1>
                    <p className="text-sm text-muted-foreground">This only takes a minute. You can update everything later.</p>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Step {step + 1} of {ONBOARDING_STEPS.length}</span>
                        <span>{Math.round(progress)}% complete</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-0 pt-1">
                        {ONBOARDING_STEPS.map((s, i) => (
                            <div key={i} className="flex items-center flex-1 last:flex-none">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors ${
                                    i < step
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : i === step
                                            ? "border-primary text-primary bg-background"
                                            : "border-muted-foreground/30 text-muted-foreground/40 bg-background"
                                }`}>
                                    {i < step ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    ) : i + 1}
                                </div>
                                {i < ONBOARDING_STEPS.length - 1 && (
                                    <div className={`h-px flex-1 mx-1 transition-colors ${i < step ? "bg-primary" : "bg-muted-foreground/20"}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card */}
                <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-5">
                    <div>
                        <h2 className="text-lg font-semibold">{current.title}</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">{current.description}</p>
                    </div>

                    {error && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {current.fields.map((name) => {
                            const cfg = FIELD_CONFIG[name];
                            return (
                                <InputField
                                    key={name}
                                    label={cfg.label}
                                    name={name}
                                    type={cfg.type}
                                    value={form[name]}
                                    onChange={onChange}
                                    options={cfg.options}
                                    disabled={saving}
                                />
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="button"
                            onClick={() => setStep((s) => s - 1)}
                            disabled={step === 0 || saving}
                            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Back
                        </button>
                        {isLast ? (
                            <button
                                type="button"
                                onClick={onComplete}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
                            >
                                {saving && (
                                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                                )}
                                Complete Setup
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setStep((s) => s + 1)}
                                className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Continue →
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    You can update these details anytime from your profile page.
                </p>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RefugeeProfile() {
    const { user, status } = useAuth();
    const navigate = useNavigate();
    const { userForums, getUserForums, isLoading: forumsLoading } = useForums();

    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [onboarding, setOnboarding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const emptyForm = {
        fullName: "", nic: "", originCountry: "", currentCountry: "",
        livingCamp: "", preferredLanguage: "",
        educationLevel: EDUCATION_LEVELS.NONE, dateOfBirth: "",
    };

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        if (status !== "authenticated") return;
        fetchProfile();
        getUserForums(); // Fetch joined forums
    }, [status]);

    const toForm = (data) => ({

        fullName: data.fullName || "",
        nic: data.nic || "",
        originCountry: data.originCountry || "",
        currentCountry: data.currentCountry || "",
        livingCamp: data.livingCamp || "",
        preferredLanguage: data.preferredLanguage || "",
        educationLevel: data.educationLevel || EDUCATION_LEVELS.NONE,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : "",
    });



    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`${BASE_URL}/profile/get`);
            setProfile(res.data.content);
            setForm(toForm(res.data.content));
        } catch (err) {
            console.log(err)
            if (err.response?.status === 404) {
                setOnboarding(true);
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

    const handleCreate = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await api.post(`${BASE_URL}/profile/create-refugee`, form);
            setProfile(res.data.content);
            setOnboarding(false);
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
            const res = await api.patch(`${BASE_URL}/profile/update`, form);
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
        setError(null);
        setForm(toForm(profile));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (onboarding) {
        return (
            <OnboardingForm
                form={form}
                onChange={handleChange}
                onComplete={handleCreate}
                saving={saving}
                error={error}
            />
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your Profile Details</p>
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit Profile
                    </button>
                )}
            </div>

            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="rounded-md border border-brand-blue/30 bg-brand-blue/10 px-4 py-3 text-sm text-brand-blue">
                    {successMsg}
                </div>
            )}

            <div className="rounded-xl border border-border bg-card shadow-sm">
                {/* Avatar bar */}
                <div className="flex items-center gap-4 border-b border-border px-6 py-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold select-none">
                        {(profile?.fullName || user?.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-lg">{profile?.fullName}</p>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            Refugee
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    {editing ? (
                        <form onSubmit={handleUpdate} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <InputField label="Full Name *"       name="fullName"          value={form.fullName}          onChange={handleChange} disabled={saving} />
                                <InputField label="NIC"               name="nic"               value={form.nic}               onChange={handleChange} disabled={saving} />
                                <InputField label="Origin Country *"  name="originCountry"     value={form.originCountry}     onChange={handleChange} disabled={saving} />
                                <InputField label="Current Country *" name="currentCountry"    value={form.currentCountry}    onChange={handleChange} disabled={saving} />
                                <InputField label="Living Camp"       name="livingCamp"        value={form.livingCamp}        onChange={handleChange} disabled={saving} />
                                <InputField label="Preferred Language" name="preferredLanguage" value={form.preferredLanguage} onChange={handleChange} disabled={saving} />
                                <InputField label="Education Level"   name="educationLevel"    value={form.educationLevel}    onChange={handleChange} options={EDUCATION_OPTIONS} disabled={saving} />
                                <InputField label="Date of Birth"     name="dateOfBirth"       value={form.dateOfBirth}       onChange={handleChange} type="date" disabled={saving} />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
                                >
                                    {saving && <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />}
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={saving}
                                    className="rounded-md border border-border px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <DisplayField label="Full Name"         value={profile?.fullName} />
                            <DisplayField label="NIC"               value={profile?.nic} />
                            <DisplayField label="Origin Country"    value={profile?.originCountry} />
                            <DisplayField label="Current Country"   value={profile?.currentCountry} />
                            <DisplayField label="Living Camp"       value={profile?.livingCamp} />
                            <DisplayField label="Preferred Language" value={profile?.preferredLanguage} />
                            <DisplayField label="Education Level"   value={profile?.educationLevel} />
                            <DisplayField
                                label="Date of Birth"
                                value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Joined Forums Section */}
            <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="border-b border-border px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">Joined Forums</h2>
                            <p className="text-muted-foreground text-sm mt-1">Community forums you've joined</p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/forum')}
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                            Explore Forums
                        </button>
                    </div>
                </div>

                <div className="px-6 py-6">
                    {forumsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        </div>
                    ) : userForums.length === 0 ? (
                        <div className="rounded-lg border border-border bg-muted/50 px-6 py-8 text-center">
                            <p className="text-muted-foreground">You haven't joined any forums yet</p>
                            <p className="text-sm text-muted-foreground mt-1">Join forums from the Community Forums section to connect with others</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {userForums.map(forum => (
                                <div 
                                    key={forum._id}
                                    className="rounded-lg border border-border bg-muted/30 p-4 hover:bg-muted/50 transition cursor-pointer"
                                    onClick={() => navigate(`/dashboard/forum/${forum._id}`)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground line-clamp-1">{forum.name}</h3>
                                            <p className="text-muted-foreground text-sm line-clamp-1 mt-1">{forum.description}</p>
                                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Users size={14} />
                                                    {forum.memberCount || 0} members
                                                </span>
                                                <span>📝 {forum.postCount || 0} posts</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/dashboard/forum/${forum._id}`);
                                            }}
                                            className="px-3 py-1 bg-primary text-white text-xs rounded font-medium hover:bg-primary/90 transition whitespace-nowrap"
                                        >
                                            View
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}