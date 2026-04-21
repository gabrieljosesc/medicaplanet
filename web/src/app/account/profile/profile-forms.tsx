"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import {
  removeAvatar,
  updateProfile,
  uploadAvatar,
  type ActionState,
} from "@/app/actions/account";

export function ProfileForms({
  profile,
  emailMasked,
  emailNote,
}: {
  profile: {
    full_name: string;
    first_name: string;
    last_name: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    avatar_url: string | null;
  };
  emailMasked: string;
  emailNote: string;
}) {
  const [profileState, profileAction] = useActionState(updateProfile, {} as ActionState);
  const [avatarState, avatarAction] = useActionState(uploadAvatar, {} as ActionState);
  const [removeAvatarState, removeAvatarAction] = useActionState(removeAvatar, {} as ActionState);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
      <div className="space-y-6">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Personal details</h2>
          <form action={profileAction} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-zinc-700">First name</span>
                <input
                  name="first_name"
                  defaultValue={profile.first_name}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  autoComplete="given-name"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-zinc-700">Last name</span>
                <input
                  name="last_name"
                  defaultValue={profile.last_name}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  autoComplete="family-name"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium text-zinc-700">Display name</span>
              <input
                name="full_name"
                required
                defaultValue={profile.full_name}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                autoComplete="name"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-zinc-700">Phone</span>
                <input
                  name="phone"
                  defaultValue={profile.phone}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  autoComplete="tel"
                />
              </label>
              <fieldset className="text-sm">
                <legend className="font-medium text-zinc-700">Gender</legend>
                <div className="mt-2 flex flex-wrap gap-3">
                  {[
                    ["", "Prefer not to say"],
                    ["male", "Male"],
                    ["female", "Female"],
                    ["other", "Other"],
                  ].map(([value, label]) => (
                    <label key={value || "x"} className="inline-flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="gender"
                        value={value}
                        defaultChecked={profile.gender === value}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <label className="block text-sm">
              <span className="font-medium text-zinc-700">Date of birth</span>
              <input
                type="date"
                name="date_of_birth"
                defaultValue={profile.date_of_birth ? String(profile.date_of_birth).slice(0, 10) : ""}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 text-sm sm:max-w-sm"
              />
            </label>
            {profileState.error ? (
              <p className="text-sm text-red-600">{profileState.error}</p>
            ) : null}
            {profileState.ok ? <p className="text-sm text-emerald-800">{profileState.ok}</p> : null}
            <div className="pt-1 text-center">
              <button
                type="submit"
                className="rounded-full bg-emerald-800 px-8 py-2 text-sm font-medium text-white hover:bg-emerald-900"
              >
                Save
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Email</h2>
          <p className="mt-1 text-sm text-zinc-600">{emailNote}</p>
          <p className="mt-3 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-800">
            {emailMasked}
          </p>
        </section>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:max-w-[280px]">
        <h2 className="text-lg font-semibold text-zinc-900">Photo</h2>
        <p className="mt-1 text-xs text-zinc-500">JPEG or PNG, max 1 MB.</p>
        <div className="relative mx-auto mt-4 aspect-square w-40 overflow-hidden rounded-full bg-zinc-100 ring-2 ring-zinc-200">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt=""
              fill
              className="object-cover"
              sizes="160px"
              unoptimized={profile.avatar_url.includes("%")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-emerald-800">
              {(profile.full_name || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        {profile.avatar_url ? (
          <div className="mt-2 text-center">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              title="Remove photo"
              onClick={() => setConfirmRemoveOpen(true)}
            >
              <span className="text-sm leading-none">X</span> Remove photo
            </button>
          </div>
        ) : null}
        <form action={avatarAction} className="mt-4 space-y-2">
          <input
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="w-full text-xs text-zinc-600 file:mr-2 file:rounded-md file:border file:border-zinc-300 file:bg-white file:px-2 file:py-1"
          />
          {avatarState.error ? <p className="text-xs text-red-600">{avatarState.error}</p> : null}
          {avatarState.ok ? <p className="text-xs text-emerald-800">{avatarState.ok}</p> : null}
          {removeAvatarState.error ? (
            <p className="text-xs text-red-600">{removeAvatarState.error}</p>
          ) : null}
          {removeAvatarState.ok ? (
            <p className="text-xs text-emerald-800">{removeAvatarState.ok}</p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-full border border-emerald-800 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
          >
            Upload photo
          </button>
        </form>
      </div>
      {confirmRemoveOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">Remove profile photo?</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Are you sure you want to remove your profile photo?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmRemoveOpen(false)}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <form
                action={removeAvatarAction}
                onSubmit={() => {
                  setConfirmRemoveOpen(false);
                }}
              >
                <button
                  type="submit"
                  className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900"
                >
                  Yes, remove
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
